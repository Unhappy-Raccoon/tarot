import process from "node:process";
import { Bot } from "grammy";
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

let workerPromise: Promise<{
  bot: Bot;
  provider: import("../../../apps/server/src/modules/ai/types.ts").AIChatProvider | null;
  generateDailyHoroscope: typeof import("../_shared/server/modules/horoscope/service.js").generateDailyHoroscope;
  listDueHoroscopeNotifications: typeof import("../_shared/server/modules/horoscope/repository.js").listDueHoroscopeNotifications;
  claimHoroscopeNotification: typeof import("../_shared/server/modules/horoscope/repository.js").claimHoroscopeNotification;
  markHoroscopeNotificationSent: typeof import("../_shared/server/modules/horoscope/repository.js").markHoroscopeNotificationSent;
  releaseHoroscopeNotification: typeof import("../_shared/server/modules/horoscope/repository.js").releaseHoroscopeNotification;
}> | null = null;

async function getWorker() {
  if (!workerPromise) {
    workerPromise = (async () => {
      // The database module reads DATABASE_URL at import time, so bridge secrets first.
      hydrateNodeEnvironment(process, ENV_KEYS);
      const [
        ai,
        horoscope,
        repository,
      ] = await Promise.all([
        import("../_shared/server/modules/ai/provider.js"),
        import("../_shared/server/modules/horoscope/service.js"),
        import("../_shared/server/modules/horoscope/repository.js"),
      ]);
      const token = Deno.env.get("TELEGRAM_BOT_TOKEN");
      if (!token) throw new Error("telegram_bot_not_configured");
      return {
        bot: new Bot(token),
        provider: ai.createAIProviderFromEnv(),
        generateDailyHoroscope: horoscope.generateDailyHoroscope,
        listDueHoroscopeNotifications: repository.listDueHoroscopeNotifications,
        claimHoroscopeNotification: repository.claimHoroscopeNotification,
        markHoroscopeNotificationSent: repository.markHoroscopeNotificationSent,
        releaseHoroscopeNotification: repository.releaseHoroscopeNotification,
      };
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
    const worker = await getWorker();
    if (!worker.provider) {
      return Response.json({ error: "ai_provider_not_configured" }, { status: 503 });
    }

    // Small bounded batch keeps each invocation under serverless wall-clock limits.
    const due = await worker.listDueHoroscopeNotifications(3);
    let sent = 0;
    let skipped = 0;
    let failed = 0;

    for (const item of due) {
      const claimed = await worker.claimHoroscopeNotification(item.telegramId, item.localDate);
      if (!claimed) {
        skipped += 1;
        continue;
      }
      let telegramDeliveryStarted = false;
      try {
        const horoscope = await worker.generateDailyHoroscope(
          item.telegramId,
          item.timeZone,
          worker.provider,
          item.localDate,
        );
        const webAppUrl = Deno.env.get("TELEGRAM_WEBAPP_URL") ?? "";
        const message = [
          `☾ Гороскоп на ${item.localDate}`,
          "",
          horoscope.content,
          "",
          "Это символическая подсказка для саморефлексии, а не прогноз неизбежных событий.",
          webAppUrl ? `Открыть журнал: ${webAppUrl}` : "",
        ].filter(Boolean).join("\n").slice(0, 3900);
        telegramDeliveryStarted = true;
        await worker.bot.api.sendMessage(item.telegramId, message, {
          link_preview_options: { is_disabled: true },
        });
        await worker.markHoroscopeNotificationSent(item.telegramId, item.localDate);
        sent += 1;
      } catch (error) {
        // A failure before Telegram send is safe to release. Once the send starts,
        // keep the lease until expiry: Telegram may have accepted the message even
        // if the HTTP response was lost, and immediate retry could duplicate it.
        if (!telegramDeliveryStarted) {
          await worker.releaseHoroscopeNotification(item.telegramId, item.localDate).catch(() => undefined);
        }
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
