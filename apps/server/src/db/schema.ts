import type { TarotCardDraw, TarotSpreadId } from "../modules/tarot/types.js";
import type { NatalChartResult } from "../modules/astrology/types.js";
import {
  date,
  doublePrecision,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
  index,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  telegramId: varchar("telegram_id", { length: 32 }).notNull().unique(),
  username: varchar("username", { length: 64 }),
  firstName: varchar("first_name", { length: 128 }).notNull(),
  lastName: varchar("last_name", { length: 128 }),
  languageCode: varchar("language_code", { length: 16 }),
  plan: varchar("plan", { length: 16 }).notNull().default("free"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const birthProfiles = pgTable("birth_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  displayName: varchar("display_name", { length: 48 }).notNull(),
  birthDate: date("birth_date", { mode: "string" }).notNull(),
  birthTime: varchar("birth_time", { length: 5 }),
  birthPlace: varchar("birth_place", { length: 160 }),
  birthTimeZone: varchar("birth_time_zone", { length: 64 }),
  birthLatitude: doublePrecision("birth_latitude"),
  birthLongitude: doublePrecision("birth_longitude"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const tarotReadings = pgTable(
  "tarot_readings",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    spreadId: varchar("spread_id", { length: 32 }).$type<TarotSpreadId>().notNull(),
    title: varchar("title", { length: 120 }).notNull(),
    summary: text("summary").notNull(),
    cards: jsonb("cards").$type<TarotCardDraw[]>().notNull(),
    dailyDate: date("daily_date", { mode: "string" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("tarot_readings_daily_unique").on(table.userId, table.dailyDate),
    index("tarot_readings_user_created_idx").on(table.userId, table.createdAt),
  ],
);


export const natalCharts = pgTable("natal_charts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  inputHash: varchar("input_hash", { length: 64 }).notNull(),
  algorithmVersion: varchar("algorithm_version", { length: 32 }).notNull(),
  chartData: jsonb("chart_data").$type<NatalChartResult>().notNull(),
  calculatedAt: timestamp("calculated_at", { withTimezone: true }).notNull(),
});
