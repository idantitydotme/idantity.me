/// <reference types="vite/client" />
/// <reference types="vite-plus/client" />
/// <reference types="@solidjs/vite-plugin/virtual-solid-manifest" />
/// <reference types="filesystem-routing/types" />
/// <reference types="../file-routes.d.ts" />

type D1Database = import("@cloudflare/workers-types").D1Database
type R2Bucket = import("@cloudflare/workers-types").R2Bucket

type CloudflareEnv = {
  DB: D1Database
  BLOB: R2Bucket
  SITE_NAME?: string
  POLICY_AUD?: string
  TEAM_DOMAIN?: string
  CONSTRUCTION_MODE?: string
  EMAIL_DOMAIN?: string
  CONTACT_OWNER_EMAIL?: string
}

declare module "cloudflare:workers" {
  export const env: CloudflareEnv
}
