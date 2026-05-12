import { auth as betterAuth } from "@/auth/auth"
import { defineMiddleware } from "astro:middleware"

export const auth = defineMiddleware(async (context, next) => {
  const protectedRoutes = ["/internal"]

  const isProtected = protectedRoutes.some((path) => context.url.pathname.startsWith(path))

  let isAuthed = null
  try {
    isAuthed = await betterAuth.api.getSession({
      headers: context.request.headers
    })
  } catch {
    // `getSession` throws runtime errors in Starlight routes with Cloudflare Workers
    // Auth will be unavailable but not crash the page
  }

  context.locals.user = isAuthed?.user ?? null
  context.locals.session = isAuthed?.session ?? null

  if (isProtected && !context.locals.session) {
    return context.redirect("/auth/sign-in")
  }

  return next()
})
