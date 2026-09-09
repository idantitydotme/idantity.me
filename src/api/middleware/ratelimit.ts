import { env } from "cloudflare:workers"
import type { Context } from "hono"

// Routes that require rate limiting
const SENSITIVE_ROUTES = ["/auth/sign-in", "/auth/sign-up", "/api/upload", "/api/chat"]

// Middleware to enforce rate limits on sensitive endpoints
export const ratelimit = async (c: Context<{ Bindings: Env }>, next: any) => {
  const isSensitive = SENSITIVE_ROUTES.some((path) => c.req.path.includes(path))
  if (!isSensitive) {
    return next()
  }

  const bindings = c.env ?? env
  const limiter = bindings?.MY_RATE_LIMITER

  if (!limiter) {
    // Falls back (fails-open) during local development if the mock binding is not active
    return next()
  }

  const clientIP = c.req.header("CF-Connecting-IP") || "unknown"

  try {
    const { success } = await limiter.limit({ key: clientIP })
    if (!success) {
      return c.json(
        {
          error: "Too Many Requests",
          message: "Rate limit exceeded. Please try again later."
        },
        429,
        {
          "Retry-After": "60"
        }
      )
    }
  } catch (error) {
    console.error("[Rate Limit Error]", error)
  }

  return await next()
}
