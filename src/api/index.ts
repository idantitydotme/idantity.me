import { Hono } from "hono"
import authRoutes from "./routes/auth"
import constructionGuestRoutes from "./routes/construction-guest"
import cmsRoutes from "./routes/cms"
import searchRoutes from "./routes/search"
import rolesRoutes from "./routes/roles"
import adminRoutes from "./routes/admin"

const api = new Hono()

api.route("/auth", authRoutes)
api.route("/construction-guest", constructionGuestRoutes)
api.route("/cms", cmsRoutes)
api.route("/search", searchRoutes)
api.route("/roles", rolesRoutes)
api.route("/admin", adminRoutes)

export default api
