import { Hono } from "hono";
import searchRoutes from "./routes/search";
import contactRoutes from "./routes/contact";

const api = new Hono().route("/search", searchRoutes).route("/contact", contactRoutes);

export type ApiType = typeof api;
export default api;
