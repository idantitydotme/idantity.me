import { Hono } from "hono"
import { auth } from "#auth/auth"

const api = new Hono()

/**
 * GET /api/auth/session Returns the current CF Access session context, or null.
 */
api.get("/session", async (c) => {
  const session = await auth.getSession(c.req.raw)
  if (!session) {
    return c.json({ user: null, session: null })
  }
  return c.json({
    user: session,
    session: { id: session.userId, userId: session.userId }
  })
})

/**
 * GET /api/auth/me Returns the authenticated user or 401.
 */
api.get("/me", async (c) => {
  const session = await auth.getSession(c.req.raw)
  if (!session) return c.json({ error: "Unauthorized" }, 401)
  return c.json({ user: session })
})

export default api
