import { Bot } from "grammy";
import { hasValidSecretHeader } from "../_shared/security.ts";

let botPromise: Promise<Bot> | null = null;

async function getBot(): Promise<Bot> {
  if (!botPromise) {
    botPromise = (async () => {
      const token = Deno.env.get("TELEGRAM_BOT_TOKEN");
      const webAppUrl = Deno.env.get("TELEGRAM_WEBAPP_URL");
      if (!token) throw new Error("telegram_bot_not_configured");
      const { createTelegramBot } = await import("../_shared/server/bot/create-bot.js");
      const bot = createTelegramBot(token, webAppUrl).bot;
      await bot.init();
      return bot;
    })().catch((error) => {
      botPromise = null;
      throw error;
    });
  }
  return botPromise;
}

async function configureTelegramWebhook(): Promise<Response> {
  const token = Deno.env.get("TELEGRAM_BOT_TOKEN");
  const webhookSecret = Deno.env.get("TELEGRAM_WEBHOOK_SECRET");
  const webAppUrl = Deno.env.get("TELEGRAM_WEBAPP_URL");
  const projectUrl = Deno.env.get("SUPABASE_URL");

  if (!token || !webhookSecret || !webAppUrl || !projectUrl) {
    return Response.json({ error: "telegram_configuration_incomplete" }, { status: 503 });
  }

  try {
    const project = new URL(projectUrl);
    const webApp = new URL(webAppUrl);
    if (
      project.protocol !== "https:" ||
      webApp.protocol !== "https:" ||
      !/^[A-Za-z0-9_-]{1,256}$/.test(webhookSecret)
    ) {
      return Response.json({ error: "telegram_configuration_invalid" }, { status: 503 });
    }

    const bot = new Bot(token);
    const identity = await bot.api.getMe();
    const webhookUrl = `${project.origin}/functions/v1/telegram-webhook`;

    await bot.api.setWebhook(webhookUrl, {
      secret_token: webhookSecret,
      allowed_updates: ["message", "callback_query"],
    });
    await bot.api.setMyCommands([
      { command: "start", description: "Открыть Personal Cosmic Journal" },
      { command: "app", description: "Открыть WebApp" },
      { command: "help", description: "Помощь" },
    ]);
    await bot.api.setChatMenuButton({
      menu_button: {
        type: "web_app",
        text: "Открыть журнал",
        web_app: { url: webApp.toString() },
      },
    });

    const webhook = await bot.api.getWebhookInfo();
    const configured = webhook.url === webhookUrl && !webhook.last_error_message;
    if (!configured) {
      console.error("Telegram webhook verification failed", {
        urlMatches: webhook.url === webhookUrl,
        hasLastError: Boolean(webhook.last_error_message),
      });
      return Response.json({ error: "telegram_webhook_verification_failed" }, { status: 502 });
    }

    return Response.json({
      ok: true,
      bot: { username: identity.username ?? null },
      webhook: {
        configured: true,
        pendingUpdateCount: webhook.pending_update_count,
      },
      webAppMenuConfigured: true,
    });
  } catch (error) {
    console.error(
      "Telegram setup failed",
      error instanceof Error ? error.name : "unknown",
    );
    return Response.json({ error: "telegram_setup_failed" }, { status: 502 });
  }
}

Deno.serve(async (request) => {
  const requestPath = new URL(request.url).pathname.replace(/\\/+$/, "");
  if (requestPath.endsWith("/configure")) {
    if (request.method !== "POST") {
      return Response.json({ error: "method_not_allowed" }, { status: 405 });
    }
    const cronSecret = Deno.env.get("HOROSCOPE_CRON_SECRET") ?? "";
    if (!hasValidSecretHeader(request, "x-cron-secret", cronSecret)) {
      return Response.json({ error: "unauthorized" }, { status: 401 });
    }
    return configureTelegramWebhook();
  }

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
