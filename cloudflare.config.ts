import { bindings, defineConfig, exports } from "cf/config";

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
    exports: {
      MailboxDO: exports.durableObject({ storage: "sqlite" }),
    },
    domains: ["idantity.me", "www.idantity.me"],
    env: {
      ASSETS: bindings.assets(),
      IMAGES: bindings.images(),
      BLOB: bindings.r2({
        name: "idantity-dot-me",
        dev: { remote: true },
      }),
      // Personal storage and inbox objects (files, mailbox JSON, attachments). Same bucket as
      // personal.idantity.me, so object keys and cdn.idantity.me URLs stay valid.
      PERSONAL_BLOB: bindings.r2({
        name: "personal-dot-idantity-dot-me",
        dev: { remote: true },
      }),
      DB: bindings.d1({
        id: "51076606-e3ee-4e09-bf45-04db8b0737f9",
        dev: { remote: true },
      }),
      EMAIL: bindings.sendEmail(),
      MAILBOX: bindings.durableObject({
        worker: "idantity-dot-me",
        exportName: "MailboxDO",
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
      // userId stored on the personal rows. Required by the /api/finances, /api/notes, etc. routes.
      PERSONAL_OWNER_ID: bindings.secret(),
      // Worker-side Cloudflare Access check for /api/personal/* (src/api/lib/auth.ts).
      // TEAM_DOMAIN is the team domain. POLICY_AUD is the AUD of the Access application for
      // idantity.me/api/personal/*. Access app id 2bcdcedd-7674-4462-88dd-5b9a4c08d842.
      TEAM_DOMAIN: bindings.text("https://idantitydotme.cloudflareaccess.com"),
      POLICY_AUD: bindings.text("f55835872c87ed965c6f06fa02bed51bb36fa5b714ea7f3c20205d89624d6391"),
      CONTACT_OWNER_EMAIL: bindings.text("owner@idantity.me"),
      DOMAINS: bindings.text("idantity.me"),
      EMAIL_ADDRESSES: bindings.json([
        "daniel@idantity.me",
        "hello@idantity.me",
        "admin@idantity.me",
      ]),
      CF_ACCESS_TEAM_DOMAIN: bindings.text("idantitydotme.cloudflareaccess.com"),
      CF_ACCESS_AUD: bindings.text(
        "15fa0c11f4af04c11c877e5b2f81dac9721f7860db4174c6f1d6f2e402991742",
      ),
    },
  },
});
