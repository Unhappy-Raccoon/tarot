import { Bot, InlineKeyboard } from "grammy";

function getHttpsWebAppUrl(value?: string): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export function createTelegramBot(token: string, webAppUrl?: string) {
  const bot = new Bot(token);
  const appUrl = getHttpsWebAppUrl(webAppUrl);

  bot.command("start", async (ctx) => {
    const firstName = ctx.from?.first_name?.trim() || "путешественница";
    const welcome = [
      `Привет, ${firstName} ✨`,
      "",
      "Добро пожаловать в Personal Cosmic Journal.",
      "Твоё пространство для Таро, астрологии и личных космических заметок.",
      "",
      "Начни с карты дня или открой свой персональный журнал.",
    ].join("\n");

    if (appUrl) {
      const keyboard = new InlineKeyboard()
        .webApp("Открыть журнал", appUrl)
        .row()
        .text("Что внутри?", "show_features");
      await ctx.reply(welcome, { reply_markup: keyboard });
      return;
    }

    await ctx.reply(
      `${welcome}\n\nWebApp пока не подключён. Администратору нужно указать публичный HTTPS URL в TELEGRAM_WEBAPP_URL.`,
    );
  });

  bot.command("app", async (ctx) => {
    if (!appUrl) {
      await ctx.reply("Приложение пока не подключено. Попробуй позже.");
      return;
    }
    await ctx.reply(
      "Открой Personal Cosmic Journal:",
      { reply_markup: new InlineKeyboard().webApp("Открыть журнал", appUrl) },
    );
  });

  bot.command("help", async (ctx) => {
    await ctx.reply(
      [
        "Personal Cosmic Journal",
        "",
        "/start — приветствие и главное меню",
        "/app — открыть WebApp",
        "/help — помощь",
        "",
        "Основные расклады и персональные функции доступны в WebApp.",
      ].join("\n"),
      appUrl
        ? { reply_markup: new InlineKeyboard().webApp("Открыть журнал", appUrl) }
        : undefined,
    );
  });

  bot.callbackQuery("show_features", async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.reply(
      [
        "В журнале тебя ждут:",
        "✦ Карта дня и расклады Таро",
        "✦ Натальная карта и гороскоп",
        "✦ Персональный AI-астролог",
        "✦ История и сохранённые трактовки",
      ].join("\n"),
      appUrl
        ? { reply_markup: new InlineKeyboard().webApp("Перейти в журнал", appUrl) }
        : undefined,
    );
  });

  bot.catch((error) => {
    console.error("Telegram bot update failed", error.error);
  });

  return { bot, webAppUrl: appUrl };
}
