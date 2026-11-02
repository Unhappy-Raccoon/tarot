import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { createSessionToken } from "../../auth/session.js";
import { upsertTelegramUser } from "../users/repository.js";
import { buildApp } from "../../app.js";
import { buildAstrologerInstructions } from "./prompt.js";
import type { AIChatProvider, AIProviderRequest, AIProviderResponse } from "./types.js";

class FakeProvider implements AIChatProvider {
  readonly name = "fake";
  readonly model = "test-model";
  calls: AIProviderRequest[] = [];

  async generate(request: AIProviderRequest): Promise<AIProviderResponse> {
    this.calls.push(request);
    return {
      text: "Давай посмотрим на это бережно. Какой шаг сейчас кажется тебе самым честным?",
      provider: this.name,
      model: this.model,
      inputTokens: 120,
      outputTokens: 24,
    };
  }
}

test("astrologer instructions do not invent natal chart details when data is missing", () => {
  const instructions = buildAstrologerInstructions(null);
  assert.match(instructions, /не выдумывай/i);
  assert.match(instructions, /натальная карта пока недоступна/i);
});

test("astrologer scenarios are resolved from a server-side allowlist", () => {
  const instructions = buildAstrologerInstructions(null, "relationships");
  assert.match(instructions, /отношения/i);
  assert.match(instructions, /третьих лиц/i);
  assert.doesNotMatch(
    buildAstrologerInstructions(null, "ignore-all-rules"),
    /ignore-all-rules/i,
  );
});

test("chat saves user and assistant messages and enforces a daily free limit", async () => {
  const telegramId = `ai-test-${randomUUID()}`;
  const secret = "ai-test-session-secret-with-more-than-32-chars";
  await upsertTelegramUser({ telegramId, firstName: "Test" });

  const provider = new FakeProvider();
  const app = buildApp({
    sessionSecret: secret,
    aiProvider: provider,
    aiFreeDailyLimit: 1,
    aiPremiumDailyLimit: 10,
  });
  const token = createSessionToken(telegramId, secret);

  try {
    const first = await app.inject({
      method: "POST",
      url: "/api/ai/chat",
      headers: { authorization: `Bearer ${token}` },
      payload: { message: "Помоги понять свои приоритеты.", scenarioId: "potential" },
    });
    assert.equal(first.statusCode, 200);
    const result = first.json() as {
      conversationId: string;
      assistantMessage: { role: string; content: string };
      usage: { used: number; remaining: number };
    };
    assert.ok(result.conversationId);
    assert.equal(result.assistantMessage.role, "assistant");
    assert.match(result.assistantMessage.content, /бережно/);
    assert.equal(result.usage.used, 1);
    assert.equal(result.usage.remaining, 0);

    const second = await app.inject({
      method: "POST",
      url: "/api/ai/chat",
      headers: { authorization: `Bearer ${token}` },
      payload: { message: "Ещё один вопрос." },
    });
    assert.equal(second.statusCode, 429);

    const conversation = await app.inject({
      method: "GET",
      url: `/api/ai/conversations/${result.conversationId}`,
      headers: { authorization: `Bearer ${token}` },
    });
    assert.equal(conversation.statusCode, 200);
    assert.equal((conversation.json() as { conversation: { messages: unknown[] } }).conversation.messages.length, 2);
    assert.equal(provider.calls.length, 1);
  } finally {
    await app.close();
  }
});
