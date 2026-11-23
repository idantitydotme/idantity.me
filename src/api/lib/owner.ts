import { env } from "cloudflare:workers";

/**
 * The single owner whose personal data the /api routes read and write.
 *
 * Set the `PERSONAL_OWNER_ID` secret to the `user_id` value already stored in the imported
 * D1 rows. There is no hard-coded fallback: a missing secret throws, so nothing is written
 * under an unknown owner.
 */
export function ownerId(): string {
  const id = (env as any)?.PERSONAL_OWNER_ID as string | undefined;
  if (!id) throw new Error("PERSONAL_OWNER_ID is not configured");
  return id;
}
