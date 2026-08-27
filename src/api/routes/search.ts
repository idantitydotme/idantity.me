import { Hono } from "hono"
import { db } from "@/db"
import { searchIndex } from "@/db/schema"
import { sql, desc, or, ilike } from "drizzle-orm"

const api = new Hono()

api.get("/", async (c) => {
  const q = c.req.query("q") || ""

  if (!q.trim()) {
    return c.json([])
  }

  try {
    const cleanQuery = q.trim().replace(/[!|&()*]/g, "")
    const terms = cleanQuery.split(/\s+/).filter(Boolean)
    const formattedQuery = terms.map((t) => `${t}:*`).join(" & ")

    console.log("[Search API] Query:", q, "Formatted:", formattedQuery)

    let results = []
    try {
      const querySql = formattedQuery
        ? sql`to_tsquery('english', ${formattedQuery})`
        : sql`websearch_to_tsquery('english', ${q})`

      results = await db
        .select({
          title: searchIndex.title,
          url: searchIndex.url,
          sourceType: searchIndex.sourceType,
          rank: sql<number>`ts_rank(${searchIndex.searchVector}, ${querySql})`,
          snippet: sql<string>`ts_headline('english', ${searchIndex.bodyContent}, ${querySql}, 'StartSel=<mark>, StopSel=</mark>, MaxWords=20')`
        })
        .from(searchIndex)
        .where(
          sql`${searchIndex.searchVector} @@ ${querySql} or ${searchIndex.title} ilike ${`%${q}%`}`
        )
        .orderBy(
          desc(sql`ts_rank(${searchIndex.searchVector}, ${querySql})`),
          desc(searchIndex.updatedAt)
        )
        .limit(10)
    } catch (dbErr: any) {
      console.warn("[Search API] FTS query failed, falling back to ILIKE search:", dbErr.message)
      results = await db
        .select({
          title: searchIndex.title,
          url: searchIndex.url,
          sourceType: searchIndex.sourceType,
          rank: sql<number>`1`,
          snippet: sql<string>`substring(${searchIndex.bodyContent} from 1 for 150)`
        })
        .from(searchIndex)
        .where(or(ilike(searchIndex.title, `%${q}%`), ilike(searchIndex.bodyContent, `%${q}%`)))
        .orderBy(desc(searchIndex.updatedAt))
        .limit(10)
    }

    console.log("[Search API] Found results:", results.length)
    return c.json(results)
  } catch (error: any) {
    console.error("[Search API Global Error]:", error)
    return c.json({ error: error.message }, 500)
  }
})

export default api
