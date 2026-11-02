import process from "node:process";

try {
  process.loadEnvFile(".env.supabase");
} catch {
  console.error("Missing .env.supabase. Copy .env.supabase.example and fill the test bot values locally.");
  process.exit(1);
}

const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();
const projectUrl = process.env.PROJECT_URL?.replace(/\/$/, "");
const webAppUrl = process.env.TELEGRAM_WEBAPP_URL?.trim();

if (!token || !webhookSecret || !projectUrl || !webAppUrl) {
  console.error("PROJECT_URL, TELEGRAM_BOT_TOKEN, TELEGRAM_WEBHOOK_SECRET and TELEGRAM_WEBAPP_URL are required.");
  process.exit(1);
}
if (!/^https:\/\//.test(projectUrl) || !/^https:\/\//.test(webAppUrl)) {
  console.error("PROJECT_URL and TELEGRAM_WEBAPP_URL must use HTTPS.");
  process.exit(1);
}
if (!/^[A-Za-z0-9_-]{1,256}$/.test(webhookSecret)) {
  console.error("TELEGRAM_WEBHOOK_SECRET must use only letters, digits, underscores and hyphens (1–256 chars).");
  process.exit(1);
}

async function telegram(method, payload) {
  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  const result = await response.json();
  if (!response.ok || result.ok !== true) {
    throw new Error(`Telegram API ${method} failed (HTTP ${response.status}).`);
  }
  return result.result;
}

const webhookUrl = `${projectUrl}/functions/v1/telegram-webhook`;
await telegram("setWebhook", {
  url: webhookUrl,
  secret_token: webhookSecret,
  allowed_updates: ["message", "callback_query"],
});
await telegram("setMyCommands", {
  commands: [
    { command: "start", description: "Открыть Personal Cosmic Journal" },
    { command: "app", description: "Открыть WebApp" },
    { command: "help", description: "Помощь" },
  ],
});
await telegram("setChatMenuButton", {
  menu_button: {
    type: "web_app",
    text: "Открыть журнал",
    web_app: { url: webAppUrl },
  },
});

console.log("Telegram webhook, commands and WebApp menu button configured for the test bot.");
