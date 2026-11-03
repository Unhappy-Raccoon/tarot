import { getRuntimeEnv } from "../../config/env.js";
function positiveInteger(value: string | undefined, fallback: number, maximum: number): number {
  if (!value) return fallback;
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, maximum);
}

export interface AIServiceConfig {
  freeDailyLimit: number;
  premiumDailyLimit: number;
  maxInputChars: number;
  maxHistoryMessages: number;
  maxOutputTokens: number;
  requestTimeoutMs: number;
}

export function getAIServiceConfig(): AIServiceConfig {
  return {
    // Provisional defaults; exact Free/Premium limits remain a product decision.
    freeDailyLimit: positiveInteger(getRuntimeEnv("AI_FREE_DAILY_LIMIT"), 5, 100),
    premiumDailyLimit: positiveInteger(getRuntimeEnv("AI_PREMIUM_DAILY_LIMIT"), 50, 500),
    maxInputChars: positiveInteger(getRuntimeEnv("AI_MAX_INPUT_CHARS"), 1200, 4000),
    maxHistoryMessages: positiveInteger(getRuntimeEnv("AI_MAX_HISTORY_MESSAGES"), 12, 30),
    maxOutputTokens: positiveInteger(getRuntimeEnv("AI_MAX_OUTPUT_TOKENS"), 500, 1500),
    requestTimeoutMs: positiveInteger(getRuntimeEnv("AI_REQUEST_TIMEOUT_MS"), 25_000, 60_000),
  };
}
