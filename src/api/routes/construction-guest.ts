import { Hono } from "hono"
import { signInConstructionGuest } from "@/auth/construction-guest"

const api = new Hono()

api.post("/", async (c) => {
  const body = await c.req.json<{ email?: string; password?: string; rememberMe?: boolean }>()
  const signedIn = await signInConstructionGuest(
    c,
    body.email ?? "",
    body.password ?? "",
    body.rememberMe ?? true
  )

  if (!signedIn) return c.json({ error: "Invalid credentials" }, 401)
  return c.json({ success: true })
})

export default api
