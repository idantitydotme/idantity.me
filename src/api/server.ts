import { Hono } from "hono";
import contactRoutes from "./routes/contact";
import financesRoutes from "./routes/finances";
import groceriesRoutes from "./routes/groceries";
import habitsRoutes from "./routes/habits";
import healthRoutes from "./routes/health";
import housingRoutes from "./routes/housing";
import musicRoutes from "./routes/music";
import notesRoutes from "./routes/notes";
import notebooksRoutes from "./routes/notebooks";
import projectsRoutes from "./routes/projects";
import storageRoutes from "./routes/storage";
import todosRoutes from "./routes/todos";
import watchlistRoutes from "./routes/watchlist";
import { app as inboxApp } from "#workers/inbox";
import { requireAccess } from "#api/lib/auth";
import { env } from "cloudflare:workers";

// The personal API lives under /api/personal, so one Cloudflare Access application can cover
// exactly that path. The public site and /api/contact stay outside it.
// Routes keep their paths (for example /api/personal/todos). The native client changes its base only.
const personal = new Hono()
  .use("*", requireAccess)
  .route("/finances", financesRoutes)
  .route("/groceries", groceriesRoutes)
  .route("/habits", habitsRoutes)
  .route("/health", healthRoutes)
  .route("/housing", housingRoutes)
  .route("/music", musicRoutes)
  .route("/notes", notesRoutes)
  .route("/notebooks", notebooksRoutes)
  .route("/projects", projectsRoutes)
  .route("/storage", storageRoutes)
  .route("/todos", todosRoutes)
  .route("/watchlist", watchlistRoutes)
  .all("/v1/*", async (c) => {
    // The inbox app's routes are written as /api/v1/*. Rewrite the path it sees.
    const url = new URL(c.req.url);
    url.pathname = url.pathname.replace(/^\/api\/personal\/v1(?=\/|$)/, "/api/v1");
    const workerEnv: any = {
      ...env,
      BUCKET: (env as any)?.PERSONAL_BLOB,
    };
    return inboxApp.fetch(new Request(url, c.req.raw), workerEnv, {
      waitUntil: (promise: Promise<any>) => promise.catch(() => {}),
      passThroughOnException: () => {},
    } as any);
  });

const api = new Hono().route("/contact", contactRoutes).route("/personal", personal);

export type ApiType = typeof api;
export default api;
