import { and, desc, eq, gt, lt, sql } from "drizzle-orm";
import { db } from "../../db/index.js";
import { aiConversations, aiDailyUsage, aiMessages, users } from "../../db/schema.js";
import type {
  AIConversationDetail,
  AIConversationSummary,
  AIMessageRole,
  AIUsageStatus,
} from "./types.js";

interface MemoryMessage {
  id: string;
  role: AIMessageRole;
  content: string;
  createdAt: string;
}

interface MemoryConversation {
  id: string;
  telegramId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: MemoryMessage[];
}

interface MemoryUsage {
  used: number;
  inputTokens: number;
  outputTokens: number;
}

const memoryConversations = new Map<string, MemoryConversation[]>();
const memoryUsage = new Map<string, MemoryUsage>();
let memoryConversationId = 1;
let memoryMessageId = 1;

function utcDate(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

function nextUtcMidnight(date: string): string {
  const value = new Date(`${date}T00:00:00.000Z`);
  value.setUTCDate(value.getUTCDate() + 1);
  return value.toISOString();
}

function mapPlan(plan: string): "free" | "premium" {
  return plan === "premium" ? "premium" : "free";
}

async function databaseUserId(telegramId: string): Promise<number> {
  if (!db) throw new Error("Database is not configured");
  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.telegramId, telegramId))
    .limit(1);
  if (!user) throw new Error("User not found");
  return user.id;
}

function memoryKey(telegramId: string, date: string): string {
  return `${telegramId}:${date}`;
}

export async function getAIUsage(
  telegramId: string,
  plan: "free" | "premium",
  freeLimit: number,
  premiumLimit: number,
  now = new Date(),
): Promise<AIUsageStatus> {
  const date = utcDate(now);
  const limit = plan === "premium" ? premiumLimit : freeLimit;

  if (!db) {
    if (process.env.NODE_ENV === "production") throw new Error("DATABASE_URL is required in production");
    const used = memoryUsage.get(memoryKey(telegramId, date))?.used ?? 0;
    return {
      plan,
      used,
      limit,
      remaining: Math.max(0, limit - used),
      usageDate: date,
      resetAt: nextUtcMidnight(date),
    };
  }

  const userId = await databaseUserId(telegramId);
  const [row] = await db
    .select({ messagesUsed: aiDailyUsage.messagesUsed })
    .from(aiDailyUsage)
    .where(and(
      eq(aiDailyUsage.userId, userId),
      eq(aiDailyUsage.usageDate, date),
    ))
    .limit(1);
  const used = row?.messagesUsed ?? 0;

  return {
    plan,
    used,
    limit,
    remaining: Math.max(0, limit - used),
    usageDate: date,
    resetAt: nextUtcMidnight(date),
  };
}

export async function reserveAIMessage(
  telegramId: string,
  limit: number,
  now = new Date(),
): Promise<boolean> {
  const date = utcDate(now);

  if (!db) {
    if (process.env.NODE_ENV === "production") throw new Error("DATABASE_URL is required in production");
    const key = memoryKey(telegramId, date);
    const usage = memoryUsage.get(key) ?? { used: 0, inputTokens: 0, outputTokens: 0 };
    if (usage.used >= limit) return false;
    usage.used += 1;
    memoryUsage.set(key, usage);
    return true;
  }

  const userId = await databaseUserId(telegramId);
  await db
    .insert(aiDailyUsage)
    .values({ userId, usageDate: date, messagesUsed: 0 })
    .onConflictDoNothing();

  const [reserved] = await db
    .update(aiDailyUsage)
    .set({
      messagesUsed: sql`${aiDailyUsage.messagesUsed} + 1`,
      updatedAt: new Date(),
    })
    .where(and(
      eq(aiDailyUsage.userId, userId),
      eq(aiDailyUsage.usageDate, date),
      lt(aiDailyUsage.messagesUsed, limit),
    ))
    .returning({ messagesUsed: aiDailyUsage.messagesUsed });

  return Boolean(reserved);
}

