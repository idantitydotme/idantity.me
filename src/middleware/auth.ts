import { getFetchState } from "astro/hono"
import { env } from "cloudflare:workers"
import { auth as betterAuth } from "@/auth/auth"

const IGNORED_ROUTES = ["/docs/"]
const PROTECTED_ROUTES = ["/internal"]

export const auth = async (c: any, next: any) => {
  if (env && (env as Record<string, any>).BLOB) {
    // eslint-disable-next-line typescript/no-unsafe-type-assertion
    ;(globalThis as any).BLOB = (env as Record<string, any>).BLOB
  }

  const isIgnored = IGNORED_ROUTES.some((path) => c.req.path.includes(path))
  const isProtected = PROTECTED_ROUTES.some((path) => c.req.path.startsWith(path))

  const state = getFetchState(c)

  if (isIgnored) {
    state.locals.user = null
    state.locals.session = null
  } else {
    const isAuthed = await betterAuth.api.getSession({ headers: c.req.raw.headers })
    state.locals.user = isAuthed?.user ?? null
    state.locals.session = isAuthed?.session ?? null
  }

  if (c.req.path === "/auth") {
    return c.redirect("/auth/sign-in")
  }

  if ((c.req.path === "/auth/sign-in" || c.req.path === "/auth/sign-up") && state.locals.session) {
    return c.redirect("/")
  }

  if (isProtected && !state.locals.session) {
    return c.redirect("/auth/sign-in")
  }

  if (c.req.path.includes("/construction") && state.locals.session) {
    return c.redirect("/")
  }

  await next()
}
