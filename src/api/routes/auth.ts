import { Hono } from "hono"
import { auth } from "#auth/auth"

const api = new Hono()

api.on(["GET", "POST"], "/*", async (c) => {
  return auth.handler(c.req.raw)
})

export default api
