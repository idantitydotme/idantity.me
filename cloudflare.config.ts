import { bindings, defineConfig, triggers } from "cf/config";

export default defineConfig({
  worker: {
    name: "idantity-dot-me",
    compatibilityDate: "2026-08-27",
    entrypoint: "./src/fetch.ts",
    cache: {
      enabled: true,
    },
    observability: {
      enabled: true,
      traces: {
        enabled: true,
      },
    },
    triggers: [
      triggers.fetch({ pattern: "idantity.me/*", zone: "idantity.me" }),
      triggers.fetch({ pattern: "www.idantity.me/*", zone: "idantity.me" }),
    ],
    env: {
      ASSETS: bindings.assets(),
      IMAGES: bindings.images(),
      BLOB: bindings.r2({
        name: "idantity-dot-me",
        dev: {
          remote: true,
        },
      }),
      DB: bindings.d1({
        id: "51076606-e3ee-4e09-bf45-04db8b0737f9",
        dev: {
          remote: true,
        },
      }),
      EMAIL: bindings.sendEmail({
        dev: {
          remote: true,
        },
      }),
      RATE_LIMIT: bindings.rateLimit({
        namespace: "1001",
        simple: {
          limit: 100,
          period: 60,
        },
      }),
      CONSTRUCTION_MODE: bindings.secret(),
      CONSTRUCTION_PASSPHRASE: bindings.secret(),
      EMAIL_DOMAIN: bindings.text("idantity.me"),
      CONTACT_OWNER_EMAIL: bindings.text("owner@idantity.me"),
    },
  },
});
