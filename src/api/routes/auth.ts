import { Hono } from "hono"
import { auth } from "@rimelight/auth"

const api = new Hono()
  .get("/session", async (c) => {
    const session = await auth.getSession(c.req.raw)
    if (!session) {
      return c.json({ user: null, session: null })
    }
    return c.json({
      user: session,
      session: { id: session.userId, userId: session.userId }
    })
  })
  .get("/me", async (c) => {
    const session = await auth.getSession(c.req.raw)
    if (!session) return c.json({ error: "Unauthorized" }, 401)
    return c.json({ user: session })
  })

export default api
