import { defineMiddleware } from "astro:middleware"

const IGNORED_ROUTES = ["/docs/"]
const PROTECTED_ROUTES = ["/internal"]

export const onRequest = defineMiddleware(async (context, next) => {
  const isIgnored = IGNORED_ROUTES.some((path) => context.url.pathname.includes(path))
  const isProtected = PROTECTED_ROUTES.some((path) => context.url.pathname.startsWith(path))

  if (!isIgnored) {
    const { auth } = await import("@/auth/auth")
    const session = await auth.api.getSession({ headers: context.request.headers })
    context.locals.user = session?.user ?? null
    context.locals.session = session?.session ?? null
  }

  if (isProtected && !context.locals.session) {
    return context.redirect("/auth/sign-in")
  }

  return next()
})
