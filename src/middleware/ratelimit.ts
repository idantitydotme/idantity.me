import { defineMiddleware } from "astro:middleware"
import { env } from "cloudflare:workers"

const SENSITIVE_ROUTES = ["/auth/sign-in", "/auth/sign-up", "/api/upload", "/api/chat"]

export const ratelimit = defineMiddleware(async (context, next) => {
  const isSensitive = SENSITIVE_ROUTES.some((path) => context.url.pathname.includes(path))
  if (!isSensitive) {
    return next()
  }

  // eslint-disable-next-line typescript/no-unsafe-type-assertion
  const limiter = (env as any)?.MY_RATE_LIMITER
  if (!limiter) {
    // Falls back/fails-open during local dev if the mock binding is not active
    return next()
  }

  const clientIP = context.request.headers.get("CF-Connecting-IP") || "unknown"

  try {
    const { success } = await limiter.limit({ key: clientIP })
    if (!success) {
      return new Response(
        JSON.stringify({
          error: "Too Many Requests",
          message: "Rate limit exceeded. Please try again later."
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": "60"
          }
        }
      )
    }
  } catch (error) {
    console.error("[Rate Limit Error]", error)
  }

  return next()
})
