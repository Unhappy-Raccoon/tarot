import { and, desc, eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { dailyHoroscopes, horoscopePreferences, users } from "../../db/schema.js";
import { getLocalDate } from "../astrology/transits.js";
import type { DailyHoroscope, DueHoroscopeNotification, HoroscopePreferences } from "./types.js";

const memoryHoroscopes = new Map<string, DailyHoroscope>();
const memoryPreferences = new Map<string, HoroscopePreferences & { lastSentLocalDate: string | null }>();
let memoryId = 0;

function horoscopeKey(telegramId: string, localDate: string): string {
  return `${telegramId}:${localDate}`;
}

function mapRow(row: typeof dailyHoroscopes.$inferSelect): DailyHoroscope {
  return {
    id: String(row.id),
    localDate: row.localDate,
    timeZone: row.timeZone,
    title: row.title,
    content: row.content,
    transits: row.transitData.transits,
    aspects: row.transitData.aspects,
    natalPrecision: row.transitData.natalPrecision,
    createdAt: row.createdAt.toISOString(),
  };
}

function localClock(now: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone, hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).format(now);
}

export async function getDailyHoroscope(
  telegramId: string,
  localDate: string,
  _timeZone: string,
): Promise<DailyHoroscope | null> {
  if (!db) return memoryHoroscopes.get(horoscopeKey(telegramId, localDate)) ?? null;
  const [row] = await db
    .select({ horoscope: dailyHoroscopes })
    .from(dailyHoroscopes)
    .innerJoin(users, eq(dailyHoroscopes.userId, users.id))
    .where(and(
      eq(users.telegramId, telegramId),
      eq(dailyHoroscopes.localDate, localDate),
    ))
    .limit(1);
  return row ? mapRow(row.horoscope) : null;
}

export async function saveDailyHoroscope(
  telegramId: string,
  input: Omit<DailyHoroscope, "id" | "createdAt">,
): Promise<DailyHoroscope> {
  if (!db) {
    const key = horoscopeKey(telegramId, input.localDate);
    const existing = memoryHoroscopes.get(key);
    const saved: DailyHoroscope = {
      ...input,
      id: existing?.id ?? String(++memoryId),
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    };
    memoryHoroscopes.set(key, saved);
    return saved;
  }

  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.telegramId, telegramId))
    .limit(1);
  if (!user) throw new Error("User not found");

  const values = {
    userId: user.id,
    localDate: input.localDate,
    timeZone: input.timeZone,
    title: input.title,
    content: input.content,
    transitData: {
      transits: input.transits,
      aspects: input.aspects,
      natalPrecision: input.natalPrecision,
    },
  };
  const [row] = await db
    .insert(dailyHoroscopes)
    .values(values)
    .onConflictDoUpdate({
      target: [dailyHoroscopes.userId, dailyHoroscopes.localDate],
      set: {
        title: input.title,
        content: input.content,
        transitData: values.transitData,
        createdAt: new Date(),
      },
    })
    .returning();
  if (!row) throw new Error("Daily horoscope was not saved");
  return mapRow(row);
}

export async function listDailyHoroscopes(
  telegramId: string,
  limit = 14,
): Promise<DailyHoroscope[]> {
  if (!db) {
    return [...memoryHoroscopes.values()]
      .filter((item) => [...memoryHoroscopes.keys()].some((key) => key.startsWith(`${telegramId}:`) && memoryHoroscopes.get(key)?.id === item.id))
      .sort((left, right) => right.localDate.localeCompare(left.localDate))
      .slice(0, limit);
  }
  const rows = await db
    .select({ horoscope: dailyHoroscopes })
    .from(dailyHoroscopes)
    .innerJoin(users, eq(dailyHoroscopes.userId, users.id))
    .where(eq(users.telegramId, telegramId))
    .orderBy(desc(dailyHoroscopes.localDate), desc(dailyHoroscopes.createdAt))
    .limit(limit);
  return rows.map((row) => mapRow(row.horoscope));
}

