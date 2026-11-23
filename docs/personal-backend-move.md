# Personal backend move: personal.idantity.me to idantity.me

Status: CODE ported, nothing built, deployed, migrated or executed. The build pass (one `vp` build, `vp test`,
`pnpm db:generate` drift check) is still to run by the main session. No data has moved.

## 1. Where each piece now lives

| personal.idantity.me (source)          | idantity.me (new home)              | Notes                                                                                                                                                      |
| -------------------------------------- | ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cloudflare.config.ts`                 | `cloudflare.config.ts`              | Adds `MailboxDO`, `MAILBOX`, `PERSONAL_BLOB`, `PERSONAL_OWNER_ID`, `TEAM_DOMAIN`, `POLICY_AUD`, `DOMAINS`, `EMAIL_ADDRESSES`. `domains` stays idantity.me. |
| `src/fetch.ts`                         | `src/fetch.ts`                      | Adds `email` handler and the `MailboxDO` re-export. `scheduled` is ported but never scheduled.                                                             |
| `src/api/server.ts`                    | `src/api/server.ts`                 | Personal API under `/api/personal/*` (Access-gated). `/api/contact` stays public.                                                                          |
| `src/api/lib/auth.ts`, `auth.logic.ts` | NEW                                 | Worker-side Cloudflare Access JWT check on `/api/personal/*` (defence in depth; see 6).                                                                    |
| `src/api/lib/owner.ts`                 | NEW                                 | Reads `PERSONAL_OWNER_ID`. Replaces the hard-coded owner fallback.                                                                                         |
| `src/api/lib/owned.logic.ts`           | NEW                                 | Owner-scoped id and id-list parsing for write routes.                                                                                                      |
| `src/api/routes/*.ts` (13 route files) | same file names                     | Paths unchanged inside the router; mounted under `/api/personal`. Bug fixes in section 4.                                                                  |
| `src/db/schema/*.ts` (11 files)        | `src/db/schema/*.ts`                | Copied. Table names do not collide with idantity's `search_index`.                                                                                         |
| `src/lib/currency.ts`                  | `src/lib/currency.ts`               | FX rates for `/api/personal/finances/rates`.                                                                                                               |
| `src/tasks/cleanup.ts`                 | `src/tasks/cleanup.ts`              | Trash cleanup. Ported, never scheduled.                                                                                                                    |
| `src/workers/inbox/**` (all 20 files)  | `src/workers/inbox/**`              | Mail API now at `/api/personal/v1/*`. Its internal paths stay `/api/v1/*`; `server.ts` rewrites the URL. `BUCKET` maps to `PERSONAL_BLOB`.                 |
| `drizzle/*` (13 migrations)            | `drizzle/0001_personal_backend.sql` | Replays the personal history in dependency order.                                                                                                          |
| `package.json`                         | `package.json`                      | Adds `postal-mime@4.2.0`.                                                                                                                                  |
| `.dev.vars.example`                    | same                                | Adds the name `PERSONAL_OWNER_ID`. No values.                                                                                                              |

Not moved (frontend, stays in personal.idantity.me until retirement): `src/components/**`, `src/routes/**`,
`src/App.tsx`, `src/Document.tsx`, `src/i18n/`, `src/config/llms.corpus.ts`. The `src/lib/storage.ts` helper was
unused by the API and is not copied.

## 2. Environment variables and secrets (NAMES only)

Set on the idantity.me worker (`idantity-dot-me`) before the build pass deploys.

- Secret `PERSONAL_OWNER_ID`: the `user_id` stored on the imported rows. Run `SELECT DISTINCT user_id FROM todo;`
  against the personal D1 (read only). Without it the data routes throw.
- Text binding `TEAM_DOMAIN`: `https://idantitydotme.cloudflareaccess.com` (the same team as personal.idantity.me).
- Text binding `POLICY_AUD`: the AUD of the NEW Access application for `idantity.me/api/personal/*`. The config
  holds the placeholder `REPLACE_WITH_ACCESS_APP_AUD_FOR_IDANTITY_ME_API_PERSONAL`. Replace it after step 6.1.
  While it is a placeholder every personal request fails with 401.
- Secrets `CONSTRUCTION_MODE`, `CONSTRUCTION_PASSPHRASE`: already on idantity.me.
- Existing text bindings (kept): `CF_ACCESS_TEAM_DOMAIN`, `CF_ACCESS_AUD`, `CONTACT_OWNER_EMAIL`, `DOMAINS`,
  `EMAIL_ADDRESSES`.
- Bindings (no values): `DB` (idantity D1), `BLOB`, `PERSONAL_BLOB` (R2 `personal-dot-idantity-dot-me`), `EMAIL`,
  `MAILBOX` (DO `MailboxDO`), `IMAGES`, `ASSETS`, `RATE_LIMIT`.
- Not needed on idantity.me: `CLOUDFLARE_API_TOKEN`, `TEAM_DOMAIN` from personal (now declared here as text).
- No cron trigger: the personal app never had a schedule, so the `scheduled` handler is unscheduled.

## 3. Migration

`drizzle/0001_personal_backend.sql` creates the 27 personal tables. Its statements are the personal migrations,
replayed in dependency order. `wishlist_quantity` must run before `make_estimated_cost_nullable`.

Hand-written, not generated. idantity.me has no drizzle snapshot, so `pnpm db:generate` at the build pass may want
to regenerate the whole schema. Compare its output with this file before any remote apply.

## 4. Bug fixes (docs/inventory.md section 0 item 7; PENDING ao, ap, az)

1. Storage: `PATCH /storage/files` (rename and move) copies the R2 object to the new key, deletes the old one, and
   updates the row (409 if the target exists, 404 if unknown). `DELETE /storage/files` is owner-scoped and also
   deletes the R2 objects. Upload accepts `files` as well as `file`.
2. Projects: `POST /projects/cards` inserts by `type` (board, list, card). `PATCH` accepts `cardId` or `id`.
   `GET /projects/cards` returns only the owner's boards and their lists and cards.
3. Todos: `POST /todos` with `{action: "batchComplete" | "batchDelete", ids}` works. Todo PATCH and DELETE are
   owner-scoped and return 404 when nothing matches.
4. Notes: PATCH and DELETE are owner-scoped and return 404 when nothing matches.
5. Health: `PATCH /health/fasting` with `{action: "end", id}` ends the fast. `POST /health/fasting` honours
   `durationHours`. Measurements and workouts accept the raw document or `{data}`.
6. Groceries: `resetAllToNeedBuy` and `clearBought` are handled.
7. Wishlist: `GET /housing/wishlist` returns the list under both `wishlist` and `items`.

Tests sit beside each `*.logic.ts` (planning functions, owner-scope helpers, the Access decision). Route handlers
and the SQL owner filters are not unit-tested. Nothing has been run.

## 5. Route table

| Path on idantity.me                                                                                                                                         | Edge protection                                     | Worker check                 |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | ---------------------------- |
| `/api/personal/finances`, `/groceries`, `/habits`, `/health`, `/housing`, `/music`, `/notes`, `/notebooks`, `/projects`, `/storage`, `/todos`, `/watchlist` | Cloudflare Access application (to create, step 6.1) | `requireAccess` (Access JWT) |
| `/api/personal/v1/*` (mail API; inside the worker it runs as `/api/v1/*`)                                                                                   | same Access application                             | `requireAccess`              |
| `/api/contact`                                                                                                                                              | none (public contact form)                          | none                         |
| Everything else on idantity.me (site, pages)                                                                                                                | none                                                | none                         |

Note the Access application must cover the full path `idantity.me/api/personal/*`, not the whole host.

## 6. Runbook (owner executes; nothing has been run)

Do this in a quiet window. Stop editing on personal.idantity.me first.

1. Create the Access application. In Zero Trust, add a self-hosted application for `idantity.me/api/personal/*`
   (path-scoped, not the whole host). Give it the same policy as personal.idantity.me. Copy its Application
   Audience (AUD) tag and set it as the `POLICY_AUD` text binding in `cloudflare.config.ts`, replacing the
   placeholder, before deploy.
2. Freeze: no edits on personal.idantity.me. Read the personal D1 user id (read only) and set `PERSONAL_OWNER_ID`.
3. Export personal D1 data only: `wrangler d1 export personal-dot-idantity-dot-me --remote --no-schema --output personal-data.sql`.
   Keep this file out of git.
4. Apply the schema to idantity D1: `pnpm db:migrate:remote` (applies `drizzle/0001_personal_backend.sql`, after
   `0000_initial.sql`).
5. Import the data: `wrangler d1 execute idantity-dot-me --remote --file personal-data.sql`. The export has no
   CREATE statements. Check row counts for `todo`, `note`, `storage_files`, `financial_transaction`.
6. R2: no copy needed. The personal bucket is bound as `PERSONAL_BLOB`; keys and cdn.idantity.me URLs keep working.
7. Mail: no stored mail to migrate. The `MailboxDO` starts empty. Mailbox config JSON stays in R2.
8. DNS and email routing: point the Email Routing rules for `daniel@`, `hello@`, `admin@` (idantity.me) at
   `idantity-dot-me`. Only one worker gets each rule, so do this last.
9. Verify: a request to `https://idantity.me/api/personal/todos` without Access should be refused at the edge;
   with an Access session it should return 200.
10. Rollback: point the email routing rules back to the personal worker, leave personal D1 untouched, and point
    the native client at `https://personal.idantity.me/api`.

Retire personal.idantity.me only after the retirement audit (plan WS6 ST6.5).

## 7. Native client contract (Cloudflare Access)

- The native app authenticates through the Access application from step 6.1. It obtains an Access token by
  the CLI login flow (the same one `cloudflared access login` uses for a self-hosted app).
- It sends the token as the `cf-access-token` request header on every `/api/personal/*` request. The header name
  and the exact login URL are from memory of Cloudflare's Access documentation, not checked against it. Confirm
  both before the sign-in agent relies on them.
- Access validates the token at the edge and forwards the identity to the worker as `Cf-Access-Jwt-Assertion`.
  The worker re-verifies that JWT against `TEAM_DOMAIN` and `POLICY_AUD`.
- Native base URL: `https://idantity.me/api/personal` (`DEFAULT_API_BASE` in `crates/core/src/api.rs`). Inbox
  calls use `/v1/...` under the same base.
- Errors are JSON `{error, message}`: 401 for a missing or invalid token, 403 for an identity without an email,
  500 when the server's Access settings are missing or verification is unavailable.

## 8. Known risks

- The worker check adds one `get-identity` request per personal call (the shared `cf-access` adapter also fetches
  group names). Acceptable for one owner; can be replaced by a direct JWT check later.
- Storage files are readable on `cdn.idantity.me` by key. That is the bucket's public domain, outside the worker
  and Access, and matches personal.idantity.me today.
- Routes under `/api/personal` filter reads by owner, but several update and delete statements (habits, groceries
  item edits, watchlist, music, notebooks, finances, housing pets) filter by id only. Access limits callers to the
  owner, but per-row ownership is not checked in those statements.
- Empty note titles are accepted (no 400).
- Mailbox delete leaves its DO data and attachments behind (existing TODO in the inbox code).
- `items` table is created but no route uses it (kept for parity).
- Build not run: `pnpm-lock.yaml` does not contain `postal-mime`; the build pass must run `vp install`.
