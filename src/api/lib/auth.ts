import { createMiddleware } from "hono/factory";
import { cfAccessIdentifier } from "@rimelight/auth/cf-access";
import { env } from "cloudflare:workers";
import { decideAccess } from "./auth.logic";

/**
 * Worker-side check for /api/personal/*. The edge Access application already gates the path;
 * this verifies the Access JWT again (defence in depth). `cfAccessIdentifier` reads the
 * `Cf-Access-Jwt-Assertion` header, falls back to the `CF_Authorization` cookie, and checks the
 * RS256 signature against `${TEAM_DOMAIN}/cdn-cgi/access/certs` (cached), the issuer, the
 * audience (POLICY_AUD) and expiry.
 */
export const requireAccess = createMiddleware(async (c, next) => {
  const e = env as any;
  const teamDomain: string | undefined = e?.TEAM_DOMAIN;
  const policyAud: string | undefined = e?.POLICY_AUD;
  const decision = await decideAccess({
    config: { teamDomain, policyAud },
    identify: async () => {
      if (!teamDomain || !policyAud) return null;
      const identify = cfAccessIdentifier({ teamDomain, audience: policyAud });
      return identify(c.req.raw);
    },
  });
  if (!decision.ok) {
    return c.json({ error: decision.error, message: decision.message }, decision.status);
  }
  return next();
});
