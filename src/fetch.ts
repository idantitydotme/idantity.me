import { Hono } from "hono"
import { security } from "#api/middleware/security"
// import { ratelimit } from "#api/middleware/ratelimit"
import { auth } from "#api/middleware/auth"
import { construction } from "#api/middleware/construction"
import api from "#api"
import { i18n } from "@rimelight/i18n/hono"
import { actions, pages } from "astro/hono"

const app = new Hono()

// 1. Security Middleware
app.use(security)

// 2. Rate Limiting Middleware (pending implementation)
// app.use(ratelimit)

// 3. Auth Middleware
app.use(auth)

// 4. Construction Mode Middleware
app.use(construction)

// 5. Hono API Routing
app.route("/api", api)

// 6. Localization & Routing Middleware
app.use(i18n())

// 7. Astro Actions & Pages
app.use(actions())
app.use(pages())

export default app
