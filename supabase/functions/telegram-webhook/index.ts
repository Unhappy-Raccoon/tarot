import process from "node:process";
import { Bot } from "grammy";
import { hasValidSecretHeader } from "../_shared/security.ts";
import { hydrateNodeEnvironment } from "../_shared/runtime-env.ts";

const ENV_KEYS = ["DATABASE_URL", "TELEGRAM_BOT_TOKEN", "SESSION_SECRET", "TELEGRAM_WEBAPP_URL", "WEBAPP_ORIGIN", "AI_PROVIDER", "AI_API_KEY", "AI_MODEL", "AI_BASE_URL", "LOG_LEVEL", "DATABASE_POOL_MAX"] as const;

let botPromise: Promise<Bot> | null = null;

async function getBot(): Promise<Bot> {
  if (!botPromise) {
    botPromise = (async () => {
      hydrateNodeEnvironment(process, ENV_KEYS);
      const token = Deno.env.get("TELEGRAM_BOT_TOKEN");
      const webAppUrl = Deno.env.get("TELEGRAM_WEBAPP_URL");
      if (!token) throw new Error("telegram_bot_not_configured");
      const { createTelegramBot } = await import("../_shared/server/bot/create-bot.js");
      return createTelegramBot(token, webAppUrl).bot;
    })().catch((error) => {
      botPromise = null;
      throw error;
    });
  }
  return botPromise;
}

Deno.serve(async (request) => {
  if (request.method !== "POST") {
    return Response.json({ error: "method_not_allowed" }, { status: 405 });
  }

  const secret = Deno.env.get("TELEGRAM_WEBHOOK_SECRET") ?? "";
  if (!hasValidSecretHeader(request, "x-telegram-bot-api-secret-token", secret)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const update = await request.json();
    if (!update || typeof update !== "object" || !Number.isSafeInteger((update as { update_id?: unknown }).update_id)) {
      return Response.json({ error: "invalid_update" }, { status: 400 });
    }
    const bot = await getBot();
    await bot.handleUpdate(update as Parameters<Bot["handleUpdate"]>[0]);
    return Response.json({ ok: true });
  } catch (error) {
    console.error("Telegram webhook processing failed", error instanceof Error ? error.name : "unknown");
    return Response.json({ error: "update_failed" }, { status: 500 });
  }
});
