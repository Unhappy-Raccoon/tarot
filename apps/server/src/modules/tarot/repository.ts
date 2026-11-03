import { getRuntimeEnv } from "../../config/env.js";
import { and, desc, eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { tarotReadings, users } from "../../db/schema.js";
import { createReadingSummary, drawTarotCards } from "./engine.js";
import { getTarotSpread } from "./spreads.js";
import type { TarotReading, TarotSpreadId } from "./types.js";

interface StoredReading {
  id: string;
  telegramId: string;
  spreadId: TarotSpreadId;
  title: string;
  summary: string;
  cards: TarotReading["cards"];
  dailyDate: string | null;
  createdAt: string;
}

const memoryReadings = new Map<string, StoredReading[]>();
let memoryId = 1;

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

function toPublicReading(reading: StoredReading): TarotReading {
  return {
    id: reading.id,
    spreadId: reading.spreadId,
    title: reading.title,
    summary: reading.summary,
    cards: reading.cards,
    createdAt: reading.createdAt,
  };
}

async function getDatabaseUserId(telegramId: string): Promise<number> {
  if (!db) throw new Error("Database is not configured");
  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.telegramId, telegramId))
    .limit(1);
  if (!user) throw new Error("User not found");
  return user.id;
}

export async function createTarotReading(
  telegramId: string,
  spreadId: TarotSpreadId,
): Promise<TarotReading> {
  const spread = getTarotSpread(spreadId);
  if (!spread) throw new Error("Unknown tarot spread");

  const dailyDate = spreadId === "daily" ? todayUtc() : null;

  if (!db) {
    if (getRuntimeEnv("NODE_ENV") === "production") {
      throw new Error("DATABASE_URL is required in production");
    }
    const existing = memoryReadings.get(telegramId) ?? [];
    if (dailyDate) {
      const daily = existing.find((item) => item.spreadId === "daily" && item.dailyDate === dailyDate);
      if (daily) return toPublicReading(daily);
    }
    const cards = drawTarotCards(spreadId);
    const entry: StoredReading = {
      id: String(memoryId++),
      telegramId,
      spreadId,
      title: spread.title,
      summary: createReadingSummary(spreadId, cards),
      cards,
      dailyDate,
      createdAt: new Date().toISOString(),
    };
    memoryReadings.set(telegramId, [entry, ...existing]);
    return toPublicReading(entry);
  }

  const userId = await getDatabaseUserId(telegramId);
  if (dailyDate) {
    const [existingDaily] = await db
      .select()
      .from(tarotReadings)
      .where(and(
        eq(tarotReadings.userId, userId),
        eq(tarotReadings.spreadId, "daily"),
        eq(tarotReadings.dailyDate, dailyDate),
      ))
      .limit(1);
    if (existingDaily) return toPublicReading({
      id: String(existingDaily.id),
      telegramId,
      spreadId: "daily",
      title: existingDaily.title,
      summary: existingDaily.summary,
      cards: existingDaily.cards,
      dailyDate: existingDaily.dailyDate,
      createdAt: existingDaily.createdAt.toISOString(),
    });
  }

  const cards = drawTarotCards(spreadId);
  const summary = createReadingSummary(spreadId, cards);
  const inserted = await db
    .insert(tarotReadings)
    .values({
      userId,
      spreadId,
      title: spread.title,
      summary,
      cards,
      dailyDate,
    })
    .onConflictDoNothing()
    .returning();

  const row = inserted[0];
  if (row) {
    return toPublicReading({
      id: String(row.id),
      telegramId,
      spreadId,
      title: row.title,
      summary: row.summary,
      cards: row.cards,
      dailyDate: row.dailyDate,
      createdAt: row.createdAt.toISOString(),
    });
  }

  // A concurrent daily draw may have won the unique (user_id, daily_date) race.
  if (dailyDate) {
    const [existingDaily] = await db
      .select()
      .from(tarotReadings)
      .where(and(
        eq(tarotReadings.userId, userId),
        eq(tarotReadings.spreadId, "daily"),
        eq(tarotReadings.dailyDate, dailyDate),
      ))
      .limit(1);
    if (existingDaily) {
      return toPublicReading({
        id: String(existingDaily.id),
        telegramId,
        spreadId: "daily",
        title: existingDaily.title,
        summary: existingDaily.summary,
        cards: existingDaily.cards,
        dailyDate: existingDaily.dailyDate,
        createdAt: existingDaily.createdAt.toISOString(),
      });
    }
  }
  throw new Error("Unable to create tarot reading");
}

export async function listTarotReadings(
  telegramId: string,
  limit = 50,
): Promise<TarotReading[]> {
  if (!db) {
    if (getRuntimeEnv("NODE_ENV") === "production") throw new Error("DATABASE_URL is required in production");
    return (memoryReadings.get(telegramId) ?? []).slice(0, limit).map(toPublicReading);
  }
  const userId = await getDatabaseUserId(telegramId);
  const rows = await db
    .select()
    .from(tarotReadings)
    .where(eq(tarotReadings.userId, userId))
    .orderBy(desc(tarotReadings.createdAt))
    .limit(limit);
  return rows.map((row) => toPublicReading({
    id: String(row.id),
    telegramId,
    spreadId: row.spreadId as TarotSpreadId,
    title: row.title,
    summary: row.summary,
    cards: row.cards,
    dailyDate: row.dailyDate,
    createdAt: row.createdAt.toISOString(),
  }));
}

export async function getTarotReading(
  telegramId: string,
  readingId: string,
): Promise<TarotReading | null> {
  if (!/^\d+$/.test(readingId)) return null;
  if (!db) {
    if (getRuntimeEnv("NODE_ENV") === "production") throw new Error("DATABASE_URL is required in production");
    const entry = (memoryReadings.get(telegramId) ?? []).find((item) => item.id === readingId);
    return entry ? toPublicReading(entry) : null;
  }
  const userId = await getDatabaseUserId(telegramId);
  const [row] = await db
    .select()
    .from(tarotReadings)
    .where(and(eq(tarotReadings.userId, userId), eq(tarotReadings.id, Number(readingId))))
    .limit(1);
  if (!row) return null;
  return toPublicReading({
    id: String(row.id),
    telegramId,
    spreadId: row.spreadId as TarotSpreadId,
    title: row.title,
    summary: row.summary,
    cards: row.cards,
    dailyDate: row.dailyDate,
    createdAt: row.createdAt.toISOString(),
  });
}
