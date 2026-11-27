import { Hono } from "hono";
import { security } from "@rimelight/security/middleware";
import { i18n } from "@rimelight/i18n/middleware";
import { seo } from "@rimelight/seo/middleware";
import { cms } from "@rimelight/cms/middleware";
import { cfAccessIdentifier } from "@rimelight/cms/identity";
import api from "#api/server";
import { handleRequest } from "virtual:solid-ssr-handler";

/** CMS sign-in is Cloudflare Access. Settings are read on the first request, like the other bindings. */
const identify = cfAccessIdentifier(() => {
  const read = (key: string): string =>
    ((globalThis as any).process?.env?.[key] || (import.meta as any).env?.[key] || "") as string;
  return { teamDomain: read("CF_ACCESS_TEAM_DOMAIN"), audience: read("CF_ACCESS_AUD") };
});

const app = new Hono<{ Bindings: Env }>();

app.use(security());
app.use(i18n());
app.use(seo());
app.use(cms({ identify }));

app.route("/api", api);

app.all("*", (c) => handleRequest(c.req.raw));

export default app;
