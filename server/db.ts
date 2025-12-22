import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

// We use the DATABASE_URL if available, but for this MVP we might be using MemStorage.
// However, the template requires this file.
// If DATABASE_URL is not set (e.g. focused on frontend/MVP), we can't initialize the pool.
// But the environment usually has it if we provisioned it.

if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL is not set. Database features will not work.");
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });
