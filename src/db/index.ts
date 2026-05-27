import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import type { NeonHttpDatabase } from "drizzle-orm/neon-http"
import * as schema from "@/db/schema"

export * from "@/db/schema"
export { schema }

function stub(): NeonHttpDatabase<typeof schema>
function stub(): unknown {
  console.warn("[db] DATABASE_URL is not set. Any attempt to query the database will throw.")
  return new Proxy(
    {},
    {
      get(_target, prop) {
        if (prop === "then") return undefined
        return () => {
          throw new Error(
            "[db] DATABASE_URL is not set. Set the variable and restart the dev server."
          )
        }
      }
    }
  )
}

let db!: NeonHttpDatabase<typeof schema>

const databaseUrl = import.meta.env.DATABASE_URL ?? process.env.DATABASE_URL

if (databaseUrl) {
  db = drizzle(neon(databaseUrl), { schema })
} else if (import.meta.env.PROD) {
  throw new Error("[db] DATABASE_URL is not set. Cannot start in production.")
} else {
  db = stub()
}

export { db }
