/// <reference path="../.astro/types.d.ts" />

declare namespace App {
    interface Locals {
        user: import("better-auth").User | null;
        session: import("better-auth").Session | null;
    }
}

declare module "cloudflare:workers" {
    interface Env {
        BLOB: any;
    }
}

declare module "cloudflare:workers" {
    interface Env {
        BLOB: any;
    }
}
declare module "turndown";
declare module "turndown-plugin-gfm";
