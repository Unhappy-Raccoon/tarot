import { getUserProfile } from "../users/repository.js";
import { getOrCreateNatalChart } from "../astrology/repository.js";
import { buildAstrologerInstructions } from "./prompt.js";
import { getAstrologerScenario } from "./scenarios.js";
import {
  getAIUsage,
  getAIConversation,
  recordAITokens,
  releaseAIMessageReservation,
  reserveAIMessage,
  saveAIExchange,
} from "./repository.js";
import type { AIChatProvider, AIConversationSummary, AIUsageStatus } from "./types.js";
import { getAIServiceConfig } from "./config.js";

export class AIServiceError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number,
    public readonly usage?: AIUsageStatus,
  ) {
    super(message);
    this.name = "AIServiceError";
  }
}

export async function getAstrologerStatus(
  telegramId: string,
  providerAvailable: boolean,
  plan: "free" | "premium",
  freeLimit: number,
  premiumLimit: number,
) {
  const usage = await getAIUsage(telegramId, plan, freeLimit, premiumLimit);
  return {
    available: providerAvailable,
    usage,
  };
}

export async function sendAstrologerMessage(
  telegramId: string,
  plan: "free" | "premium",
  input: { message: string; conversationId?: string; scenarioId?: string },
  provider: AIChatProvider | null,
  limits: { freeDailyLimit: number; premiumDailyLimit: number },
) {
  if (!provider) {
    throw new AIServiceError(
      "ai_provider_not_configured",
      "AI-астролог пока не подключён на сервере. Администратору нужно настроить AI_PROVIDER, AI_API_KEY и AI_MODEL.",
      503,
    );
  }

  const config = getAIServiceConfig();
  const profile = await getUserProfile(telegramId);
  if (!profile) throw new AIServiceError("user_not_found", "Профиль пользователя не найден.", 404);

  const userText = input.message.trim();
  if (!userText || userText.length > config.maxInputChars) {
    throw new AIServiceError(
      "invalid_message",
      `Сообщение должно содержать от 1 до ${config.maxInputChars} символов.`,
      400,
    );
  }

  if (input.scenarioId && !getAstrologerScenario(input.scenarioId)) {
    throw new AIServiceError("invalid_scenario", "Выбери одну из доступных тем.", 400);
  }

  let history: Array<{ role: "user" | "assistant"; content: string }> = [];
  if (input.conversationId) {
    const conversation = await getAIConversation(
      telegramId,
      input.conversationId,
      config.maxHistoryMessages,
    );
    if (!conversation) {
      throw new AIServiceError("conversation_not_found", "Диалог не найден.", 404);
    }
    history = conversation.messages.map(({ role, content }) => ({ role, content }));
  }

  const limit = plan === "premium" ? limits.premiumDailyLimit : limits.freeDailyLimit;
  const reserved = await reserveAIMessage(telegramId, limit);
  if (!reserved) {
    const usage = await getAIUsage(
      telegramId,
      plan,
      limits.freeDailyLimit,
      limits.premiumDailyLimit,
    );
    throw new AIServiceError(
      "daily_limit_reached",
      "Дневной лимит сообщений исчерпан. Он обновится после полуночи UTC.",
      429,
      usage,
    );
  }

  let chart = null;
  try {
    chart = await getOrCreateNatalChart(telegramId);
  } catch {
    // A natal chart is optional; the assistant must explicitly avoid inventing placements.
  }

  const requestMessages = [
    ...history,
    { role: "user" as const, content: userText },
  ].slice(-config.maxHistoryMessages);

  try {
    const generated = await provider.generate({
      instructions: buildAstrologerInstructions(chart, input.scenarioId),
      messages: requestMessages,
      maxOutputTokens: config.maxOutputTokens,
      timeoutMs: config.requestTimeoutMs,
    });

    const saved = await saveAIExchange(
      telegramId,
      input.conversationId,
      userText,
      generated.text,
      generated.provider,
      generated.model,
      generated.inputTokens,
      generated.outputTokens,
    );
    await recordAITokens(telegramId, generated.inputTokens, generated.outputTokens);

    return {
      conversationId: saved.conversationId,
      userMessage: saved.userMessage,
      assistantMessage: saved.assistantMessage,
      usage: await getAIUsage(
        telegramId,
        plan,
        limits.freeDailyLimit,
        limits.premiumDailyLimit,
      ),
    };
  } catch (error) {
    await releaseAIMessageReservation(telegramId).catch(() => undefined);
    if (error instanceof AIServiceError) throw error;
    throw error;
  }
}

export async function listAstrologerConversations(
  telegramId: string,
): Promise<AIConversationSummary[]> {
  const { listAIConversations } = await import("./repository.js");
  return listAIConversations(telegramId);
}
