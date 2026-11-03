import { getRuntimeEnv } from "../../config/env.js";
import {
  AIProviderError,
  type AIChatProvider,
  type AIProviderRequest,
  type AIProviderResponse,
} from "./types.js";

interface ResponsesAPIResult {
  output_text?: unknown;
  output?: Array<{
    content?: Array<{
      type?: string;
      text?: string;
    }>;
  }>;
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
  };
  error?: {
    message?: string;
    code?: string;
  };
}

export class OpenAIResponsesProvider implements AIChatProvider {
  readonly name = "openai";

  constructor(
    private readonly apiKey: string,
    readonly model: string,
    private readonly baseUrl = "https://api.openai.com/v1",
    private readonly fetchImpl: typeof fetch = fetch,
  ) {}

  async generate(request: AIProviderRequest): Promise<AIProviderResponse> {
    const endpoint = `${this.baseUrl.replace(/\/$/, "")}/responses`;
    let response: Response;

    try {
      response = await this.fetchImpl(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.model,
          instructions: request.instructions,
          input: request.messages.map((message) => ({
            role: message.role,
            content: message.content,
          })),
          max_output_tokens: request.maxOutputTokens,
          store: false,
        }),
        signal: AbortSignal.timeout(request.timeoutMs),
      });
    } catch (error) {
      if (error instanceof Error && error.name === "TimeoutError") {
        throw new AIProviderError("timeout", "AI provider request timed out");
      }
      throw new AIProviderError("upstream", "AI provider request failed");
    }

    const requestId = response.headers.get("x-request-id") ?? undefined;
    const payload = await response.json().catch(() => null) as ResponsesAPIResult | null;

    if (!response.ok) {
      if (response.status === 429) {
        throw new AIProviderError("rate_limited", "AI provider rate limit reached", requestId);
      }
      throw new AIProviderError("upstream", "AI provider returned an error", requestId);
    }

    if (!payload) {
      throw new AIProviderError("invalid_response", "AI provider returned an invalid response", requestId);
    }

    const outputText = typeof payload.output_text === "string"
      ? payload.output_text.trim()
      : (payload.output ?? [])
          .flatMap((item) => item.content ?? [])
          .filter((item) => item.type === "output_text" && typeof item.text === "string")
          .map((item) => item.text!)
          .join("\n")
          .trim();

    if (!outputText) {
      throw new AIProviderError("invalid_response", "AI provider returned an empty response", requestId);
    }

    return {
      text: outputText,
      provider: this.name,
      model: this.model,
      inputTokens: Number.isSafeInteger(payload.usage?.input_tokens)
        ? payload.usage!.input_tokens!
        : 0,
      outputTokens: Number.isSafeInteger(payload.usage?.output_tokens)
        ? payload.usage!.output_tokens!
        : 0,
    };
  }
}

export function createAIProviderFromEnv(): AIChatProvider | null {
  const provider = (getRuntimeEnv("AI_PROVIDER") ?? "openai").trim().toLowerCase();
  if (provider !== "openai") return null;

  const apiKey = getRuntimeEnv("AI_API_KEY")?.trim();
  const model = getRuntimeEnv("AI_MODEL")?.trim();
  if (!apiKey || !model) return null;

  const baseUrl = getRuntimeEnv("AI_BASE_URL")?.trim() || "https://api.openai.com/v1";
  return new OpenAIResponsesProvider(apiKey, model, baseUrl);
}
