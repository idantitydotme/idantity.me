import { bindings, defineConfig, triggers } from "cf/config";

export default defineConfig({
  worker: {
    name: "idantity-dot-me",
    compatibilityDate: "2026-10-01",
    entrypoint: "./src/fetch.ts",
    observability: {
      enabled: true,
      traces: {
        enabled: true,
      },
      issues: {
        enabled: true,
      },
    },
    cache: {
      enabled: true,
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
      }),
      DB: bindings.d1({
        id: "51076606-e3ee-4e09-bf45-04db8b0737f9",
      }),
      EMAIL: bindings.sendEmail(),
      RATE_LIMIT: bindings.rateLimit({
        namespace: "1001",
        simple: {
          limit: 100,
          period: 60,
        },
      }),
      CONSTRUCTION_MODE: bindings.secret(),
      CONSTRUCTION_PASSPHRASE: bindings.secret(),
      CONTACT_OWNER_EMAIL: bindings.text("owner@idantity.me"),
    },
  },
});
