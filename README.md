# idantity.me

The personal website of Daniel Marchi (idantity): portfolio, blog, projects, music, services, resume, and contact. Bilingual (English and Portuguese), with content managed through `@rimelight/cms`.

## Features

- **Portfolio**: projects with covers, excerpts, categories, and featured flags, managed in the CMS.
- **Blog**: posts with Open Graph cards per post.
- **Pages**: about, services, music, resume, contact, legal, and branding.
- **Contact form**: protected by Cloudflare Turnstile and rate limiting, and sent by email.
- **Search**: a search API used by the site.
- **SEO**: sitemap, robots, RSS, web manifest, `llms.txt`, and Open Graph images.
- **Localization**: English and Portuguese, with locale-prefixed URLs.

## Stack

- Solid 2.0 with SSR (`solid-js`, `@solidjs/router`, `@solidjs/web`)
- Vite+ (`vp`) and Vite, with `@cloudflare/vite-plugin`
- Hono on Cloudflare Workers
- Cloudflare D1 (SQLite) with Drizzle ORM, R2 for media, Images, Email, and Rate Limiting
- Rimelight packages: `@rimelight/auth`, `@rimelight/cms`, `@rimelight/i18n`, `@rimelight/security`, `@rimelight/seo`, `@rimelight/ui`

## Project Structure

```text
├── .cloudflare/            # Generated Worker types
├── drizzle/                # SQL migrations (D1)
├── src/
│   ├── api/                # Hono API routes (contact, search), mounted under /api
│   ├── components/         # UI components: app, blog, music, og, projects, services
│   ├── db/                 # Drizzle schema and client
│   ├── i18n/               # en.json, pt.json
│   ├── routes/[locale]/    # File-based routes, prefixed with the locale
│   ├── App.tsx             # Root component
│   ├── Document.tsx        # HTML shell
│   └── fetch.ts            # Worker entry: middleware chain and SSR handler
├── .dev.vars.example
├── cloudflare.config.ts    # Worker name, bindings, routes
├── drizzle.config.ts
├── vite.config.ts
├── package.json
└── tsconfig.json
```

## Getting Started

### Prerequisites

- Node.js 26.12.1 (see `.node-version`)
- pnpm 12.15.0
- A Cloudflare account

### Setup

```sh
pnpm install
cp .dev.vars.example .dev.vars   # fill in the values
pnpm generate-types
pnpm db:migrate
pnpm dev
```

## Environment Variables

Set these in `.dev.vars` for local development, and as Worker secrets in production. Never commit `.dev.vars`.

| Variable                  | Description                                                       |
| ------------------------- | ----------------------------------------------------------------- |
| `CONSTRUCTION_MODE`       | Set to `true` to hold the site behind the construction passphrase |
| `CONSTRUCTION_PASSPHRASE` | Passphrase that unlocks a site in construction mode               |
| `TURNSTILE_SITE_KEY`      | Cloudflare Turnstile site key (client-side widget)                |
| `TURNSTILE_SECRET_KEY`    | Cloudflare Turnstile secret key (server-side verification)        |

## Cloudflare Bindings

Defined in `cloudflare.config.ts`:

| Binding               | Type        | Purpose                            |
| --------------------- | ----------- | ---------------------------------- |
| `ASSETS`              | Assets      | Static assets                      |
| `IMAGES`              | Images      | Image transformation               |
| `BLOB`                | R2 bucket   | Media storage                      |
| `DB`                  | D1 database | Site data                          |
| `EMAIL`               | Email       | Contact form delivery              |
| `RATE_LIMIT`          | Rate limit  | Request limiting                   |
| `CONTACT_OWNER_EMAIL` | Variable    | Recipient of contact form messages |

## Scripts

| Command                  | Action                                                                                    |
| ------------------------ | ----------------------------------------------------------------------------------------- |
| `pnpm dev`               | Start the local dev server (`vp dev`)                                                     |
| `pnpm build`             | Build for production (`vp build`)                                                         |
| `pnpm preview`           | Preview the production build                                                              |
| `pnpm deploy`            | Deploy the Worker with `cf deploy`                                                        |
| `pnpm generate-types`    | Generate Worker binding types                                                             |
| `pnpm check`             | Audit dependencies, regenerate types, and run `vp check --fix` (lint, format, type check) |
| `pnpm db:generate`       | Generate Drizzle migrations from `src/db/schema`                                          |
| `pnpm db:migrate`        | Apply migrations to the local D1 database                                                 |
| `pnpm db:migrate:remote` | Apply migrations to the remote D1 database                                                |

## Database

The schema is in `src/db/schema`, and migrations are in `drizzle/`. To change the schema, edit it, run `pnpm db:generate`, commit the migration, then run `pnpm db:migrate` locally. Run `pnpm db:migrate:remote` before deploying schema changes.

## Deployment

```sh
pnpm build
pnpm db:migrate:remote   # if the schema changed
pnpm deploy
```

The Worker is served on `idantity.me` and `www.idantity.me`, as set in `cloudflare.config.ts`.

## Construction Mode

With `CONSTRUCTION_MODE=true`, visitors need `CONSTRUCTION_PASSPHRASE` to see the site. Passing `?preview=<passphrase>` sets an access cookie. See [`@rimelight/security`](https://github.com/Rimelight-Entertainment/rimelight/tree/main/packages/security#construction-mode) for details.

## License

MIT. Copyright (c) 2026 idantity.me. See [LICENSE](LICENSE).
