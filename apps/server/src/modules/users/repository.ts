import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { birthProfiles, users } from "../../db/schema.js";

export interface TelegramUserInput {
  telegramId: string;
  firstName: string;
  lastName?: string;
  username?: string;
  languageCode?: string;
}

export interface BirthProfileInput {
  displayName: string;
  birthDate: string;
  birthTime?: string;
  birthPlace?: string;
  birthTimeZone?: string;
  birthLatitude?: number;
  birthLongitude?: number;
}

export interface UserProfile {
  telegramId: string;
  firstName: string;
  lastName: string | null;
  username: string | null;
  languageCode: string | null;
  plan: "free" | "premium";
  birthProfile: BirthProfileInput | null;
}

const memoryUsers = new Map<string, UserProfile>();

function mapPlan(value: string): "free" | "premium" {
  return value === "premium" ? "premium" : "free";
}

export async function upsertTelegramUser(
  input: TelegramUserInput,
): Promise<UserProfile> {
  if (!db) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("DATABASE_URL is required in production");
    }

    const existing = memoryUsers.get(input.telegramId);
    const next: UserProfile = {
      telegramId: input.telegramId,
      firstName: input.firstName,
      lastName: input.lastName ?? null,
      username: input.username ?? null,
      languageCode: input.languageCode ?? null,
      plan: existing?.plan ?? "free",
      birthProfile: existing?.birthProfile ?? null,
    };
    memoryUsers.set(input.telegramId, next);
    return next;
  }

  await db
    .insert(users)
    .values({
      telegramId: input.telegramId,
      firstName: input.firstName,
      lastName: input.lastName ?? null,
      username: input.username ?? null,
      languageCode: input.languageCode ?? null,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: users.telegramId,
      set: {
        firstName: input.firstName,
        lastName: input.lastName ?? null,
        username: input.username ?? null,
        languageCode: input.languageCode ?? null,
        updatedAt: new Date(),
      },
    });

  const result = await getUserProfile(input.telegramId);
  if (!result) throw new Error("User upsert did not return a user");
  return result;
}

export async function getUserProfile(
  telegramId: string,
): Promise<UserProfile | null> {
  if (!db) return memoryUsers.get(telegramId) ?? null;

  const [row] = await db
    .select({
      telegramId: users.telegramId,
      firstName: users.firstName,
      lastName: users.lastName,
      username: users.username,
      languageCode: users.languageCode,
      plan: users.plan,
      displayName: birthProfiles.displayName,
      birthDate: birthProfiles.birthDate,
      birthTime: birthProfiles.birthTime,
      birthPlace: birthProfiles.birthPlace,
      birthTimeZone: birthProfiles.birthTimeZone,
      birthLatitude: birthProfiles.birthLatitude,
      birthLongitude: birthProfiles.birthLongitude,
    })
    .from(users)
    .leftJoin(birthProfiles, eq(users.id, birthProfiles.userId))
    .where(eq(users.telegramId, telegramId))
    .limit(1);

  if (!row) return null;
  const birthProfile =
    row.displayName && row.birthDate
      ? {
          displayName: row.displayName,
          birthDate: row.birthDate,
          ...(row.birthTime ? { birthTime: row.birthTime } : {}),
          ...(row.birthPlace ? { birthPlace: row.birthPlace } : {}),
          ...(row.birthTimeZone ? { birthTimeZone: row.birthTimeZone } : {}),
          ...(row.birthLatitude !== null ? { birthLatitude: row.birthLatitude } : {}),
          ...(row.birthLongitude !== null ? { birthLongitude: row.birthLongitude } : {}),
        }
      : null;

  return {
    telegramId: row.telegramId,
    firstName: row.firstName,
    lastName: row.lastName,
    username: row.username,
    languageCode: row.languageCode,
    plan: mapPlan(row.plan),
    birthProfile,
  };
}

export async function saveBirthProfile(
  telegramId: string,
  input: BirthProfileInput,
): Promise<UserProfile> {
  if (!db) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("DATABASE_URL is required in production");
    }
    const user = memoryUsers.get(telegramId);
    if (!user) throw new Error("User not found");
    const updated = { ...user, birthProfile: input };
    memoryUsers.set(telegramId, updated);
    return updated;
  }

  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.telegramId, telegramId))
    .limit(1);

  if (!user) throw new Error("User not found");

  await db
    .insert(birthProfiles)
    .values({
      userId: user.id,
      displayName: input.displayName,
      birthDate: input.birthDate,
      birthTime: input.birthTime ?? null,
      birthPlace: input.birthPlace ?? null,
      birthTimeZone: input.birthTimeZone ?? null,
      birthLatitude: input.birthLatitude ?? null,
      birthLongitude: input.birthLongitude ?? null,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: birthProfiles.userId,
      set: {
        displayName: input.displayName,
        birthDate: input.birthDate,
        birthTime: input.birthTime ?? null,
        birthPlace: input.birthPlace ?? null,
        birthTimeZone: input.birthTimeZone ?? null,
        birthLatitude: input.birthLatitude ?? null,
        birthLongitude: input.birthLongitude ?? null,
        updatedAt: new Date(),
      },
    });

  const result = await getUserProfile(telegramId);
  if (!result) throw new Error("Updated user not found");
  return result;
}
