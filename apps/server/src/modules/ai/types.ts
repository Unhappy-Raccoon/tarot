export type AIMessageRole = "user" | "assistant";

export interface AIChatMessage {
  id: string;
  role: AIMessageRole;
  content: string;
  createdAt: string;
}

export interface AIConversationSummary {
  id: string;
  title: string;
  updatedAt: string;
  messageCount: number;
}

export interface AIConversationDetail extends AIConversationSummary {
  messages: AIChatMessage[];
}

export interface AIUsageStatus {
  plan: "free" | "premium";
  used: number;
  limit: number;
  remaining: number;
  usageDate: string;
  resetAt: string;
}

export interface AIProviderRequest {
  instructions: string;
  messages: Array<Pick<AIChatMessage, "role" | "content">>;
  maxOutputTokens: number;
  timeoutMs: number;
}

export interface AIProviderResponse {
  text: string;
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
}

export interface AIChatProvider {
  readonly name: string;
  readonly model: string;
  generate(request: AIProviderRequest): Promise<AIProviderResponse>;
}

export class AIProviderError extends Error {
  constructor(
    public readonly code: "not_configured" | "timeout" | "rate_limited" | "upstream" | "invalid_response",
    message: string,
    public readonly requestId?: string,
  ) {
    super(message);
    this.name = "AIProviderError";
  }
}
