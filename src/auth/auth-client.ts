import { createAuthClient } from "better-auth/vue"
import { adminClient, organizationClient } from "better-auth/client/plugins"
import { ac, owner, admin, member, user } from "@/auth/permissions"

export const authClient = createAuthClient({
  plugins: [
    adminClient(),
    organizationClient({
      ac,
      roles: {
        owner,
        admin,
        member,
        user
      }
    })
  ]
})
