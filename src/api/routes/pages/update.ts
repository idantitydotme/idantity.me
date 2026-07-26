import { Hono } from "hono"
import { db } from "@/db"
import { pages } from "@/db/schema"
import { eq } from "drizzle-orm"

const api = new Hono()

api.put("/id/:id", async (c) => {
  try {
    const id = c.req.param("id")
    const body = await c.req.json()
    const { title, description, tags, blocks, properties, type, slug } = body

    await db
      .update(pages)
      .set({
        ...(title ? { title } : {}),
        ...(description ? { description } : {}),
        ...(tags ? { tags } : {}),
        ...(slug ? { slug } : {}),
        ...(type ? { type } : {}),
        content: { blocks: blocks || [], properties: properties || {} },
        updatedAt: new Date()
      })
      .where(eq(pages.id, id))

    return c.json({ success: true })
  } catch (err: any) {
    return c.json({ error: err.message }, 500)
  }
})

export default api
