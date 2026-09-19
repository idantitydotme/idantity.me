import { Hono } from "hono"
import authRoutes from "./routes/auth"
import searchRoutes from "./routes/search"
import emailPreviewRoutes from "./routes/email/preview"
import cmsRoutes from "./routes/cms"

const api = new Hono()
  .route("/auth", authRoutes)
  .route("/search", searchRoutes)
  .route("/dev/email/preview", emailPreviewRoutes)
  .route("/cms", cmsRoutes)

export type ApiType = typeof api
export default api
