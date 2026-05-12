import { auth as betterAuth } from "@/auth/auth"
import { defineMiddleware } from "astro:middleware"

const DOCS_PATTERN = /^\/[^/]+\/docs\//

export const auth = defineMiddleware(async (context, next) => {
  const protectedRoutes = ["/internal"]

  const isProtected = protectedRoutes.some((path) => context.url.pathname.startsWith(path))

  let isAuthed = null
  if (!DOCS_PATTERN.test(context.url.pathname)) {
    isAuthed = await betterAuth.api.getSession({
      headers: context.request.headers
    })
  }

  context.locals.user = isAuthed?.user ?? null
  context.locals.session = isAuthed?.session ?? null

  if (isProtected && !context.locals.session) {
    return context.redirect("/auth/sign-in")
  }

  return next()
})
