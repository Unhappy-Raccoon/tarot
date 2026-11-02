import assert from "node:assert/strict";
import { test } from "node:test";
import { getRuntimeConfigurationIssues } from "./runtime.js";

const validProductionEnvironment = {
  NODE_ENV: "production",
  DATABASE_URL: "postgresql://pcj:password@db:5432/pcj",
  TELEGRAM_BOT_TOKEN: "123456:test-token",
  SESSION_SECRET: "s".repeat(40),
  TELEGRAM_WEBAPP_URL: "https://journal.example.com",
  WEBAPP_ORIGIN: "https://journal.example.com",
  AI_PROVIDER: "openai",
  AI_API_KEY: "test-api-key",
  AI_MODEL: "test-model",
};

test("accepts a complete production test-launch configuration", () => {
  assert.deepEqual(getRuntimeConfigurationIssues(validProductionEnvironment), []);
});

test("keeps local development preview configuration optional", () => {
  assert.deepEqual(getRuntimeConfigurationIssues({ NODE_ENV: "development" }), []);
});

test("reports missing production secrets and persistent database configuration", () => {
  const issues = getRuntimeConfigurationIssues({ NODE_ENV: "production" });
  assert.ok(issues.includes("DATABASE_URL is required"));
  assert.ok(issues.includes("TELEGRAM_BOT_TOKEN is required"));
  assert.ok(issues.includes("AI_API_KEY is required"));
  assert.ok(issues.includes("AI_MODEL is required"));
});

test("rejects short session secrets and non-HTTPS WebApp URLs", () => {
  const issues = getRuntimeConfigurationIssues({
    ...validProductionEnvironment,
    SESSION_SECRET: "too-short",
    TELEGRAM_WEBAPP_URL: "http://journal.example.com",
  });
  assert.ok(issues.includes("SESSION_SECRET must contain at least 32 characters"));
  assert.ok(issues.includes("TELEGRAM_WEBAPP_URL must be a valid HTTPS URL"));
});

test("requires the configured WebApp origin to match its HTTPS launch URL", () => {
  const issues = getRuntimeConfigurationIssues({
    ...validProductionEnvironment,
    WEBAPP_ORIGIN: "https://api.example.com",
  });
  assert.ok(issues.includes("WEBAPP_ORIGIN must match the origin of TELEGRAM_WEBAPP_URL"));
});
