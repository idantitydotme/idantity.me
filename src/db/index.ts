import { drizzle } from "drizzle-orm/d1"
import { env } from "cloudflare:workers"
import * as schema from "./schema/index.ts"

export function getDb(d1: D1Database = env.DB) {
  return drizzle(d1, { schema })
}

export const db = drizzle(env.DB, { schema })

export * from "./schema/index.ts"
