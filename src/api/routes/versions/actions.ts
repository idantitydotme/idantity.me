import { Hono } from "hono"
import { db } from "@/db"
import { pageVersions, pages } from "@/db/schema"
import { eq } from "drizzle-orm"

const api = new Hono()

api.post("/:id/approve", async (c) => {
  try {
    const [version] = await db
      .select()
      .from(pageVersions)
      .where(eq(pageVersions.id, c.req.param("id")))
      .limit(1)
    if (!version) return c.json({ error: "Version not found" }, 404)

    await db
      .update(pageVersions)
      .set({ status: "approved", approvedAt: new Date() })
      .where(eq(pageVersions.id, c.req.param("id")))
    await db
      .update(pages)
      .set({
        title: version.title,
        description: version.description,
        slug: version.slug,
        type: version.type,
        content: version.content,
        updatedAt: new Date()
      })
      .where(eq(pages.id, version.pageId))

    return c.json({ success: true })
  } catch (err: any) {
    return c.json({ error: err.message }, 500)
  }
})

api.post("/:id/reject", async (c) => {
  try {
    await db
      .update(pageVersions)
      .set({ status: "rejected" })
      .where(eq(pageVersions.id, c.req.param("id")))
    return c.json({ success: true })
  } catch (err: any) {
    return c.json({ error: err.message }, 500)
  }
})

export default api
