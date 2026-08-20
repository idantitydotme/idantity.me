import { auth as betterAuth } from "@/auth/auth"
import { isConstructionGuest } from "@/auth/construction-guest"

const PROTECTED_ROUTES = ["/internal"]

export const auth = async (c: any, next: any) => {
  const url = new URL(c.req.url)
  const isProtected = PROTECTED_ROUTES.some((path) => url.pathname.startsWith(path))

  const isAuthed = await betterAuth.api.getSession({ headers: c.req.raw.headers })
  const guest = !isAuthed?.session && (await isConstructionGuest(c))
  const user =
    isAuthed?.user ??
    (guest
      ? {
          id: "construction-guest",
          email: "guest",
          name: "Guest",
          emailVerified: true,
          createdAt: new Date(0),
          updatedAt: new Date(0)
        }
      : null)
  const session =
    isAuthed?.session ??
    (guest
      ? {
          id: "construction-guest",
          userId: "construction-guest",
          token: "construction-guest",
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
          createdAt: new Date(0),
          updatedAt: new Date(0)
        }
      : null)

  c.set("user", user)
  c.set("session", session)

  if (url.pathname === "/auth") {
    return c.redirect("/auth/sign-in")
  }

  if ((url.pathname === "/auth/sign-in" || url.pathname === "/auth/sign-up") && session) {
    return c.redirect("/")
  }

  if (isProtected && !session) {
    return c.redirect("/auth/sign-in")
  }

  if (url.pathname.includes("/construction") && session) {
    return c.redirect("/")
  }

  return await next()
}
