import { Hono } from "hono";
import contactRoutes from "./routes/contact";

// The personal API moved to its own Worker (rimelight-personal, in the rimelight-native repo). Only the public
// contact form is served here.
const api = new Hono().route("/contact", contactRoutes);

export type ApiType = typeof api;
export default api;
