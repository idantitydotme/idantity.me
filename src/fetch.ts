import { Hono } from "hono";
import { handleRequest } from "virtual:solid-ssr-handler";
import { security, devOnly, ratelimit, construction } from "@rimelight/security/middleware";
import { auth } from "@rimelight/auth/middleware";
import { i18n } from "@rimelight/i18n/middleware";
import { getRelativeLocaleUrl } from "@rimelight/i18n";
import api from "#api";

const app = new Hono<{ Bindings: Env }>();

// 1. Serve static assets via Cloudflare ASSETS binding before middleware
app.use("*", async (c, next) => {
  if (c.env?.ASSETS) {
    const res = await c.env.ASSETS.fetch(c.req.raw);
    if (res.status < 400) return res;
  }
  return next();
});

app.use(security());
app.use(devOnly);
app.use(ratelimit());
app.use(construction());
app.use(
  auth({
    roleGuards: {
      "/admin": ["admin", "owner"],
    },
  }),
);

app.route("/api", api);
app.use(i18n());

app.onError((err, c) => {
  console.error("[Hono Server Error]", err);
  const isHtml = (c.req.header("accept") || "").includes("text/html");
  if (isHtml) {
    return c.redirect(getRelativeLocaleUrl("/500"), 302);
  }
  return c.json({ error: "Internal Server Error", message: err.message }, 500);
});

// Fall through unmatched document requests to Solid's SSR page renderer.
// Subresources (static files, chunks, scripts) not found in ASSETS return a clean 404
// rather than an HTML document to adhere to strict MIME type checking.
app.all("*", async (c) => {
  const url = new URL(c.req.url);
  if (/\.[a-zA-Z0-9]{2,8}$/.test(url.pathname)) {
    return new Response("Not Found", {
      status: 404,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  }
  const response = await handleRequest(c.req.raw);
  c.res = response;
  return response;
});

export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    return Promise.resolve(app.fetch(request, env, ctx));
  },
};
