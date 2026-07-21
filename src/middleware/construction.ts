import { getFetchState } from "astro/hono"

const CONSTRUCTION_SKIP_SEGMENTS = ["/construction", "/auth", "/api/auth"]
const LOCALES = ["en", "pt"]

const getLocaleFromPath = (path: string) => {
  return LOCALES.find((loc) => path === `/${loc}` || path.startsWith(`/${loc}/`)) ?? "en"
}

export const construction = async (c: any, next: any) => {
  const constructionMode =
    (import.meta.env.CONSTRUCTION_MODE ?? process.env.CONSTRUCTION_MODE) === "true"

  const state = getFetchState(c)
  const localePrefix = getLocaleFromPath(c.req.path)

  const isConstructionPage =
    c.req.path === `/${localePrefix}/construction` || c.req.path === "/construction"

  if (isConstructionPage) {
    if (!constructionMode || state.locals.session) {
      return c.redirect(`/${localePrefix}`)
    }
    return next()
  }

  if (!constructionMode) {
    return next()
  }

  const isSkippedPath = CONSTRUCTION_SKIP_SEGMENTS.some((path) => c.req.path.includes(path))
  if (isSkippedPath) {
    return next()
  }

  if (state.locals.session) {
    return next()
  }

  const redirectTo = encodeURIComponent(c.req.path + new URL(c.req.url).search)
  return c.redirect(`/${localePrefix}/construction?redirect=${redirectTo}`)
}
