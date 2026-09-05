import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import type { NeonHttpDatabase } from "drizzle-orm/neon-http"
import * as schema from "#db/schema"

export * from "#db/schema"
export { schema }

function createStubChain(): any {
  const handler: ProxyHandler<any> = {
    get(_target, prop) {
      if (prop === "then") {
        return (resolve: (val: any[]) => void) => Promise.resolve([]).then(resolve)
      }
      if (prop === "catch") {
        return (fn: (err: any) => any) => Promise.resolve([]).catch(fn)
      }
      return () => new Proxy(() => {}, handler)
    },
    apply() {
      return new Proxy(() => {}, handler)
    }
  }
  return new Proxy(() => {}, handler)
}

function stub(): NeonHttpDatabase<typeof schema>
function stub(): unknown {
  return createStubChain()
}

let db!: NeonHttpDatabase<typeof schema>

const databaseUrl = import.meta.env.DATABASE_URL ?? process.env.DATABASE_URL

if (databaseUrl) {
  db = drizzle(neon(databaseUrl), { schema })
} else {
  db = stub()
}

export { db }
