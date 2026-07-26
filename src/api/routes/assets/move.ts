import { Hono } from "hono"
import { getCloudflareEnv } from "../../lib/env"
import { getFetchState } from "astro/hono"

const api = new Hono()

function requireAuth(c: any) {
  const state = getFetchState(c)
  if (!state.locals.user) return c.text("Unauthorized", 401)
  return null
}

api.post("/:key{.*}", async (c) => {
  const error = requireAuth(c)
  if (error) return error

  const key = c.req.param("key")
  if (!key) return c.text("Bad Request", 400)

  const env = await getCloudflareEnv(c)
  const BLOB = env?.BLOB
  if (!BLOB) {
    console.warn("[R2 Assets] Cloudflare R2 bucket (BLOB) not bound for POST.")
    return c.json({ success: true, localMock: true })
  }

  const body: Record<string, unknown> = await c.req.json()
  const newKey = body.to
  if (typeof newKey !== "string") return c.text("Missing or invalid target key ('to')", 400)

  const obj = await BLOB.get(key)
  if (!obj) return c.text("Source object not found", 404)
  if (!obj.body) return c.text("Source object has no body", 500)

  await BLOB.put(newKey, obj.body, {
    httpMetadata: { contentType: obj.httpMetadata?.contentType || "application/octet-stream" }
  })
  await BLOB.delete(key)

  return c.json({ success: true })
})

export default api
