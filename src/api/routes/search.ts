import { Hono } from "hono"

const api = new Hono()

api.get("/", async (c) => {
  return c.json([])
})

export default api
