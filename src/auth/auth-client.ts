import type { UserSessionContext } from "@rimelight/auth"

export type { UserSessionContext }

export interface AuthClientSession {
  user: UserSessionContext | null
  session: { id: string; userId: string } | null
}

/**
 * Thin CF Access client. There is no browser-side login UI — CF Access handles the access gate
 * entirely. This client only exposes a session fetch helper for client-side JS that needs to know
 * who the current user is.
 */
export const authClient = {
  async getSession(): Promise<AuthClientSession> {
    try {
      const res = await fetch("/api/auth/session")
      if (!res.ok) return { user: null, session: null }
      return await res.json()
    } catch {
      return { user: null, session: null }
    }
  }
}
