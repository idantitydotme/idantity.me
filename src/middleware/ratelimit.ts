import { env } from "cloudflare:workers"

const SENSITIVE_ROUTES = ["/auth/sign-in", "/auth/sign-up", "/api/upload", "/api/chat"]

export const ratelimit = async (c: any, next: any) => {
  const isSensitive = SENSITIVE_ROUTES.some((path) => c.req.path.includes(path))
  if (!isSensitive) {
    return next()
  }

  // eslint-disable-next-line typescript/no-unsafe-type-assertion
  const limiter = c.env?.MY_RATE_LIMITER ?? (env as any)?.MY_RATE_LIMITER
  if (!limiter) {
    // Falls back/fails-open during local dev if the mock binding is not active
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

  await next()
}
