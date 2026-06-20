import postgres from "postgres";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";

import * as schema from "@/lib/db/schema";

const connectionString =
  process.env.DATABASE_URL ?? "postgres://postgres:postgres@localhost:5432/sitio_ferreteria";

declare global {
  var __dbClient: ReturnType<typeof postgres> | undefined;
  var __db: PostgresJsDatabase<typeof schema> | undefined;
}

const client = globalThis.__dbClient ?? postgres(connectionString, { max: 1 });

if (process.env.NODE_ENV !== "production") {
  globalThis.__dbClient = client;
}

export const db = globalThis.__db ?? drizzle(client, { schema });

if (process.env.NODE_ENV !== "production") {
  globalThis.__db = db;
}

export type Db = typeof db;
