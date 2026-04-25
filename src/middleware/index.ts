import { sequence, defineMiddleware } from "astro:middleware"
import { security } from "@rimelight/ui/middleware"
import { i18n } from "astro:config/client"
import { pathHasLocale } from "astro:i18n"

const defaultLocale = i18n?.defaultLocale ?? "en"

const i18nMiddleware = defineMiddleware(async (context, next) => {
  const { url } = context
  const pathname = url.pathname

  if (pathname === "/" || pathname === "") {
    return context.redirect(`/${defaultLocale}/`, 302)
  }

  const hasLocale = pathHasLocale(pathname)
  const isDocsRoute = pathname.startsWith("/docs")
  const isApiRoute = pathname.startsWith("/api")

  if (hasLocale || isDocsRoute || isApiRoute) {
    return next()
  }

  return next()
})

export const onRequest = sequence(i18nMiddleware, security)
