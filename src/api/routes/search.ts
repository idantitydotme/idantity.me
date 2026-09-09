import { Hono } from "hono"
import { db } from "#db"
import { searchIndex } from "#db/schema"
import { desc, or, like } from "drizzle-orm"

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

    const results = await db
      .select({
        title: searchIndex.title,
        url: searchIndex.url,
        sourceType: searchIndex.sourceType,
        snippet: searchIndex.bodyContent
      })
      .from(searchIndex)
      .where(or(like(searchIndex.title, `%${q}%`), like(searchIndex.bodyContent, `%${q}%`)))
      .orderBy(desc(searchIndex.updatedAt))
      .limit(10)

    console.log("[Search API] Found results:", results.length)
    return c.json(results)
  } catch (error: any) {
    console.error("[Search API Global Error]:", error)
    return c.json({ error: error.message }, 500)
  }
})

export default api
