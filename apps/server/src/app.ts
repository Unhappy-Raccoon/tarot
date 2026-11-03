import { getRuntimeEnv } from "./config/env.js";
import Fastify, { type FastifyRequest, type FastifyServerFactory } from "fastify";
import { checkDatabaseReadiness } from "./db/index.js";
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
import {
  HoroscopeServiceError,
  generateDailyHoroscope,
} from "./modules/horoscope/service.js";
import {
  getHoroscopePreferences,
  listDailyHoroscopes,
  saveHoroscopePreferences,
} from "./modules/horoscope/repository.js";
import { isValidTimeZone } from "./modules/astrology/transits.js";
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
  serverFactory?: FastifyServerFactory;
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
    ...(options.serverFactory ? { serverFactory: options.serverFactory } : {}),
    logger: {
      level: getRuntimeEnv("LOG_LEVEL") ?? "info",
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

  // Liveness only: this endpoint stays available while dependencies recover.
  app.get("/health", async () => ({
    status: "ok",
    service: "personal-cosmic-journal-api",
  }));

  // Readiness verifies the persistent schema and integrations needed for a real test launch.
  app.get("/health/ready", async (_request, reply) => {
    const database = await checkDatabaseReadiness();
    let webAppReady = false;
    try {
      const telegramWebAppUrl = getRuntimeEnv("TELEGRAM_WEBAPP_URL");
      const webUrl = telegramWebAppUrl ? new URL(telegramWebAppUrl) : null;
      const origin = options.webAppOrigin ? new URL(options.webAppOrigin) : null;
      webAppReady = Boolean(
        webUrl && origin &&
        webUrl.protocol === "https:" && origin.protocol === "https:" &&
        origin.origin === options.webAppOrigin && webUrl.origin === origin.origin
      );
    } catch {
      webAppReady = false;
    }

    const checks = {
      database: {
        ready: database.ready,
        connected: database.connected,
        configured: database.configured,
        missingTables: database.missingTables,
      },
      telegramBot: Boolean(options.botToken),
      sessionAuth: Boolean(options.sessionSecret && options.sessionSecret.length >= 32),
      webApp: webAppReady,
      aiProvider: Boolean(aiProvider),
    };
    const ready = database.ready && checks.telegramBot &&
      checks.sessionAuth && checks.webApp && checks.aiProvider;

    if (!ready) reply.code(503);
    return {
      status: ready ? "ready" : "not_ready",
      service: "personal-cosmic-journal-api",
      checks,
    };
  });

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


  app.get("/api/horoscope/today", async (request, reply) => {
    const telegramId = getTelegramId(request);
    if (!telegramId) return reply.code(401).send({ error: "unauthorized" });
    const query = request.query as { timeZone?: unknown };
    const timeZone = typeof query.timeZone === "string"
      ? query.timeZone
      : getRuntimeEnv("HOROSCOPE_DEFAULT_TIME_ZONE") ?? "Europe/Tallinn";

    try {
      const horoscope = await generateDailyHoroscope(telegramId, timeZone, aiProvider);
      return { horoscope };
    } catch (error) {
      if (error instanceof HoroscopeServiceError) {
        return reply.code(error.statusCode).send({ error: error.code, message: error.message });
      }
      if (error instanceof AIProviderError) {
        request.log.warn({
          aiErrorCode: error.code,
          providerRequestId: error.requestId,
        }, "Daily horoscope provider request failed");
        return reply.code(503).send({
          error: "horoscope_provider_unavailable",
          message: "Сейчас не удалось подготовить гороскоп. Попробуй немного позже.",
        });
      }
      request.log.error({ errorCode: "daily_horoscope_unavailable" }, "Unable to generate daily horoscope");
      return reply.code(503).send({
        error: "daily_horoscope_unavailable",
        message: "Не удалось подготовить гороскоп. Попробуй ещё раз.",
      });
    }
  });

  app.get("/api/horoscope/history", async (request, reply) => {
    const telegramId = getTelegramId(request);
    if (!telegramId) return reply.code(401).send({ error: "unauthorized" });
    try {
      const history = await listDailyHoroscopes(telegramId, 30);
      return { history };
    } catch {
      request.log.error({ errorCode: "horoscope_history_unavailable" }, "Unable to load horoscope history");
      return reply.code(503).send({ error: "horoscope_history_unavailable" });
    }
  });

  app.get("/api/horoscope/preferences", async (request, reply) => {
    const telegramId = getTelegramId(request);
    if (!telegramId) return reply.code(401).send({ error: "unauthorized" });
    const query = request.query as { timeZone?: unknown };
    const suggestedTimeZone = typeof query.timeZone === "string" &&
      isValidTimeZone(query.timeZone)
      ? query.timeZone
      : getRuntimeEnv("HOROSCOPE_DEFAULT_TIME_ZONE") ?? "Europe/Tallinn";
    try {
      const preferences = await getHoroscopePreferences(telegramId, suggestedTimeZone);
      return { preferences };
    } catch {
      request.log.error({ errorCode: "horoscope_preferences_unavailable" }, "Unable to load horoscope preferences");
      return reply.code(503).send({ error: "horoscope_preferences_unavailable" });
    }
  });

  app.put<{ Body: { timeZone?: unknown; notificationsEnabled?: unknown; notificationTime?: unknown } }>(
    "/api/horoscope/preferences",
    async (request, reply) => {
      const telegramId = getTelegramId(request);
      if (!telegramId) return reply.code(401).send({ error: "unauthorized" });
      const timeZone = request.body?.timeZone;
      const notificationsEnabled = request.body?.notificationsEnabled;
      const notificationTime = request.body?.notificationTime ?? "09:00";
      if (
        typeof timeZone !== "string" ||
        !isValidTimeZone(timeZone) ||
        typeof notificationsEnabled !== "boolean" ||
        typeof notificationTime !== "string" ||
        !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(notificationTime)
      ) {
        return reply.code(400).send({
          error: "invalid_horoscope_preferences",
          message: "Проверь часовой пояс, время и настройку уведомлений.",
        });
      }
      try {
        const preferences = await saveHoroscopePreferences(telegramId, {
          timeZone,
          notificationsEnabled,
          notificationTime,
        });
        return { preferences };
      } catch {
        request.log.error({ errorCode: "horoscope_preferences_save_failed" }, "Unable to save horoscope preferences");
        return reply.code(503).send({ error: "horoscope_preferences_save_failed" });
      }
    },
  );

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
