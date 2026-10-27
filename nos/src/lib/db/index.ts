import { createClient, type Client } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

/**
 * Banco de dados: libSQL/SQLite.
 * - Local: arquivo em ./data/nos.db (DATABASE_URL=file:./data/nos.db)
 * - Produção: Turso (DATABASE_URL=libsql://... + DATABASE_AUTH_TOKEN)
 */
/** DATABASE_URL, ou TURSO_DATABASE_URL (criada pela integração Turso da Vercel). */
export function databaseUrl() {
  return process.env.DATABASE_URL || process.env.TURSO_DATABASE_URL || "file:./data/nos.db";
}

const globalForDb = globalThis as unknown as { __nosClient?: Client };

function makeClient() {
  return createClient({ url: databaseUrl(), authToken: process.env.DATABASE_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN });
}

export const client = globalForDb.__nosClient ?? makeClient();
if (process.env.NODE_ENV !== "production") globalForDb.__nosClient = client;

export const db = drizzle(client, { schema });
export { schema };
