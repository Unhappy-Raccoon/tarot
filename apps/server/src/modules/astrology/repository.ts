import { createHash } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { natalCharts, users } from "../../db/schema.js";
import { getUserProfile } from "../users/repository.js";
import { calculateNatalChart, type NatalBirthData } from "./calculator.js";
import type { NatalChartResult } from "./types.js";

const memoryCharts = new Map<string, { inputHash: string; chart: NatalChartResult }>();

function birthDataFromProfile(profile: NonNullable<Awaited<ReturnType<typeof getUserProfile>>>): NatalBirthData {
  if (!profile.birthProfile) {
    throw new Error("Birth profile is required before calculating a natal chart");
  }
  return profile.birthProfile;
}

function fingerprint(input: NatalBirthData): string {
  return createHash("sha256").update(JSON.stringify(input)).digest("hex");
}

export async function getOrCreateNatalChart(
  telegramId: string,
): Promise<NatalChartResult> {
  const profile = await getUserProfile(telegramId);
  if (!profile) throw new Error("User not found");
  const birthData = birthDataFromProfile(profile);
  const inputHash = fingerprint(birthData);

  if (!db) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("DATABASE_URL is required in production");
    }
    const cached = memoryCharts.get(telegramId);
    if (cached?.inputHash === inputHash) return cached.chart;
    const chart = calculateNatalChart(birthData);
    memoryCharts.set(telegramId, { inputHash, chart });
    return chart;
  }

  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.telegramId, telegramId))
    .limit(1);
  if (!user) throw new Error("User not found");

  const [cached] = await db
    .select()
    .from(natalCharts)
    .where(eq(natalCharts.userId, user.id))
    .limit(1);

  if (cached?.inputHash === inputHash) return cached.chartData;

  const chart = calculateNatalChart(birthData);
  await db
    .insert(natalCharts)
    .values({
      userId: user.id,
      inputHash,
      algorithmVersion: chart.algorithmVersion,
      chartData: chart,
      calculatedAt: new Date(chart.calculatedAt),
    })
    .onConflictDoUpdate({
      target: natalCharts.userId,
      set: {
        inputHash,
        algorithmVersion: chart.algorithmVersion,
        chartData: chart,
        calculatedAt: new Date(chart.calculatedAt),
      },
    });

  return chart;
}
