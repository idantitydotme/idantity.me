import { Hono } from "hono"
import { db } from "@/db"
import { pages } from "@/db/schema"
import { eq, and, or, isNull } from "drizzle-orm"

const api = new Hono()

api.get("/id/:id", async (c) => {
  try {
    const id = c.req.param("id")
    const [row] = await db
      .select()
      .from(pages)
      .where(and(eq(pages.id, id), isNull(pages.deletedAt)))
      .limit(1)
    if (!row) return c.json({ error: "Page not found" }, 404)
    return c.json({
      ...row,
      blocks: row.content?.blocks || [],
      properties: row.content?.properties || {}
    })
  } catch (err: any) {
    return c.json({ error: err.message }, 500)
  }
})

api.get("/find/:slug{.*}", async (c) => {
  try {
    const rawSlug = c.req.param("slug") || ""
    const cleanSlug = rawSlug.replace(/^\/|\/$/g, "")
    const [row] = await db
      .select()
      .from(pages)
      .where(
        and(or(eq(pages.slug, cleanSlug), eq(pages.slug, `/${cleanSlug}`)), isNull(pages.deletedAt))
      )
      .limit(1)
    if (!row) return c.json({ error: "Page not found" }, 404)
    return c.json({
      ...row,
      blocks: row.content?.blocks || [],
      properties: row.content?.properties || {}
    })
  } catch (err: any) {
    return c.json({ error: err.message }, 500)
  }
})

export default api
