import { Hono } from "hono"
import { db } from "@/db"
import { pageVersions } from "@/db/schema"
import { eq, and, isNull, desc } from "drizzle-orm"

const api = new Hono()

api.get("/page/:pageId", async (c) => {
  try {
    const versions = await db
      .select()
      .from(pageVersions)
      .where(and(eq(pageVersions.pageId, c.req.param("pageId")), isNull(pageVersions.deletedAt)))
      .orderBy(desc(pageVersions.createdAt))
    return c.json(versions)
  } catch (err: any) {
    return c.json({ error: err.message }, 500)
  }
})

api.get("/:id", async (c) => {
  try {
    const [version] = await db
      .select()
      .from(pageVersions)
      .where(and(eq(pageVersions.id, c.req.param("id")), isNull(pageVersions.deletedAt)))
      .limit(1)
    if (!version) return c.json({ error: "Version not found" }, 404)
    return c.json(version)
  } catch (err: any) {
    return c.json({ error: err.message }, 500)
  }
})

export default api
