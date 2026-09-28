import { bindings, defineConfig, type InferEnv } from "cf/config"

/**
 * Secret-like files were detected but not read or migrated: .dev.vars, .dev.vars.example,
 * dist\server.dev.vars. Only `secrets.required` entries are migrated.
 *
 * @see https://developers.cloudflare.com/workers/configuration/secrets/
 */

const config = defineConfig({
  worker: {
    name: "idantity-dot-me",
    compatibilityDate: "2026-08-27",
    entrypoint: "./src/fetch.ts",
    cache: {
      enabled: true
    },
    observability: {
      enabled: true,
      logs: {
        enabled: true,
        headSamplingRate: 1,
        invocationLogs: true
      },
      traces: {
        enabled: true
      }
    },
    domains: ["idantity.me", "www.idantity.me"],
    env: {
      "CONSTRUCTION_MODE": bindings.text("true"),
      "EMAIL_DOMAIN": bindings.text("idantity.me"),
      "CONTACT_OWNER_EMAIL": bindings.text("owner@idantity.me"),
      "DB": bindings.d1({
        name: "idantity-dot-me",
        id: "51076606-e3ee-4e09-bf45-04db8b0737f9",
        dev: {
          remote: true
        }
      }),
      "idantity-dot-me_translations": bindings.kv({
        id: "4600654d2fa04084b7914fa36609e6f5",
        dev: {
          remote: true
        }
      }),
      "BLOB": bindings.r2({
        name: "idantity-dot-me",
        dev: {
          remote: true
        }
      }),
      "EMAIL": bindings.sendEmail({
        dev: {
          remote: true
        }
      }),
      "MY_RATE_LIMITER": bindings.rateLimit({
        namespace: "1001",
        simple: {
          limit: 100,
          period: 60
        }
      }),
      "ASSETS": bindings.assets(),
      "TURNSTILE_SITE_KEY": bindings.secret(),
      "TURNSTILE_SECRET_KEY": bindings.secret(),
      "CONSTRUCTION_PASSPHRASE": bindings.secret()
    }
  }
})

export type Env = InferEnv<typeof config>
export default config
