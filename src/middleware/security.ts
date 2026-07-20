import { security as astroSecurity } from "@rimelight/security/middleware"
import { getFetchState } from "astro/hono"

export const security = async (c: any, next: any) => {
  const context: any = {
    request: c.req.raw,
    url: new URL(c.req.url),
    redirect: (path: string, status?: number) => {
      return c.redirect(path, status ?? 302)
    },
    locals: getFetchState(c).locals
  }
  const response = await astroSecurity(context, async () => {
    await next()
    return c.res
  })
  if (response instanceof Response && response !== c.res) {
    c.res = response
  }
}
