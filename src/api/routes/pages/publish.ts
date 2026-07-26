import { Hono } from "hono"
import { db } from "@/db"
import { pages } from "@/db/schema"
import { eq } from "drizzle-orm"

const api = new Hono()

api.post("/id/:id/publish", async (c) => {
  try {
    await db
      .update(pages)
      .set({ postedAt: new Date(), updatedAt: new Date() })
      .where(eq(pages.id, c.req.param("id")))
    return c.json({ success: true })
  } catch (err: any) {
    return c.json({ error: err.message }, 500)
  }
})

export default api
