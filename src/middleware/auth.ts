import { defineMiddleware } from "astro:middleware"

const IGNORED_ROUTES = ["/docs/"]
const PROTECTED_ROUTES = ["/internal"]

export const auth = defineMiddleware(async (context, next) => {
  const isIgnored = IGNORED_ROUTES.some((path) => context.url.pathname.includes(path))
  const isProtected = PROTECTED_ROUTES.some((path) => context.url.pathname.startsWith(path))

  if (isIgnored) {
    context.locals.user = null
    context.locals.session = null
  } else {
    const { auth } = await import("@/auth/auth")
    const isAuthed = await auth.api.getSession({ headers: context.request.headers })
    context.locals.user = isAuthed?.user ?? null
    context.locals.session = isAuthed?.session ?? null
  }

  if (context.url.pathname === "/auth") {
    return context.redirect("/auth/sign-in")
  }

  if (
    (context.url.pathname === "/auth/sign-in" || context.url.pathname === "/auth/sign-up") &&
    context.locals.session
  ) {
    return context.redirect("/")
  }

  if (isProtected && !context.locals.session) {
    return context.redirect("/auth/sign-in")
  }

  return next()
})
