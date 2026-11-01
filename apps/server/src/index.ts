import "dotenv/config";
import { buildApp } from "./app.js";
import { createTelegramBot } from "./bot/create-bot.js";
import { closeDatabase } from "./db/index.js";

const app = buildApp({
  botToken: process.env.TELEGRAM_BOT_TOKEN,
  sessionSecret: process.env.SESSION_SECRET,
  webAppOrigin: process.env.WEBAPP_ORIGIN,
});

const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? "0.0.0.0";

let bot: ReturnType<typeof createTelegramBot>["bot"] | null = null;
let shuttingDown = false;

async function shutdown(signal: string): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;
  app.log.info({ signal }, "Shutting down");

  if (bot) bot.stop();
  await app.close();
  await closeDatabase();
}

process.once("SIGINT", () => void shutdown("SIGINT"));
process.once("SIGTERM", () => void shutdown("SIGTERM"));

try {
  await app.listen({ port, host });
  app.log.info({ host, port }, "API server listening");

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    app.log.warn("TELEGRAM_BOT_TOKEN is empty; starting API in preview mode without Telegram polling");
  } else {
    const created = createTelegramBot(token, process.env.TELEGRAM_WEBAPP_URL);
    bot = created.bot;

    await bot.api.setMyCommands([
      { command: "start", description: "Открыть Personal Cosmic Journal" },
      { command: "app", description: "Открыть WebApp" },
      { command: "help", description: "Помощь" },
    ]);

    if (created.webAppUrl) {
      await bot.api.setChatMenuButton({
        menu_button: {
          type: "web_app",
          text: "Открыть журнал",
          web_app: { url: created.webAppUrl },
        },
      });
    } else {
      app.log.warn("TELEGRAM_WEBAPP_URL must be a public HTTPS URL to show Mini App buttons");
    }

    void bot.start().catch((error: unknown) => {
      app.log.error({ err: error }, "Telegram long polling stopped unexpectedly");
    });
    app.log.info("Telegram bot started with grammY long polling");
  }
} catch (error) {
  app.log.error({ err: error }, "Server startup failed");
  await shutdown("startup-error");
  process.exitCode = 1;
}