export async function releaseAIMessageReservation(
  telegramId: string,
  now = new Date(),
): Promise<void> {
  const date = utcDate(now);

  if (!db) {
    const usage = memoryUsage.get(memoryKey(telegramId, date));
    if (usage) usage.used = Math.max(0, usage.used - 1);
    return;
  }

  const userId = await databaseUserId(telegramId);
  await db
    .update(aiDailyUsage)
    .set({
      messagesUsed: sql`greatest(${aiDailyUsage.messagesUsed} - 1, 0)`,
      updatedAt: new Date(),
    })
    .where(and(
      eq(aiDailyUsage.userId, userId),
      eq(aiDailyUsage.usageDate, date),
      gt(aiDailyUsage.messagesUsed, 0),
    ));
}

export async function recordAITokens(
  telegramId: string,
  inputTokens: number,
  outputTokens: number,
  now = new Date(),
): Promise<void> {
  const date = utcDate(now);
  if (!db) {
    const usage = memoryUsage.get(memoryKey(telegramId, date));
    if (usage) {
      usage.inputTokens += Math.max(0, inputTokens);
      usage.outputTokens += Math.max(0, outputTokens);
    }
    return;
  }

  const userId = await databaseUserId(telegramId);
  await db
    .update(aiDailyUsage)
    .set({
      inputTokens: sql`${aiDailyUsage.inputTokens} + ${Math.max(0, inputTokens)}`,
      outputTokens: sql`${aiDailyUsage.outputTokens} + ${Math.max(0, outputTokens)}`,
      updatedAt: new Date(),
    })
    .where(and(
      eq(aiDailyUsage.userId, userId),
      eq(aiDailyUsage.usageDate, date),
    ));
}

export async function listAIConversations(
  telegramId: string,
  limit = 20,
): Promise<AIConversationSummary[]> {
  if (!db) {
    if (process.env.NODE_ENV === "production") throw new Error("DATABASE_URL is required in production");
    return (memoryConversations.get(telegramId) ?? [])
      .slice()
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
      .slice(0, limit)
      .map((conversation) => ({
        id: conversation.id,
        title: conversation.title,
        updatedAt: conversation.updatedAt,
        messageCount: conversation.messages.length,
      }));
  }

  const userId = await databaseUserId(telegramId);
  const rows = await db
    .select({
      id: aiConversations.id,
      title: aiConversations.title,
      updatedAt: aiConversations.updatedAt,
      messageCount: sql<number>`(
        select count(*)::int from ai_messages
        where ai_messages.conversation_id = ${aiConversations.id}
      )`,
    })
    .from(aiConversations)
    .where(eq(aiConversations.userId, userId))
    .orderBy(desc(aiConversations.updatedAt))
    .limit(limit);

  return rows.map((row) => ({
    id: String(row.id),
    title: row.title,
    updatedAt: row.updatedAt.toISOString(),
    messageCount: Number(row.messageCount),
  }));
}

export async function getAIConversation(
  telegramId: string,
  conversationId: string,
  messageLimit = 40,
): Promise<AIConversationDetail | null> {
  if (!/^\d+$/.test(conversationId)) return null;

  if (!db) {
    if (process.env.NODE_ENV === "production") throw new Error("DATABASE_URL is required in production");
    const conversation = (memoryConversations.get(telegramId) ?? [])
      .find((item) => item.id === conversationId);
    if (!conversation) return null;
    return {
      id: conversation.id,
      title: conversation.title,
      updatedAt: conversation.updatedAt,
      messageCount: conversation.messages.length,
      messages: conversation.messages.slice(-messageLimit),
    };
  }

  const userId = await databaseUserId(telegramId);
  const [conversation] = await db
    .select()
    .from(aiConversations)
    .where(and(
      eq(aiConversations.id, Number(conversationId)),
      eq(aiConversations.userId, userId),
    ))
    .limit(1);
  if (!conversation) return null;

  const rows = await db
    .select()
    .from(aiMessages)
    .where(eq(aiMessages.conversationId, conversation.id))
    .orderBy(desc(aiMessages.createdAt), desc(aiMessages.id))
    .limit(messageLimit);

  return {
    id: String(conversation.id),
    title: conversation.title,
    updatedAt: conversation.updatedAt.toISOString(),
    messageCount: rows.length,
    messages: rows.reverse().map((row) => ({
      id: String(row.id),
      role: row.role as AIMessageRole,
      content: row.content,
      createdAt: row.createdAt.toISOString(),
    })),
  };
}

