import { Hono } from "hono";
import { security } from "@rimelight/security/middleware";
import { auth } from "@rimelight/auth/middleware";
import { seo } from "@rimelight/seo/middleware";
import { cms } from "@rimelight/cms/middleware";
import { i18n } from "@rimelight/i18n/middleware";
import api from "#api/server";
import { handleRequest } from "virtual:solid-ssr-handler";

const app = new Hono<{ Bindings: Env }>();

app.use(security());
app.use(auth());
app.use(seo());
app.use(cms());
app.use(i18n());

app.route("/api", api);

app.all("*", (c) => handleRequest(c.req.raw));

export default app;
