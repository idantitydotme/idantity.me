import { auth } from "#auth/auth"
import { isConstructionGuest } from "#auth/construction-guest"

const IGNORED_ROUTES = ["/docs/"]
const PROTECTED_ROUTES = ["/internal"]

export const authMiddleware = async (c: any, next: any) => {
  const url = new URL(c.req.url)
  const isIgnored = IGNORED_ROUTES.some((path) => url.pathname.includes(path))
  const isProtected = PROTECTED_ROUTES.some((path) => url.pathname.startsWith(path))

  if (isIgnored) {
    c.set("user", null)
    c.set("session", null)
  } else {
    // CF Access injects cf-access-authenticated-user-email header.
    // Falls back to construction guest for the under-construction page.
    const sessionCtx = await auth.getSession(c.req.raw)
    const guest = !sessionCtx && (await isConstructionGuest(c))

    const user =
      sessionCtx ??
      (guest
        ? {
            userId: "construction-guest",
            email: "guest",
            name: "Guest",
            roles: ["guest"],
            permissions: [],
            userType: "user" as const,
            metadata: {}
          }
        : null)

    const session = sessionCtx
      ? { id: sessionCtx.userId, userId: sessionCtx.userId }
      : guest
        ? { id: "construction-guest", userId: "construction-guest" }
        : null

    c.set("user", user)
    c.set("session", session)
  }

  const session = c.get("session")
  const user = c.get("user")

  if (url.pathname === "/auth") {
    return c.redirect("/auth/sign-in")
  }

  if ((url.pathname === "/auth/sign-in" || url.pathname === "/auth/sign-up") && session) {
    return c.redirect("/")
  }

  if (isProtected && !session) {
    return c.redirect("/auth/sign-in")
  }

  if (url.pathname.includes("/admin")) {
    if (!session) {
      return c.redirect("/auth/sign-in")
    }
    const roles: string[] = user?.roles ?? []
    if (!roles.some((r: string) => ["admin", "owner"].includes(r))) {
      return c.redirect("/")
    }
  }

  if (url.pathname.includes("/construction") && session) {
    return c.redirect("/")
  }

  return await next()
}
