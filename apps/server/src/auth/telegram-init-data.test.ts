import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";
import { validateTelegramInitData } from "./telegram-init-data.js";

const BOT_TOKEN = "123456:TEST_TOKEN";
const NOW = 1_800_000_000;

function signInitData(fields: Record<string, string>, botToken = BOT_TOKEN): string {
  const dataCheckString = Object.entries(fields)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");
  const secretKey = createHmac("sha256", "WebAppData").update(botToken).digest();
  const hash = createHmac("sha256", secretKey).update(dataCheckString).digest("hex");
  return new URLSearchParams({ ...fields, hash }).toString();
}

test("accepts correctly signed and fresh Telegram initData", () => {
  const initData = signInitData({
    auth_date: String(NOW),
    query_id: "AAE-test-query",
    user: JSON.stringify({ id: 123456, first_name: "Anna", username: "anna" }),
  });

  const result = validateTelegramInitData(initData, BOT_TOKEN, {
    nowSeconds: NOW,
  });

  assert.equal(result?.user.id, 123456);
  assert.equal(result?.user.first_name, "Anna");
  assert.equal(result?.queryId, "AAE-test-query");
});

test("rejects data signed with another bot token", () => {
  const initData = signInitData({
    auth_date: String(NOW),
    user: JSON.stringify({ id: 123456, first_name: "Anna" }),
  });

  assert.equal(
    validateTelegramInitData(initData, "987654:OTHER_TOKEN", {
      nowSeconds: NOW,
    }),
    null,
  );
});

test("rejects modified data", () => {
  const initData = signInitData({
    auth_date: String(NOW),
    user: JSON.stringify({ id: 123456, first_name: "Anna" }),
  }).replace("Anna", "Eva");

  assert.equal(
    validateTelegramInitData(initData, BOT_TOKEN, { nowSeconds: NOW }),
    null,
  );
});

test("rejects expired data", () => {
  const initData = signInitData({
    auth_date: String(NOW - 601),
    user: JSON.stringify({ id: 123456, first_name: "Anna" }),
  });

  assert.equal(
    validateTelegramInitData(initData, BOT_TOKEN, {
      nowSeconds: NOW,
      maxAgeSeconds: 600,
    }),
    null,
  );
});
