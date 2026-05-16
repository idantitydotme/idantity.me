import type { APIRoute } from "astro"

export const ALL: APIRoute = async (ctx) => {
  const { auth } = await import("@/auth/auth")
  return auth.handler(ctx.request)
}
