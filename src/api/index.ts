import { Hono } from "hono"
import authRoutes from "./routes/auth"
import searchRoutes from "./routes/search"
import emailPreviewRoutes from "./routes/email/preview"
import constructionGuestRoutes from "./routes/construction-guest"
import cmsRoutes from "./routes/cms"

const api = new Hono()

api.route("/auth", authRoutes)
api.route("/construction-guest", constructionGuestRoutes)
api.route("/search", searchRoutes)
api.route("/dev/email/preview", emailPreviewRoutes)
api.route("/cms", cmsRoutes)

export default api
