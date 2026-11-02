import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema.js";

const connectionString = process.env.DATABASE_URL;
const configuredPoolMax = Number(process.env.DATABASE_POOL_MAX ?? 5);
const poolMax = Number.isInteger(configuredPoolMax) && configuredPoolMax >= 1 && configuredPoolMax <= 10
  ? configuredPoolMax
  : 5;

const sqlClient = connectionString
  ? postgres(connectionString, {
      // Supabase Transaction pooler uses transaction pooling. Disabling prepared
      // statements also works with a direct PostgreSQL connection.
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
  } catch {
    return { configured: true, connected: false, ready: false, missingTables: [] };
  }
}

export async function closeDatabase(): Promise<void> {
  if (sqlClient) await sqlClient.end({ timeout: 5 });
}
