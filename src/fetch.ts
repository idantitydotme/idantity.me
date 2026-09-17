import { Hono } from "hono"
import { cf } from "@astrojs/cloudflare/hono"
import { security, devOnly, construction, ratelimit } from "@rimelight/security/middleware"
import { authMiddleware } from "@rimelight/auth/middleware"
import { auth } from "@rimelight/auth"
import api from "#api"
import { i18n } from "@rimelight/i18n/hono"
import { astro } from "astro/hono"

const app = new Hono<{ Bindings: Env }>()

// Middlewares
app.use(cf())
app.use(security())
app.use(ratelimit())
app.use(
  authMiddleware({
    auth,
    roleGuards: {
      "/admin": ["admin", "owner"]
    }
  })
)
app.use(construction())
app.use(devOnly)

// Hono API Routing
app.route("/api", api)

// Localization & Astro Pipeline
app.use(i18n())
app.use(astro())

export default {
  fetch: app.fetch
}
