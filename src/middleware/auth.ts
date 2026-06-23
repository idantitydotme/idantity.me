import { defineMiddleware } from "astro:middleware"
import { env } from "cloudflare:workers"

const IGNORED_ROUTES = ["/docs/"]
const PROTECTED_ROUTES = ["/internal"]

export const auth = defineMiddleware(async (context, next) => {
  if (env && (env as Record<string, any>).BLOB) {
    // eslint-disable-next-line typescript/no-unsafe-type-assertion
    ;(globalThis as any).BLOB = (env as Record<string, any>).BLOB
  }

  const isIgnored = IGNORED_ROUTES.some((path) => context.url.pathname.includes(path))
  const isProtected = PROTECTED_ROUTES.some((path) => context.url.pathname.startsWith(path))

  if (isIgnored) {
    context.locals.user = null
    context.locals.session = null
  } else {
    const betterAuth = (await import("@/auth/auth")).auth
    const isAuthed = await betterAuth.api.getSession({ headers: context.request.headers })
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

  if (context.url.pathname.includes("/construction") && context.locals.session) {
    return context.redirect("/")
  }

  return next()
})
