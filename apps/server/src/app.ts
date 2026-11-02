import Fastify, { type FastifyRequest } from "fastify";
import { createSessionToken, verifySessionToken } from "./auth/session.js";
import { validateTelegramInitData } from "./auth/telegram-init-data.js";
import {
  getUserProfile,
  saveBirthProfile,
  upsertTelegramUser,
  type BirthProfileInput,
} from "./modules/users/repository.js";
import { getTarotSpread, isTarotSpreadId, tarotSpreads } from "./modules/tarot/spreads.js";
import { NatalCalculationError } from "./modules/astrology/calculator.js";
import { getOrCreateNatalChart } from "./modules/astrology/repository.js";
import {
  AIServiceError,
  listAstrologerConversations,
  sendAstrologerMessage,
} from "./modules/ai/service.js";
import { createAIProviderFromEnv } from "./modules/ai/provider.js";
import { getAIServiceConfig } from "./modules/ai/config.js";
import { astrologerScenarios } from "./modules/ai/scenarios.js";
import { AIProviderError, type AIChatProvider } from "./modules/ai/types.js";
import {
  getAIConversation,
  getAIUsage,
  deleteAIConversation,
} from "./modules/ai/repository.js";
import {
  createTarotReading,
  getTarotReading,
  listTarotReadings,
} from "./modules/tarot/repository.js";

interface AppOptions {
  botToken?: string;
  sessionSecret?: string;
  webAppOrigin?: string;
  aiProvider?: AIChatProvider | null;
  aiFreeDailyLimit?: number;
  aiPremiumDailyLimit?: number;
}

interface AuthBody {
  initData?: unknown;
}

interface OnboardingBody {
  displayName?: unknown;
  birthDate?: unknown;
  birthTime?: unknown;
  birthPlace?: unknown;
  birthTimeZone?: unknown;
  birthLatitude?: unknown;
  birthLongitude?: unknown;
}

interface CreateTarotReadingBody {
  spreadId?: unknown;
}

interface AIChatBody {
  message?: unknown;
  conversationId?: unknown;
  scenarioId?: unknown;
}

function getBearerToken(request: FastifyRequest): string | null {
  const header = request.headers.authorization;
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice("Bearer ".length).trim() || null;
}

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.valueOf()) &&
    parsed.toISOString().slice(0, 10) === value;
}

function isValidTime(value: string): boolean {
  return /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value);
}

function normalizeOptionalCoordinate(
  value: unknown,
  minimum: number,
  maximum: number,
): number | undefined | null {
  if (value === undefined || value === null || value === "") return undefined;
  const parsed = typeof value === "number"
    ? value
    : typeof value === "string"
      ? Number(value.trim())
      : Number.NaN;
  if (!Number.isFinite(parsed) || parsed < minimum || parsed > maximum) return null;
  return parsed;
}

function normalizeOptionalString(
  value: unknown,
  maxLength: number,
): string | undefined | null {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  if (!normalized || normalized.length > maxLength) return null;
  return normalized;
}

