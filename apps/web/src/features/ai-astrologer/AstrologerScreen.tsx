import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { PageHeading } from "../../components/PageHeading";

interface Props {
  onBack: () => void;
  accessToken: string;
}

type MessageRole = "user" | "assistant";
interface AIMessage {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: string;
}
interface ConversationSummary {
  id: string;
  title: string;
  updatedAt: string;
  messageCount: number;
}
interface Usage {
  plan: "free" | "premium";
  used: number;
  limit: number;
  remaining: number;
  usageDate: string;
  resetAt: string;
}
interface Scenario {
  id: string;
  title: string;
  starter: string;
}
interface AIStatus {
  available: boolean;
  provider: string | null;
  plan: "free" | "premium";
  usage: Usage;
  maxInputChars: number;
  scenarios: Scenario[];
  quotaResetTimeZone: string;
}
interface ChatResponse {
  conversationId: string;
  userMessage: AIMessage;
  assistantMessage: AIMessage;
  usage: Usage;
}
interface ConversationDetail extends ConversationSummary {
  messages: AIMessage[];
}
class RequestError extends Error {
  usage?: Usage;
  constructor(message: string, usage?: Usage) {
    super(message);
    this.name = "RequestError";
    this.usage = usage;
  }
}

const API_URL = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

async function request<T>(path: string, token: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  headers.set("Authorization", `Bearer ${token}`);
  const response = await fetch(`${API_URL}${path}`, { ...init, headers });
  const result = await response.json().catch(() => ({})) as {
    message?: string;
    usage?: Usage;
    error?: string;
  };
  if (!response.ok) {
    throw new RequestError(
      result.message ?? (result.error === "daily_limit_reached"
        ? "Дневной лимит сообщений исчерпан."
        : `Не удалось выполнить запрос: ${response.status}`),
      result.usage,
    );
  }
  return result as T;
}

function formatConversationDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return "";
  return new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short" }).format(date);
}

