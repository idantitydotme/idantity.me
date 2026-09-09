import { Hono } from "hono"
import { security, devOnly } from "@rimelight/security/middleware"
import { ratelimit } from "#api/middleware/ratelimit"
import { authMiddleware } from "#api/middleware/auth"
import { construction } from "#api/middleware/construction"
import api from "#api"
import { i18n } from "@rimelight/i18n/hono"
import { astro } from "astro/hono"

const app = new Hono()

// Middlewares
app.use(security())
app.use(ratelimit)
app.use(authMiddleware)
app.use(construction)
app.use(devOnly)

// Hono API Routing
app.route("/api", api)

// Localization & Astro Pipeline
app.use(i18n())
app.use(astro())

export default app
