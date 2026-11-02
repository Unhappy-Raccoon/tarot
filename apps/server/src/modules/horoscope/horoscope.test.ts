import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { createSessionToken } from "../../auth/session.js";
import { buildApp } from "../../app.js";
import { upsertTelegramUser, saveBirthProfile } from "../users/repository.js";
import type { AIChatProvider, AIProviderRequest, AIProviderResponse } from "../ai/types.js";

class FakeHoroscopeProvider implements AIChatProvider {
  readonly name = "fake";
  readonly model = "horoscope-test";
  calls: AIProviderRequest[] = [];

  async generate(request: AIProviderRequest): Promise<AIProviderResponse> {
    this.calls.push(request);
    return {
      text: "Тема дня: Сфокусируйся на одном важном деле.\n\nДела и фокус: Расставь мягкие приоритеты.\n\nОтношения: Оставь место для диалога.\n\nМягкая практика: Сделай короткую паузу.",
      provider: this.name,
      model: this.model,
      inputTokens: 180,
      outputTokens: 90,
    };
  }
}

test("daily horoscope is personalized from calculated transits, cached and available in history", async () => {
  const telegramId = `horoscope-test-${randomUUID()}`;
  const secret = "horoscope-test-session-secret-with-more-than-32-chars";
  await upsertTelegramUser({ telegramId, firstName: "Test" });
  await saveBirthProfile(telegramId, {
    displayName: "Test",
    birthDate: "1995-05-17",
    birthTime: "12:00",
    birthTimeZone: "Europe/Tallinn",
  });

  const provider = new FakeHoroscopeProvider();
  const app = buildApp({ sessionSecret: secret, aiProvider: provider });
  const token = createSessionToken(telegramId, secret);
  const headers = { authorization: `Bearer ${token}` };

  try {
    const first = await app.inject({
      method: "GET",
      url: "/api/horoscope/today?timeZone=Europe%2FTallinn",
      headers,
    });
    assert.equal(first.statusCode, 200);
    const result = first.json() as { horoscope: { id: string; content: string; transits: { positions: unknown[] }; aspects: unknown[] } };
    assert.ok(result.horoscope.id);
    assert.match(result.horoscope.content, /Тема дня/);
    assert.equal(result.horoscope.transits.positions.length, 10);
    assert.ok(Array.isArray(result.horoscope.aspects));
    assert.equal(provider.calls.length, 1);
    assert.match(provider.calls[0]!.instructions, /Транзитные положения/);
    assert.match(provider.calls[0]!.instructions, /натальной карты/);

    const second = await app.inject({
      method: "GET",
      url: "/api/horoscope/today?timeZone=Europe%2FTallinn",
      headers,
    });
    assert.equal(second.statusCode, 200);
    assert.equal((second.json() as { horoscope: { id: string } }).horoscope.id, result.horoscope.id);
    assert.equal(provider.calls.length, 1);

    const history = await app.inject({ method: "GET", url: "/api/horoscope/history", headers });
    assert.equal(history.statusCode, 200);
    assert.equal((history.json() as { history: unknown[] }).history.length, 1);

    const savedPrefs = await app.inject({
      method: "PUT",
      url: "/api/horoscope/preferences",
      headers,
      payload: {
        timeZone: "Europe/Tallinn",
        notificationsEnabled: true,
        notificationTime: "09:30",
      },
    });
    assert.equal(savedPrefs.statusCode, 200);
    assert.equal((savedPrefs.json() as { preferences: { notificationsEnabled: boolean; notificationTime: string } }).preferences.notificationsEnabled, true);
    assert.equal((savedPrefs.json() as { preferences: { notificationTime: string } }).preferences.notificationTime, "09:30");

    const invalidPrefs = await app.inject({
      method: "PUT",
      url: "/api/horoscope/preferences",
      headers,
      payload: {
        timeZone: "Mars/Olympus",
        notificationsEnabled: true,
        notificationTime: "09:30",
      },
    });
    assert.equal(invalidPrefs.statusCode, 400);
  } finally {
    await app.close();
  }
});
