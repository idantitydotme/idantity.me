import { Hono } from "hono"
import authRoutes from "./routes/auth"
import searchRoutes from "./routes/search"
import changelogRoutes from "./routes/changelog"
import assetsRoutes from "./routes/assets"
import pagesRoutes from "./routes/pages"
import versionRoutes from "./routes/versions"
import emailPreviewRoutes from "./routes/email/preview"
import constructionGuestRoutes from "./routes/construction-guest"
import notesApp from "./routes/notes"
import todosApp from "./routes/todos"
import habitsApp from "./routes/habits"
import healthApp from "./routes/health"
import housingApp from "./routes/housing"
import groceriesApp from "./routes/groceries"
import petsApp from "./routes/pets"
import wishlistApp from "./routes/wishlist"
import musicApp from "./routes/music"
import projectsApp from "./routes/projects"
import watchlistApp from "./routes/watchlist"
import adminApp from "./routes/admin"
import pagesApp from "./routes/pages"
import assetsApp from "./routes/assets"
import customersApp from "./routes/customers"
import mailsApp from "./routes/mails"
import notificationsApp from "./routes/notifications"
import proxyImageApp from "./routes/proxy-image"

const api = new Hono()

api.route("/auth", authRoutes)
api.route("/construction-guest", constructionGuestRoutes)
api.route("/search", searchRoutes)
api.route("/github", changelogRoutes)
api.route("/assets", assetsRoutes)
api.route("/pages", pagesRoutes)
api.route("/pages/versions", versionRoutes)
api.route("/email/preview", emailPreviewRoutes)
api.route("/notes", notesApp)
api.route("/todos", todosApp)
api.route("/habits", habitsApp)
api.route("/health", healthApp)
api.route("/housing", housingApp)
api.route("/groceries", groceriesApp)
api.route("/pets", petsApp)
api.route("/wishlist", wishlistApp)
api.route("/music", musicApp)
api.route("/projects", projectsApp)
api.route("/watchlist", watchlistApp)
api.route("/admin", adminApp)
api.route("/pages", pagesApp)
api.route("/assets", assetsApp)
api.route("/customers", customersApp)
api.route("/mails", mailsApp)
api.route("/notifications", notificationsApp)
api.route("/proxy-image", proxyImageApp)

export default api

