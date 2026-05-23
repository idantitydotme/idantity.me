import { defineMiddleware } from "astro:middleware"

const CONSTRUCTION_SKIP_SEGMENTS = ["/construction", "/auth", "/api/auth"]
const LOCALES = ["en", "pt", "es"]

export const construction = defineMiddleware(async (context, next) => {
  const constructionMode =
    (import.meta.env.CONSTRUCTION_MODE ?? process.env.CONSTRUCTION_MODE) === "true"
  if (!constructionMode) {
    return next()
  }

  const isSkippedPath = CONSTRUCTION_SKIP_SEGMENTS.some((path) =>
    context.url.pathname.includes(path)
  )
  if (isSkippedPath) {
    return next()
  }

  const { auth } = await import("@/auth/auth")
  const session = await auth.api.getSession({ headers: context.request.headers })
  if (session) {
    return next()
  }

  const localePrefix = LOCALES.find((loc) => context.url.pathname.startsWith(`/${loc}/`)) ?? "en"
  const redirectTo = encodeURIComponent(context.url.pathname + context.url.search)
  return context.redirect(`/${localePrefix}/construction?redirect=${redirectTo}`)
})
