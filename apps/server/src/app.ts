import Fastify, { type FastifyRequest } from "fastify";
import { createSessionToken, verifySessionToken } from "./auth/session.js";
import { validateTelegramInitData } from "./auth/telegram-init-data.js";
import {
  getUserProfile,
  saveBirthProfile,
  upsertTelegramUser,
  type BirthProfileInput,
} from "./modules/users/repository.js";

interface AppOptions {
  botToken?: string;
  sessionSecret?: string;
  webAppOrigin?: string;
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
      ],
    },
  });

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
        .header("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
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

      if (
        !displayName ||
        !birthDate ||
        !isValidDate(birthDate) ||
        birthTime === null ||
        birthPlace === null ||
        birthTimeZone === null ||
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

  return app;
}
