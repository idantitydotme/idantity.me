import { Hono } from "hono";
import searchRoutes from "./routes/search";
import contactRoutes from "./routes/contact";
import cmsRoutes from "./routes/cms";

const api = new Hono()
  .route("/search", searchRoutes)
  .route("/contact", contactRoutes)
  .route("/cms", cmsRoutes);

export type ApiType = typeof api;
export default api;
