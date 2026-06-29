import { Hono } from "hono"
import { actions, pages } from "astro/hono"
import api from "@/api"
import { ratelimit } from "./middleware/ratelimit"
import { i18n } from "./middleware/i18n"
import { security } from "./middleware/security"
import { auth } from "./middleware/auth"
import { construction } from "./middleware/construction"

const app = new Hono()

// 1. Rate Limiting Middleware
app.use(ratelimit)

// 2. Localization & Routing
app.use(i18n)

// 3. Security Headers and SRI injection
app.use(security)

// 4. Security Boundary: Global Auth Middleware
app.use(auth)

// 5. Global Construction Middleware
app.use(construction)

// 6. Register Hono API Sub-routing
app.route("/api", api)

// 7. Astro Lifecycle Execution (Actions and Page rendering)
app.use(actions())
app.use(pages())

export default app
