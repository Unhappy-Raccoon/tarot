import assert from "node:assert/strict";
import test from "node:test";
import { OpenAIResponsesProvider } from "./provider.js";
import { AIProviderError } from "./types.js";
import type { AIProviderRequest } from "./types.js";

const request: AIProviderRequest = {
  instructions: "Ты помощник для саморефлексии.",
  messages: [{ role: "user", content: "Помоги расставить приоритеты." }],
  maxOutputTokens: 200,
  timeoutMs: 1000,
};

test("OpenAI provider keeps safe HTTP diagnostics without exposing upstream message", async () => {
  const provider = new OpenAIResponsesProvider(
    "test-secret",
    "model-that-does-not-exist",
    "https://api.openai.com/v1",
    async () => new Response(JSON.stringify({
      error: {
        message: "private upstream detail must not be surfaced",
        code: "model_not_found",
      },
    }), {
      status: 404,
      headers: { "x-request-id": "req_test_123" },
    }),
  );

  await assert.rejects(
    provider.generate(request),
    (error: unknown) => {
      assert.ok(error instanceof AIProviderError);
      assert.equal(error.code, "upstream");
      assert.equal(error.httpStatus, 404);
      assert.equal(error.providerCode, "model_not_found");
      assert.equal(error.requestId, "req_test_123");
      assert.doesNotMatch(error.message, /private upstream detail/);
      return true;
    },
  );
});

test("OpenAI provider drops unsafe provider error code values", async () => {
  const provider = new OpenAIResponsesProvider(
    "test-secret",
    "test-model",
    "https://api.openai.com/v1",
    async () => new Response(JSON.stringify({
      error: { code: "invalid key; leaked content" },
    }), { status: 401 }),
  );

  await assert.rejects(
    provider.generate(request),
    (error: unknown) => {
      assert.ok(error instanceof AIProviderError);
      assert.equal(error.httpStatus, 401);
      assert.equal(error.providerCode, undefined);
      return true;
    },
  );
});
