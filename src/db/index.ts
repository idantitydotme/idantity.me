import { drizzle } from "drizzle-orm/d1"
import * as schema from "./schema/index.ts"
import { env } from "cloudflare:workers"

export function getDb(d1?: D1Database) {
  const d1Binding = d1 || (env as any)?.DB
  if (!d1Binding) {
    throw new Error("[db] D1 database binding 'DB' is not available.")
  }
  return drizzle(d1Binding, { schema })
}

export type DbClient = ReturnType<typeof getDb>
export * from "./schema/index.ts"
export { schema }

function anyObject(): any {
  return {}
}

export const db: DbClient = new Proxy(anyObject(), {
  get(_target, prop) {
    if (prop === "then") return undefined
    const client = getDb()
    return Reflect.get(client, prop)
  }
})
