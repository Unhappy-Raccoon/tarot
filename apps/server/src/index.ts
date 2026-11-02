import "dotenv/config";
import { buildApp } from "./app.js";
import { createTelegramBot } from "./bot/create-bot.js";
import { checkDatabaseReadiness, closeDatabase } from "./db/index.js";
import { assertRuntimeConfiguration } from "./config/runtime.js";
import { createAIProviderFromEnv } from "./modules/ai/provider.js";
import { generateDailyHoroscope } from "./modules/horoscope/service.js";
import {
  listDueHoroscopeNotifications,
  markHoroscopeNotificationSent,
} from "./modules/horoscope/repository.js";

const app = buildApp({
  botToken: process.env.TELEGRAM_BOT_TOKEN,
  sessionSecret: process.env.SESSION_SECRET,
  webAppOrigin: process.env.WEBAPP_ORIGIN,
});

const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? "0.0.0.0";

let bot: ReturnType<typeof createTelegramBot>["bot"] | null = null;
let shuttingDown = false;
let horoscopeNotificationTimer: ReturnType<typeof setInterval> | null = null;

async function shutdown(signal: string): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;
  app.log.info({ signal }, "Shutting down");

  if (horoscopeNotificationTimer) clearInterval(horoscopeNotificationTimer);
  if (bot) bot.stop();
  await app.close();
  await closeDatabase();
}

process.once("SIGINT", () => void shutdown("SIGINT"));
process.once("SIGTERM", () => void shutdown("SIGTERM"));

try {
  assertRuntimeConfiguration();

  if (process.env.NODE_ENV === "production") {
    const database = await checkDatabaseReadiness();
    if (!database.connected) {
      throw new Error("PostgreSQL is not reachable; check DATABASE_URL and database availability");
    }
    if (!database.ready) {
      throw new Error(
        `Database schema is incomplete; apply migrations before starting the API: ${database.missingTables.join(", ")}`,
      );
    }
  }

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

    const horoscopeProvider = createAIProviderFromEnv();
    let notificationPassRunning = false;
    const sendDueHoroscopes = async () => {
      if (!horoscopeProvider || notificationPassRunning || shuttingDown) return;
      notificationPassRunning = true;
      try {
        const due = await listDueHoroscopeNotifications();
        for (const item of due) {
          try {
            const horoscope = await generateDailyHoroscope(
              item.telegramId,
              item.timeZone,
              horoscopeProvider,
              item.localDate,
            );
            const message = [
              `☾ Гороскоп на ${item.localDate}`,
              "",
              horoscope.content,
              "",
              "Это символическая подсказка для саморефлексии, а не прогноз неизбежных событий.",
              created.webAppUrl ? `Открыть журнал: ${created.webAppUrl}` : "",
            ].filter(Boolean).join("\n").slice(0, 3900);
            await bot!.api.sendMessage(item.telegramId, message, {
              link_preview_options: { is_disabled: true },
            });
            await markHoroscopeNotificationSent(item.telegramId, item.localDate);
          } catch (error) {
            app.log.warn({
              notificationUser: item.telegramId,
              errorCode: error instanceof Error ? error.name : "unknown",
            }, "Daily horoscope notification was not delivered; it will be retried");
          }
        }
      } catch (error) {
        app.log.warn({ errorCode: error instanceof Error ? error.name : "unknown" }, "Unable to process daily horoscope notifications");
      } finally {
        notificationPassRunning = false;
      }
    };
    void sendDueHoroscopes();
    horoscopeNotificationTimer = setInterval(() => void sendDueHoroscopes(), 60_000);
    app.log.info("Telegram bot started with grammY long polling and daily horoscope notification scheduler");
  }
} catch (error) {
  app.log.error({ err: error }, "Server startup failed");
  await shutdown("startup-error");
  process.exitCode = 1;
}