export async function saveAIExchange(
  telegramId: string,
  conversationId: string | undefined,
  userText: string,
  assistantText: string,
  provider: string,
  model: string,
  inputTokens: number,
  outputTokens: number,
): Promise<{ conversationId: string; userMessage: { id: string; role: "user"; content: string; createdAt: string }; assistantMessage: { id: string; role: "assistant"; content: string; createdAt: string } }> {
  if (!db) {
    if (process.env.NODE_ENV === "production") throw new Error("DATABASE_URL is required in production");
    const conversations = memoryConversations.get(telegramId) ?? [];
    let conversation = conversationId
      ? conversations.find((item) => item.id === conversationId)
      : undefined;
    if (conversationId && !conversation) throw new Error("Conversation not found");

    const now = new Date().toISOString();
    if (!conversation) {
      conversation = {
        id: String(memoryConversationId++),
        telegramId,
        title: userText.slice(0, 72),
        createdAt: now,
        updatedAt: now,
        messages: [],
      };
      conversations.unshift(conversation);
      memoryConversations.set(telegramId, conversations);
    }

    const userMessage = {
      id: String(memoryMessageId++),
      role: "user" as const,
      content: userText,
      createdAt: now,
    };
    const assistantMessage = {
      id: String(memoryMessageId++),
      role: "assistant" as const,
      content: assistantText,
      createdAt: new Date(Date.now() + 1).toISOString(),
    };
    conversation.messages.push(userMessage, assistantMessage);
    conversation.updatedAt = assistantMessage.createdAt;
    return { conversationId: conversation.id, userMessage, assistantMessage };
  }

  const userId = await databaseUserId(telegramId);
  return db.transaction(async (tx) => {
    let conversation: { id: number; title: string } | undefined;

    if (conversationId) {
      if (!/^\d+$/.test(conversationId)) throw new Error("Conversation not found");
      const [existing] = await tx
        .select({ id: aiConversations.id, title: aiConversations.title })
        .from(aiConversations)
        .where(and(
          eq(aiConversations.id, Number(conversationId)),
          eq(aiConversations.userId, userId),
        ))
        .limit(1);
      conversation = existing;
      if (!conversation) throw new Error("Conversation not found");
    } else {
      const [created] = await tx
        .insert(aiConversations)
        .values({
          userId,
          title: userText.slice(0, 72),
          updatedAt: new Date(),
        })
        .returning({ id: aiConversations.id, title: aiConversations.title });
      conversation = created;
    }

    if (!conversation) throw new Error("Unable to create conversation");
    const now = new Date();
    const inserted = await tx
      .insert(aiMessages)
      .values([
        {
          conversationId: conversation.id,
          role: "user",
          content: userText,
        },
        {
          conversationId: conversation.id,
          role: "assistant",
          content: assistantText,
          provider,
          model,
          inputTokens,
          outputTokens,
        },
      ])
      .returning();

    await tx
      .update(aiConversations)
      .set({ updatedAt: now })
      .where(eq(aiConversations.id, conversation.id));

    const userRow = inserted[0]!;
    const assistantRow = inserted[1]!;
    return {
      conversationId: String(conversation.id),
      userMessage: {
        id: String(userRow.id),
        role: "user" as const,
        content: userRow.content,
        createdAt: userRow.createdAt.toISOString(),
      },
      assistantMessage: {
        id: String(assistantRow.id),
        role: "assistant" as const,
        content: assistantRow.content,
        createdAt: assistantRow.createdAt.toISOString(),
      },
    };
  });
}


export async function deleteAIConversation(
  telegramId: string,
  conversationId: string,
): Promise<boolean> {
  if (!/^[0-9]+$/.test(conversationId)) return false;

  if (!db) {
    if (process.env.NODE_ENV === "production") throw new Error("DATABASE_URL is required in production");
    const conversations = memoryConversations.get(telegramId) ?? [];
    const index = conversations.findIndex((item) => item.id === conversationId);
    if (index < 0) return false;
    conversations.splice(index, 1);
    memoryConversations.set(telegramId, conversations);
    return true;
  }

  const userId = await databaseUserId(telegramId);
  const deleted = await db
    .delete(aiConversations)
    .where(and(
      eq(aiConversations.id, Number(conversationId)),
      eq(aiConversations.userId, userId),
    ))
    .returning({ id: aiConversations.id });
  return deleted.length > 0;
}