export function buildApp(options: AppOptions = {}) {
  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL ?? "info",
      redact: [
        "req.headers.authorization",
        "req.headers.cookie",
        "req.body.initData",
        "req.body.message",
      ],
    },
  });

  const aiConfig = getAIServiceConfig();
  const aiProvider = options.aiProvider === undefined
    ? createAIProviderFromEnv()
    : options.aiProvider;
  const aiFreeDailyLimit = options.aiFreeDailyLimit ?? aiConfig.freeDailyLimit;
  const aiPremiumDailyLimit = options.aiPremiumDailyLimit ?? aiConfig.premiumDailyLimit;

  const allowedOrigins = new Set(
    [
      options.webAppOrigin,
      "http://localhost:5173",
      "http://127.0.0.1:5173",
    ].filter((value): value is string => Boolean(value)),
  );

  app.addHook("onRequest", async (request, reply) => {
    const origin = request.headers.origin;
    if (origin && allowedOrigins.has(origin)) {
      reply
        .header("Access-Control-Allow-Origin", origin)
        .header("Vary", "Origin")
        .header("Access-Control-Allow-Headers", "Authorization, Content-Type")
        .header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    }

    if (request.method === "OPTIONS") {
      return reply.code(204).send();
    }
  });

  function getTelegramId(request: FastifyRequest): string | null {
    if (!options.sessionSecret) return null;
    const token = getBearerToken(request);
    return token
      ? verifySessionToken(token, options.sessionSecret)
      : null;
  }

  app.get("/health", async () => ({
    status: "ok",
    service: "personal-cosmic-journal-api",
    database: process.env.DATABASE_URL ? "configured" : "development-memory",
  }));

  app.get("/api/tarot/spreads", async () => ({ spreads: tarotSpreads }));

  app.post("/api/astrology/natal-chart", async (request, reply) => {
    const telegramId = getTelegramId(request);
    if (!telegramId) return reply.code(401).send({ error: "unauthorized" });

    try {
      const chart = await getOrCreateNatalChart(telegramId);
      return { chart };
    } catch (error) {
      if (error instanceof NatalCalculationError) {
        return reply.code(422).send({
          error: error.code,
          message: error.message,
        });
      }
      if (error instanceof Error && error.message === "Birth profile is required before calculating a natal chart") {
        return reply.code(409).send({
          error: "birth_profile_required",
          message: "Сначала заполни дату рождения в профиле.",
        });
      }
      if (error instanceof Error && error.message === "User not found") {
        return reply.code(404).send({ error: "user_not_found" });
      }
      request.log.error({ err: error }, "Unable to calculate natal chart");
      return reply.code(503).send({
        error: "natal_chart_unavailable",
        message: "Не удалось рассчитать натальную карту. Попробуй ещё раз.",
      });
    }
  });


  app.post<{ Body: AuthBody }>(
    "/api/auth/telegram",
    async (request, reply) => {
      if (!options.botToken || !options.sessionSecret) {
        return reply.code(503).send({
          error: "telegram_auth_not_configured",
          message: "Telegram authentication is not configured on the server.",
        });
      }

      const initData = request.body?.initData;
      if (typeof initData !== "string" || initData.length === 0) {
        return reply.code(400).send({
          error: "init_data_required",
          message: "Telegram WebApp initData is required.",
        });
      }

      const validated = validateTelegramInitData(initData, options.botToken);
      if (!validated) {
        return reply.code(401).send({
          error: "invalid_telegram_init_data",
          message: "Telegram authorization data is invalid or expired. Reopen the Mini App from Telegram.",
        });
      }

      try {
        const profile = await upsertTelegramUser({
          telegramId: String(validated.user.id),
          firstName: validated.user.first_name,
          lastName: validated.user.last_name,
          username: validated.user.username,
          languageCode: validated.user.language_code,
        });
        const accessToken = createSessionToken(
          profile.telegramId,
          options.sessionSecret,
        );

        return {
          accessToken,
          user: profile,
        };
      } catch (error) {
        request.log.error({ err: error }, "Telegram user upsert failed");
        return reply.code(503).send({
          error: "user_storage_unavailable",
          message: "User storage is not available. Please try again later.",
        });
      }
    },
  );

  app.get("/api/me", async (request, reply) => {
    const telegramId = getTelegramId(request);
    if (!telegramId) {
      return reply.code(401).send({ error: "unauthorized" });
    }

    try {
      const profile = await getUserProfile(telegramId);
      if (!profile) return reply.code(404).send({ error: "user_not_found" });
      return { user: profile };
    } catch (error) {
      request.log.error({ err: error }, "Unable to load user profile");
      return reply.code(503).send({ error: "user_storage_unavailable" });
    }
  });

  app.put<{ Body: OnboardingBody }>(
    "/api/me/onboarding",
    async (request, reply) => {
      const telegramId = getTelegramId(request);
      if (!telegramId) {
        return reply.code(401).send({ error: "unauthorized" });
      }

      const displayName = normalizeOptionalString(request.body?.displayName, 48);
      const birthDate =
        typeof request.body?.birthDate === "string"
          ? request.body.birthDate
          : null;
      const birthTime = normalizeOptionalString(request.body?.birthTime, 5);
      const birthPlace = normalizeOptionalString(request.body?.birthPlace, 160);
      const birthTimeZone = normalizeOptionalString(request.body?.birthTimeZone, 64);
      const birthLatitude = normalizeOptionalCoordinate(request.body?.birthLatitude, -90, 90);
      const birthLongitude = normalizeOptionalCoordinate(request.body?.birthLongitude, -180, 180);

      if (
        !displayName ||
        !birthDate ||
        !isValidDate(birthDate) ||
        birthTime === null ||
        birthPlace === null ||
        birthTimeZone === null ||
        birthLatitude === null ||
        birthLongitude === null ||
        ((birthLatitude === undefined) !== (birthLongitude === undefined)) ||
        (birthTime !== undefined && !isValidTime(birthTime))
      ) {
        return reply.code(400).send({
          error: "invalid_onboarding_data",
          message: "Check the name, birth date, time, place and time zone fields.",
        });
      }

      if (birthTimeZone !== undefined) {
        try {
          new Intl.DateTimeFormat("en", { timeZone: birthTimeZone }).format();
        } catch {
          return reply.code(400).send({
            error: "invalid_time_zone",
            message: "Use a valid IANA time zone, for example Europe/Tallinn.",
          });
        }
      }

      const input: BirthProfileInput = {
        displayName,
        birthDate,
        ...(birthTime ? { birthTime } : {}),
        ...(birthPlace ? { birthPlace } : {}),
        ...(birthTimeZone ? { birthTimeZone } : {}),
        ...(birthLatitude !== undefined ? { birthLatitude } : {}),
        ...(birthLongitude !== undefined ? { birthLongitude } : {}),
      };

      try {
        const user = await saveBirthProfile(telegramId, input);
        return { user };
      } catch (error) {
        request.log.error({ err: error }, "Unable to save onboarding profile");
        return reply.code(503).send({ error: "user_storage_unavailable" });
      }
    },
  );

  app.post<{ Body: CreateTarotReadingBody }>(
    "/api/tarot/readings",
    async (request, reply) => {
      const telegramId = getTelegramId(request);
      if (!telegramId) return reply.code(401).send({ error: "unauthorized" });
      if (!isTarotSpreadId(request.body?.spreadId)) {
        return reply.code(400).send({
          error: "invalid_spread",
          message: "Choose one of the supported tarot spreads.",
        });
      }

      try {
        const reading = await createTarotReading(telegramId, request.body.spreadId);
        return { reading };
      } catch (error) {
        request.log.error({ err: error }, "Unable to create tarot reading");
        return reply.code(503).send({
          error: "tarot_storage_unavailable",
          message: "Не удалось сохранить расклад. Попробуй ещё раз.",
        });
      }
    },
  );

  app.get("/api/tarot/readings", async (request, reply) => {
    const telegramId = getTelegramId(request);
    if (!telegramId) return reply.code(401).send({ error: "unauthorized" });

    try {
      const readings = await listTarotReadings(telegramId);
      return { readings };
    } catch (error) {
      request.log.error({ err: error }, "Unable to load tarot journal");
      return reply.code(503).send({ error: "tarot_storage_unavailable" });
    }
  });

  app.get<{ Params: { id: string } }>("/api/tarot/readings/:id", async (request, reply) => {
    const telegramId = getTelegramId(request);
    if (!telegramId) return reply.code(401).send({ error: "unauthorized" });

    try {
      const reading = await getTarotReading(telegramId, request.params.id);
      if (!reading) return reply.code(404).send({ error: "reading_not_found" });
      return { reading };
    } catch (error) {
      request.log.error({ err: error }, "Unable to load tarot reading");
      return reply.code(503).send({ error: "tarot_storage_unavailable" });
    }
  });


  app.get("/api/ai/status", async (request, reply) => {
    const telegramId = getTelegramId(request);
    if (!telegramId) return reply.code(401).send({ error: "unauthorized" });

    try {
      const profile = await getUserProfile(telegramId);
      if (!profile) return reply.code(404).send({ error: "user_not_found" });
      const limit = profile.plan === "premium" ? aiPremiumDailyLimit : aiFreeDailyLimit;
      const usage = await getAIUsage(
        telegramId,
        profile.plan,
        aiFreeDailyLimit,
        aiPremiumDailyLimit,
      );

      return {
        available: Boolean(aiProvider),
        provider: aiProvider?.name ?? null,
        plan: profile.plan,
        usage,
        maxInputChars: aiConfig.maxInputChars,
        scenarios: astrologerScenarios.map(({ id, title, starter }) => ({ id, title, starter })),
        quotaResetTimeZone: "UTC",
        dailyLimitConfigured: limit,
      };
    } catch (error) {
      request.log.error({ errorCode: "ai_status_unavailable" }, "Unable to load AI status");
      return reply.code(503).send({ error: "ai_status_unavailable" });
    }
  });

  app.get("/api/ai/conversations", async (request, reply) => {
    const telegramId = getTelegramId(request);
    if (!telegramId) return reply.code(401).send({ error: "unauthorized" });

    try {
      const conversations = await listAstrologerConversations(telegramId);
      return { conversations };
    } catch {
      request.log.error({ errorCode: "ai_history_unavailable" }, "Unable to list AI conversations");
      return reply.code(503).send({ error: "ai_history_unavailable" });
    }
  });

  app.get<{ Params: { id: string } }>("/api/ai/conversations/:id", async (request, reply) => {
    const telegramId = getTelegramId(request);
    if (!telegramId) return reply.code(401).send({ error: "unauthorized" });

    try {
      const conversation = await getAIConversation(telegramId, request.params.id, 60);
      if (!conversation) return reply.code(404).send({ error: "conversation_not_found" });
      return { conversation };
    } catch {
      request.log.error({ errorCode: "ai_history_unavailable" }, "Unable to load AI conversation");
      return reply.code(503).send({ error: "ai_history_unavailable" });
    }
  });

  app.delete<{ Params: { id: string } }>("/api/ai/conversations/:id", async (request, reply) => {
    const telegramId = getTelegramId(request);
    if (!telegramId) return reply.code(401).send({ error: "unauthorized" });

    try {
      const deleted = await deleteAIConversation(telegramId, request.params.id);
      if (!deleted) return reply.code(404).send({ error: "conversation_not_found" });
      return { deleted: true };
    } catch {
      request.log.error({ errorCode: "ai_delete_failed" }, "Unable to delete AI conversation");
      return reply.code(503).send({ error: "ai_delete_failed" });
    }
  });

  app.post<{ Body: AIChatBody }>("/api/ai/chat", async (request, reply) => {
    const telegramId = getTelegramId(request);
    if (!telegramId) return reply.code(401).send({ error: "unauthorized" });

    const message = request.body?.message;
    const conversationId = request.body?.conversationId;
    const scenarioId = request.body?.scenarioId;

    if (
      typeof message !== "string" ||
      (conversationId !== undefined && typeof conversationId !== "string") ||
      (scenarioId !== undefined && typeof scenarioId !== "string")
    ) {
      return reply.code(400).send({ error: "invalid_chat_payload" });
    }

    try {
      const profile = await getUserProfile(telegramId);
      if (!profile) return reply.code(404).send({ error: "user_not_found" });

      const result = await sendAstrologerMessage(
        telegramId,
        profile.plan,
        {
          message,
          ...(typeof conversationId === "string" ? { conversationId } : {}),
          ...(typeof scenarioId === "string" ? { scenarioId } : {}),
        },
        aiProvider,
        { freeDailyLimit: aiFreeDailyLimit, premiumDailyLimit: aiPremiumDailyLimit },
      );
      return result;
    } catch (error) {
      if (error instanceof AIServiceError) {
        return reply.code(error.statusCode).send({
          error: error.code,
          message: error.message,
          ...(error.usage ? { usage: error.usage } : {}),
        });
      }
      if (error instanceof AIProviderError) {
        request.log.warn({
          aiErrorCode: error.code,
          providerRequestId: error.requestId,
        }, "AI provider request failed");
        return reply.code(503).send({
          error: "ai_provider_unavailable",
          message: "Астролог сейчас не может ответить. Попробуй ещё раз немного позже.",
        });
      }
      request.log.error({ errorCode: "ai_chat_unavailable" }, "Unable to complete AI chat request");
      return reply.code(503).send({
        error: "ai_chat_unavailable",
        message: "Не удалось сохранить диалог. Попробуй ещё раз.",
      });
    }
  });


  return app;
}
