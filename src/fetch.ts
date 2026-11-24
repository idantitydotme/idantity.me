import { Hono } from "hono";
import { security } from "@rimelight/security/middleware";
import { i18n } from "@rimelight/i18n/middleware";
import { seo } from "@rimelight/seo/middleware";
import { cms } from "@rimelight/cms/middleware";
import { cfAccessIdentifier } from "@rimelight/cms/identity";
import api from "#api/server";
import { handleRequest } from "virtual:solid-ssr-handler";
import { receiveEmail } from "#workers/inbox";
import type { Env as InboxEnv } from "./workers/inbox/types";
import { runTrashCleanup } from "#tasks/cleanup";

export { MailboxDO } from "./workers/inbox/durableObject/index";

/** The inbox worker reads its mailbox bucket as `BUCKET`; here that is the personal R2 bucket. */
const inboxEnv = (env: Env): InboxEnv =>
  ({ ...env, BUCKET: (env as any).PERSONAL_BLOB }) as unknown as InboxEnv;

// Never scheduled: no cron trigger exists for this worker. The handler is kept for later use.
export const scheduled = async (
  _controller: ScheduledController,
  env: Env,
  ctx: ExecutionContext,
) => {
  if (env.DB) {
    ctx.waitUntil(runTrashCleanup(env.DB));
  }
};

export const email = async (event: { raw: ReadableStream; rawSize: number }, env: Env) => {
  try {
    await receiveEmail(event, inboxEnv(env));
  } catch (e) {
    console.error("Failed to process incoming email:", (e as Error).message, (e as Error).stack);
    throw e;
  }
};

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
