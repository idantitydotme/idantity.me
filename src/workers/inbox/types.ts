// Copyright (c) 2026 Cloudflare, Inc.
// Licensed under the Apache 2.0 license found in the LICENSE file or at:
//     https://opensource.org/licenses/Apache-2.0
import type { MailboxDO } from "./durableObject";

/**
 * Environment shape required by the inbox Worker surface.
 *
 * Declared explicitly instead of extending the generated `Cloudflare.Env` because the generated
 * type instantiates the full Worker entrypoint and trips the compiler when used as Hono `Bindings`
 * generics.
 */
export interface Env {
  BUCKET: R2Bucket;
  DB: D1Database;
  DOMAINS: string;
  EMAIL: SendEmail;
  EMAIL_ADDRESSES: string[];
  MAILBOX: DurableObjectNamespace<MailboxDO>;
  POLICY_AUD?: string;
  TEAM_DOMAIN?: string;
}
