import { auth as betterAuth } from "#auth/auth"

const PROTECTED_ROUTES = ["/internal"]

export const auth = async (c: any, next: any) => {
  const isProtected = PROTECTED_ROUTES.some((path) => c.req.path.startsWith(path))

  const isAuthed = await betterAuth.api.getSession({ headers: c.req.raw.headers })
  c.set("user", isAuthed?.user ?? null)
  c.set("session", isAuthed?.session ?? null)

  const session = c.get("session")

  if (c.req.path === "/auth") {
    return c.redirect("/auth/sign-in")
  }

  if ((c.req.path === "/auth/sign-in" || c.req.path === "/auth/sign-up") && session) {
    return c.redirect("/")
  }

  if (isProtected && !session) {
    return c.redirect("/auth/sign-in")
  }

  if (c.req.path.includes("/construction") && session) {
    return c.redirect("/")
  }

  return await next()
}
