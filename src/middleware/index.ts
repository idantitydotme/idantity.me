import { sequence, defineMiddleware } from "astro:middleware"
import { security } from "@rimelight/ui/middleware"
import { redirectToDefaultLocale, pathHasLocale } from "astro:i18n"

const i18nMiddleware = defineMiddleware(async (context, next) => {
  const { url } = context
  const pathname = url.pathname

  if (pathname === "/" || pathname === "") {
    return context.redirect("/en/", 302)
  }

  const hasLocale = pathHasLocale(pathname)
  const isDocsRoute = pathname.startsWith("/docs")
  const isApiRoute = pathname.startsWith("/api")

  if (hasLocale || isDocsRoute || isApiRoute) {
    return next()
  }

  return redirectToDefaultLocale(302)
})

export const onRequest = sequence(i18nMiddleware, security)
