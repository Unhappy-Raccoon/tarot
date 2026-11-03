import { getRuntimeEnv } from "../config/env.js";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema.js";

const connectionString = getRuntimeEnv("DATABASE_URL");
const configuredPoolMax = Number(getRuntimeEnv("DATABASE_POOL_MAX") ?? 5);
const poolMax = Number.isInteger(configuredPoolMax) && configuredPoolMax >= 1 && configuredPoolMax <= 10
  ? configuredPoolMax
  : 5;

const sqlClient = connectionString
  ? postgres(connectionString, {
      // Supabase test deployment uses Session Pooler: postgres.js query pipelining
      // and Drizzle transactions are not safe with the shared transaction-mode pooler.
      // Keep DATABASE_POOL_MAX=1 per Edge isolate to limit held server connections.
      prepare: false,
      max: poolMax,
      connect_timeout: 5,
      idle_timeout: 20,
      max_lifetime: 60 * 30,
    })
  : null;

export const db = sqlClient ? drizzle(sqlClient, { schema }) : null;

const REQUIRED_TABLES = [
  "users",
  "birth_profiles",
  "tarot_readings",
  "natal_charts",
  "ai_conversations",
  "ai_messages",
  "ai_daily_usage",
  "daily_horoscopes",
  "horoscope_preferences",
] as const;

export interface DatabaseReadiness {
  configured: boolean;
  connected: boolean;
  ready: boolean;
  missingTables: string[];
}

/** Checks PostgreSQL connectivity and the schema required by the current MVP. */
export async function checkDatabaseReadiness(): Promise<DatabaseReadiness> {
  if (!sqlClient) {
    return {
      configured: false,
      connected: false,
      ready: false,
      missingTables: [...REQUIRED_TABLES],
    };
  }

  try {
    const rows = await sqlClient`
      select table_name
      from information_schema.tables
      where table_schema = 'public'
        and table_type = 'BASE TABLE'
        and table_name in (
          'users', 'birth_profiles', 'tarot_readings', 'natal_charts',
          'ai_conversations', 'ai_messages', 'ai_daily_usage',
          'daily_horoscopes', 'horoscope_preferences'
        )
    `;
    const existingTables = new Set(rows.map((row) => String(row.table_name)));
    const missingTables = REQUIRED_TABLES.filter((table) => !existingTables.has(table));
    return {
      configured: true,
      connected: true,
      ready: missingTables.length === 0,
      missingTables,
    };
  } catch (error) {
    const errorName = error instanceof Error ? error.name : "unknown";
    const errorMessage = error instanceof Error ? error.message : String(error);
    const safeMessage = errorMessage
      .replace(/postgres(?:ql)?:\/\/[^\s"']+/gi, "[redacted database URL]")
      .replace(/Bearer\s+[^\s"']+/gi, "Bearer [redacted]")
      .replace(/(password|token|secret|api[_-]?key)\s*[:=]\s*[^,\s]+/gi, "$1=[redacted]")
      .slice(0, 500);
    console.error("Database readiness check failed", errorName, safeMessage);
    return { configured: true, connected: false, ready: false, missingTables: [] };
  }
}

export async function closeDatabase(): Promise<void> {
  if (sqlClient) await sqlClient.end({ timeout: 5 });
}