export async function getHoroscopePreferences(
  telegramId: string,
  suggestedTimeZone: string,
): Promise<HoroscopePreferences> {
  if (!db) {
    const saved = memoryPreferences.get(telegramId);
    return saved
      ? { timeZone: saved.timeZone, notificationsEnabled: saved.notificationsEnabled, notificationTime: saved.notificationTime }
      : { timeZone: suggestedTimeZone, notificationsEnabled: false, notificationTime: "09:00" };
  }
  const [row] = await db
    .select({
      timeZone: horoscopePreferences.timeZone,
      notificationsEnabled: horoscopePreferences.notificationsEnabled,
      notificationTime: horoscopePreferences.notificationTime,
    })
    .from(horoscopePreferences)
    .innerJoin(users, eq(horoscopePreferences.userId, users.id))
    .where(eq(users.telegramId, telegramId))
    .limit(1);
  return row ?? {
    timeZone: suggestedTimeZone,
    notificationsEnabled: false,
    notificationTime: "09:00",
  };
}

export async function saveHoroscopePreferences(
  telegramId: string,
  input: HoroscopePreferences,
): Promise<HoroscopePreferences> {
  if (!db) {
    const existing = memoryPreferences.get(telegramId);
    memoryPreferences.set(telegramId, {
      ...input,
      lastSentLocalDate: existing?.lastSentLocalDate ?? null,
    });
    return input;
  }
  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.telegramId, telegramId))
    .limit(1);
  if (!user) throw new Error("User not found");
  const [row] = await db
    .insert(horoscopePreferences)
    .values({
      userId: user.id,
      timeZone: input.timeZone,
      notificationsEnabled: input.notificationsEnabled,
      notificationTime: input.notificationTime,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: horoscopePreferences.userId,
      set: {
        timeZone: input.timeZone,
        notificationsEnabled: input.notificationsEnabled,
        notificationTime: input.notificationTime,
        updatedAt: new Date(),
      },
    })
    .returning({
      timeZone: horoscopePreferences.timeZone,
      notificationsEnabled: horoscopePreferences.notificationsEnabled,
      notificationTime: horoscopePreferences.notificationTime,
    });
  if (!row) throw new Error("Horoscope preferences were not saved");
  return row;
}

export async function listDueHoroscopeNotifications(
  now = new Date(),
): Promise<DueHoroscopeNotification[]> {
  if (!db) return [];
  const rows = await db
    .select({
      telegramId: users.telegramId,
      timeZone: horoscopePreferences.timeZone,
      notificationTime: horoscopePreferences.notificationTime,
      lastSentLocalDate: horoscopePreferences.lastSentLocalDate,
    })
    .from(horoscopePreferences)
    .innerJoin(users, eq(horoscopePreferences.userId, users.id))
    .where(eq(horoscopePreferences.notificationsEnabled, true));

  return rows.flatMap((row) => {
    try {
      const localDate = getLocalDate(now, row.timeZone);
      const currentTime = localClock(now, row.timeZone);
      if (currentTime < row.notificationTime || row.lastSentLocalDate === localDate) return [];
      return [{ telegramId: row.telegramId, timeZone: row.timeZone, localDate }];
    } catch {
      return [];
    }
  });
}

export async function markHoroscopeNotificationSent(
  telegramId: string,
  localDate: string,
): Promise<void> {
  if (!db) {
    const current = memoryPreferences.get(telegramId);
    if (current) memoryPreferences.set(telegramId, { ...current, lastSentLocalDate: localDate });
    return;
  }
  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.telegramId, telegramId))
    .limit(1);
  if (!user) return;
  await db
    .update(horoscopePreferences)
    .set({ lastSentLocalDate: localDate, updatedAt: new Date() })
    .where(and(
      eq(horoscopePreferences.userId, user.id),
      eq(horoscopePreferences.notificationsEnabled, true),
    ));
}
