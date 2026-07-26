import { Hono } from "hono"
import { db } from "@/db"
import { pages } from "@/db/schema"

const api = new Hono()

api.post("/", async (c) => {
  try {
    const body = await c.req.json()
    const { title, slug, type, description, blocks, properties } = body

    const [newPage] = await db
      .insert(pages)
      .values({
        title: title || { en: "Untitled Page" },
        slug: slug || `page-${Date.now()}`,
        type: type || "Default",
        description: description || { en: "" },
        content: { blocks: blocks || [], properties: properties || {} }
      })
      .returning()

    return c.json(newPage)
  } catch (err: any) {
    return c.json({ error: err.message }, 500)
  }
})

export default api
