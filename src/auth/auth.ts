import { cfAccessAuth } from "@rimelight/auth/cf-access"
import type { AuthAdapter } from "@rimelight/auth"

function getEnv(key: string, fallback = ""): string {
  if (typeof process !== "undefined" && process.env?.[key]) return process.env[key]!
  // @ts-ignore
  if (typeof import.meta !== "undefined" && import.meta.env?.[key]) return import.meta.env[key]
  return fallback
}

/**
 * Cloudflare Access auth adapter. Identity is entirely managed by Cloudflare Access. No user
 * registration, password management, or email verification here.
 */
export const auth: AuthAdapter = cfAccessAuth({
  teamDomain: getEnv("CF_ACCESS_TEAM_DOMAIN"),
  aud: getEnv("CF_ACCESS_AUD"),
  verifyJwt: getEnv("CF_ACCESS_VERIFY_JWT") === "true",
  adminEmails: getEnv("CF_ACCESS_ADMIN_EMAILS")
    ? getEnv("CF_ACCESS_ADMIN_EMAILS")
        .split(",")
        .map((e) => e.trim())
    : [],
  defaultRole: "admin"
})

export const authAdapter = auth
export default auth
