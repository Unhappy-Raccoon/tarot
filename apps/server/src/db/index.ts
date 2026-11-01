import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema.js";

const connectionString = process.env.DATABASE_URL;
const sqlClient = connectionString
  ? postgres(connectionString, { max: 10, connect_timeout: 5 })
  : null;

export const db = sqlClient ? drizzle(sqlClient, { schema }) : null;

export async function closeDatabase(): Promise<void> {
  if (sqlClient) {
    await sqlClient.end({ timeout: 5 });
  }
}
