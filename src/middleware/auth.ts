import { auth as betterAuth } from "@/auth/auth"
import { defineMiddleware } from "astro:middleware"

export const auth = defineMiddleware(async (context, next) => {
  const protectedRoutes = ["/internal"]

  const isProtected = protectedRoutes.some((path) => context.url.pathname.startsWith(path))

  const isAuthed = await betterAuth.api.getSession({
    headers: Object.fromEntries(context.request.headers.entries())
  })

  context.locals.user = isAuthed?.user ?? null
  context.locals.session = isAuthed?.session ?? null

  if (isProtected && !context.locals.session) {
    return context.redirect("/auth/sign-in")
  }

  return next()
})
