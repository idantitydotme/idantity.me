import { Hono } from "hono"
import { getCloudflareEnv } from "../../lib/env"
import { getFetchState } from "astro/hono"

const api = new Hono()

function requireAuth(c: any) {
  const state = getFetchState(c)
  const user = state.locals.user
  if (!user) return c.text("Unauthorized", 401)
  return null
}

api.get("/:key{.*}", async (c) => {
  const error = requireAuth(c)
  if (error) return error

  const key = c.req.param("key")
  if (!key) return c.text("Bad Request", 400)

  const env = await getCloudflareEnv(c)
  const BLOB = env?.BLOB
  if (!BLOB) {
    console.warn("[R2 Assets] Cloudflare R2 bucket (BLOB) not bound for GET.")
    return c.text("R2 not bound in local environment", 503)
  }

  const obj = await BLOB.get(key)
  if (!obj) return c.text("Not Found", 404)

  return new Response(obj.body, {
    headers: { "Content-Type": obj.httpMetadata?.contentType || "application/octet-stream" }
  })
})

export default api
