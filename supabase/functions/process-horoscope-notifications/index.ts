import process from "node:process";
import { Bot } from "grammy";
import { createAIProviderFromEnv } from "../../../apps/server/dist/modules/ai/provider.js";
import {
  generateDailyHoroscope,
} from "../../../apps/server/dist/modules/horoscope/service.js";
import {
  claimHoroscopeNotification,
  listDueHoroscopeNotifications,
  markHoroscopeNotificationSent,
  releaseHoroscopeNotification,
} from "../../../apps/server/dist/modules/horoscope/repository.js";
import { hydrateNodeEnvironment } from "../_shared/runtime-env.ts";
import { hasValidSecretHeader } from "../_shared/security.ts";

const ENV_KEYS = [
  "DATABASE_URL",
  "TELEGRAM_BOT_TOKEN",
  "SESSION_SECRET",
  "TELEGRAM_WEBAPP_URL",
  "WEBAPP_ORIGIN",
  "AI_PROVIDER",
  "AI_API_KEY",
  "AI_MODEL",
  "AI_BASE_URL",
  "HOROSCOPE_DEFAULT_TIME_ZONE",
  "AI_FREE_DAILY_LIMIT",
  "AI_PREMIUM_DAILY_LIMIT",
  "AI_MAX_INPUT_CHARS",
  "AI_MAX_HISTORY_MESSAGES",
  "AI_MAX_OUTPUT_TOKENS",
  "AI_REQUEST_TIMEOUT_MS",
  "LOG_LEVEL",
  "DATABASE_POOL_MAX",
] as const;

let workerPromise: Promise<{ bot: Bot; provider: ReturnType<typeof createAIProviderFromEnv> }> | null = null;

async function getWorker() {
  if (!workerPromise) {
    workerPromise = (async () => {
      hydrateNodeEnvironment(process, ENV_KEYS);
      const token = Deno.env.get("TELEGRAM_BOT_TOKEN");
      if (!token) throw new Error("telegram_bot_not_configured");
      const [{ Bot: TelegramBot }] = await Promise.all([import("grammy")]);
      return { bot: new TelegramBot(token), provider: createAIProviderFromEnv() };
    })().catch((error) => {
      workerPromise = null;
      throw error;
    });
  }
  return workerPromise;
}

Deno.serve(async (request) => {
  if (request.method !== "POST") {
    return Response.json({ error: "method_not_allowed" }, { status: 405 });
  }
  const cronSecret = Deno.env.get("HOROSCOPE_CRON_SECRET") ?? "";
  if (!hasValidSecretHeader(request, "x-cron-secret", cronSecret)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const { bot, provider } = await getWorker();
    if (!provider) return Response.json({ error: "ai_provider_not_configured" }, { status: 503 });

    // Small bounded batch keeps each invocation under serverless wall-clock limits.
    const due = await listDueHoroscopeNotifications(3);
    let sent = 0;
    let skipped = 0;
    let failed = 0;

    for (const item of due) {
      const claimed = await claimHoroscopeNotification(item.telegramId, item.localDate);
      if (!claimed) {
        skipped += 1;
        continue;
      }
      try {
        const horoscope = await generateDailyHoroscope(item.telegramId, item.timeZone, provider, item.localDate);
        const message = [
          `☾ Гороскоп на ${item.localDate}`,
          "",
          horoscope.content,
          "",
          "Это символическая подсказка для саморефлексии, а не прогноз неизбежных событий.",
          Deno.env.get("TELEGRAM_WEBAPP_URL") ? `Открыть журнал: ${Deno.env.get("TELEGRAM_WEBAPP_URL")}` : "",
        ].filter(Boolean).join("\n").slice(0, 3900);
        await bot.api.sendMessage(item.telegramId, message, {
          link_preview_options: { is_disabled: true },
        });
        await markHoroscopeNotificationSent(item.telegramId, item.localDate);
        sent += 1;
      } catch (error) {
        await releaseHoroscopeNotification(item.telegramId, item.localDate).catch(() => undefined);
        failed += 1;
        console.warn("Horoscope notification failed", error instanceof Error ? error.name : "unknown");
      }
    }
    return Response.json({ ok: true, sent, skipped, failed });
  } catch (error) {
    console.error("Horoscope notification worker failed", error instanceof Error ? error.name : "unknown");
    return Response.json({ error: "worker_failed" }, { status: 503 });
  }
});