export function AstrologerScreen({ onBack, accessToken }: Props) {
  const [status, setStatus] = useState<AIStatus | null>(null);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingConversation, setLoadingConversation] = useState(false);
  const [sending, setSending] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!accessToken || !API_URL) {
      setError("Не удалось определить авторизованную сессию. Закрой и снова открой приложение через Telegram.");
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setError("");
      try {
        const [nextStatus, nextConversations] = await Promise.all([
          request<AIStatus>("/api/ai/status", accessToken, { signal: controller.signal }),
          request<{ conversations: ConversationSummary[] }>("/api/ai/conversations", accessToken, { signal: controller.signal }),
        ]);
        if (controller.signal.aborted) return;
        setStatus(nextStatus);
        setConversations(nextConversations.conversations);
      } catch (caught) {
        if (!controller.signal.aborted) {
          setError(caught instanceof Error ? caught.message : "Не удалось подключить AI-астролога.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [accessToken]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, sending]);

  function startNewConversation() {
    setConversationId(null);
    setMessages([]);
    setDraft("");
    setSelectedScenario(null);
    setError("");
    setHistoryOpen(false);
  }

  async function openConversation(id: string) {
    setLoadingConversation(true);
    setError("");
    try {
      const result = await request<{ conversation: ConversationDetail }>(
        `/api/ai/conversations/${encodeURIComponent(id)}`,
        accessToken,
      );
      setConversationId(result.conversation.id);
      setMessages(result.conversation.messages);
      setDraft("");
      setSelectedScenario(null);
      setHistoryOpen(false);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Не удалось открыть диалог.");
    } finally {
      setLoadingConversation(false);
    }
  }

  async function removeConversation(id: string) {
    setDeleteTarget(id);
    try {
      await request<{ deleted: boolean }>(
        `/api/ai/conversations/${encodeURIComponent(id)}`,
        accessToken,
        { method: "DELETE" },
      );
      setConversations((current) => current.filter((item) => item.id !== id));
      if (conversationId === id) startNewConversation();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Не удалось удалить диалог.");
    } finally {
      setDeleteTarget(null);
    }
  }

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = draft.trim();
    if (!message || sending || !status?.available || status.usage.remaining <= 0) return;
    setSending(true);
    setError("");
    try {
      const result = await request<ChatResponse>("/api/ai/chat", accessToken, {
        method: "POST",
        body: JSON.stringify({
          message,
          ...(conversationId ? { conversationId } : {}),
          ...(selectedScenario ? { scenarioId: selectedScenario } : {}),
        }),
      });
      setConversationId(result.conversationId);
      setMessages((current) => [...current, result.userMessage, result.assistantMessage]);
      setDraft("");
      setSelectedScenario(null);
      setStatus((current) => current ? { ...current, usage: result.usage } : current);
      setConversations((current) => {
        const existing = current.find((item) => item.id === result.conversationId);
        const next: ConversationSummary = {
          id: result.conversationId,
          title: existing?.title ?? message.slice(0, 72),
          updatedAt: result.assistantMessage.createdAt,
          messageCount: (existing?.messageCount ?? 0) + 2,
        };
        return [next, ...current.filter((item) => item.id !== result.conversationId)].slice(0, 20);
      });
    } catch (caught) {
      if (caught instanceof RequestError && caught.usage) {
        setStatus((current) => current ? { ...current, usage: caught.usage! } : current);
      }
      setError(caught instanceof Error ? caught.message : "Не удалось отправить сообщение.");
    } finally {
      setSending(false);
    }
  }

  function handleComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }

  const remaining = status?.usage.remaining ?? 0;
  const limitReached = Boolean(status && remaining <= 0);
  const activeScenario = status?.scenarios.find((item) => item.id === selectedScenario);

  return (
    <div className="page-screen astrologer-screen">
      <PageHeading
        eyebrow="ТВОЙ ЛИЧНЫЙ ПРОВОДНИК"
        title="AI-астролог"
        description="Место для вопросов, наблюдений и бережного исследования себя."
        onBack={onBack}
      />

      {status && (
        <section className="chat-usage-panel">
          <span className="chat-limit__moon" aria-hidden="true">☾</span>
          <div className="chat-usage-copy">
            <strong>{status.usage.plan === "premium" ? "Расширенный доступ" : "Твой дневной лимит"}</strong>
            <span>{status.available ? `Осталось ${remaining} из ${status.usage.limit} сообщений` : "AI-провайдер временно недоступен"}</span>
          </div>
          <div className="chat-usage-meter" aria-label={`Использовано ${status.usage.used} из ${status.usage.limit}`}>
            <span style={{ width: `${status.usage.limit > 0 ? Math.min(100, status.usage.used / status.usage.limit * 100) : 0}%` }} />
          </div>
        </section>
      )}

      <div className="ai-chat-toolbar">
        <button className="ai-toolbar-button" type="button" onClick={startNewConversation} disabled={loading || sending}>
          <span aria-hidden="true">＋</span> Новый диалог
        </button>
        <button className="ai-toolbar-button" type="button" onClick={() => setHistoryOpen((open) => !open)} disabled={loading}>
          <span aria-hidden="true">▤</span> История {conversations.length > 0 ? `· ${conversations.length}` : ""}
        </button>
      </div>

      {historyOpen && (
        <section className="ai-history-panel">
          <div className="ai-panel-heading">
            <strong>Сохранённые диалоги</strong>
            <button type="button" onClick={() => setHistoryOpen(false)} aria-label="Закрыть историю">×</button>
          </div>
          {conversations.length === 0 ? (
            <p className="ai-history-empty">Здесь появятся твои переписки с астрологом.</p>
          ) : conversations.map((item) => (
            <article className={`ai-history-item ${conversationId === item.id ? "active" : ""}`} key={item.id}>
              <button className="ai-history-open" type="button" onClick={() => void openConversation(item.id)} disabled={loadingConversation}>
                <strong>{item.title}</strong>
                <span>{formatConversationDate(item.updatedAt)} · {Math.floor(item.messageCount / 2)} тем</span>
              </button>
              <button
                className="ai-history-delete"
                type="button"
                aria-label={`Удалить диалог: ${item.title}`}
                disabled={deleteTarget === item.id}
                onClick={() => {
                  if (window.confirm("Удалить этот диалог и всю его историю?")) void removeConversation(item.id);
                }}
              >{deleteTarget === item.id ? "…" : "×"}</button>
            </article>
          ))}
        </section>
      )}

      <section className="ai-chat-thread" aria-label="Переписка с астрологом" aria-live="polite">
        {loading || loadingConversation ? (
          <div className="ai-chat-empty"><span className="ai-welcome-orbit">✧</span><h2>Настраиваем диалог</h2><p>Загружаем твои переписки…</p></div>
        ) : messages.length === 0 ? (
          <div className="ai-chat-empty">
            <span className="ai-welcome-orbit" aria-hidden="true">☾</span>
            <span className="card-eyebrow">ПРОСТРАНСТВО ДЛЯ РАЗМЫШЛЕНИЙ</span>
            <h2>О чём поговорим сегодня?</h2>
            <p>Выбери тему или задай свой вопрос. Астролог поможет посмотреть на ситуацию с новой стороны — без категоричных прогнозов и обещаний.</p>
          </div>
        ) : messages.map((message) => (
          <article className={`chat-message chat-message--${message.role}`} key={message.id}>
            {message.role === "assistant" && <span className="chat-avatar" aria-hidden="true">✦</span>}
            <div>
              {message.role === "assistant" && <small>ТВОЙ АСТРОЛОГ</small>}
              <p>{message.content}</p>
              <time>{new Intl.DateTimeFormat("ru-RU", { hour: "2-digit", minute: "2-digit" }).format(new Date(message.createdAt))}</time>
            </div>
          </article>
        ))}
        {sending && (
          <div className="ai-typing-state" role="status"><span /><span /><span /> Астролог размышляет…</div>
        )}
        <div ref={messagesEndRef} />
      </section>

      {messages.length === 0 && status?.scenarios?.length ? (
        <section className="suggestion-block">
          <span className="card-eyebrow">ТЕМЫ ДЛЯ РАЗГОВОРА</span>
          <div className="ai-scenario-list">
            {status.scenarios.map((scenario) => (
              <button
                className={selectedScenario === scenario.id ? "selected" : ""}
                type="button"
                key={scenario.id}
                disabled={!status.available || limitReached}
                onClick={() => {
                  setSelectedScenario(scenario.id);
                  setDraft(scenario.starter);
                  setError("");
                }}
              >
                {scenario.title}<span aria-hidden="true">→</span>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {activeScenario && <p className="ai-selected-scenario">Тема: {activeScenario.title} · можешь изменить текст перед отправкой.</p>}
      {error && <p className="form-error" role="alert">{error}</p>}
      {limitReached && <p className="ai-limit-notice" role="status">На сегодня сообщения закончились. Лимит обновится после полуночи UTC.</p>}
      {status && !status.available && (
        <p className="ai-limit-notice" role="status">AI-провайдер сейчас не подключён. Попробуй позже.</p>
      )}

      <form className="ai-chat-composer" onSubmit={sendMessage}>
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleComposerKeyDown}
          placeholder="Задай свой вопрос…"
          aria-label="Твой вопрос астрологу"
          maxLength={status?.maxInputChars ?? 2000}
          rows={2}
          disabled={loading || sending || !status?.available || limitReached}
        />
        <button
          type="submit"
          aria-label="Отправить сообщение"
          disabled={!draft.trim() || sending || loading || !status?.available || limitReached}
        >{sending ? "…" : "↑"}</button>
      </form>
      <p className="ai-composer-hint">Enter — отправить · Shift+Enter — новая строка. Переписки сохраняются в твоём аккаунте.</p>
      <p className="demo-disclaimer">Ответы AI — инструмент саморефлексии, а не медицинская, финансовая или юридическая рекомендация и не гарантированное предсказание.</p>
    </div>
  );
}
