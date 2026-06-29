import { getFetchState } from "astro/hono"

const CONSTRUCTION_SKIP_SEGMENTS = ["/construction", "/auth", "/api/auth"]
const LOCALES = ["en", "pt"]

export const construction = async (c: any, next: any) => {
  const constructionMode =
    (import.meta.env.CONSTRUCTION_MODE ?? process.env.CONSTRUCTION_MODE) === "true"
  if (!constructionMode) {
    return next()
  }

  const isSkippedPath = CONSTRUCTION_SKIP_SEGMENTS.some((path) => c.req.path.includes(path))
  if (isSkippedPath) {
    return next()
  }

  const state = getFetchState(c)
  if (state.locals.session) {
    return next()
  }

  const localePrefix = LOCALES.find((loc) => c.req.path.startsWith(`/${loc}/`)) ?? "en"
  const redirectTo = encodeURIComponent(c.req.path + new URL(c.req.url).search)
  return c.redirect(`/${localePrefix}/construction?redirect=${redirectTo}`)
}
