import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { db } from "@/db"
import { admin as adminPlugin, organization as organizationPlugin } from "better-auth/plugins"
import { ac, owner, admin, member, user } from "@/auth/permissions"

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg"
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    requireEmailVerification: true,
    minPasswordLength: 8,
    maxPasswordLength: 128
  },
  user: {
    changeEmail: {
      enabled: true
    },
    emailVerification: {
      // sendChangeEmailConfirmation: async ({ user, newEmail, url, token }) => {
      //     // Send change email confirmation to the old email
      // },
    },
    deleteUser: {
      enabled: true
      // sendDeleteAccountVerification: async ({ user, url, token }, request) => {
      // 	    await sendEmail(Odata.user.email, "Delete Account Verification", data.url)
      // 	},
      // 	beforeDelete: async (user) => {
      // 	    // Perform actions before user deletion
      // 	},
      // 	afterDelete: async (user) => {
      // 	    // Perform cleanup after user deletion
      // 	}
      // }
    },
    additionalFields: {
      tag: {
        type: "string",
        required: false,
        default: "0000",
        input: false
      },
      firstName: {
        type: "string",
        required: true,
        default: "",
        input: true
      },
      lastName: {
        type: "string",
        required: true,
        default: "",
        input: true
      },
      role: {
        type: "string",
        required: false,
        default: "user",
        input: false
      },
      availability: {
        type: "string",
        required: false,
        default: "available"
      },
      status: {
        type: "string",
        required: false,
        default: ""
      },
      publicKey: {
        type: "string",
        required: false,
        input: true
      }
    }
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    freshAge: 60 * 15,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5
    }
  },
  rateLimit: {
    window: 10,
    max: 100,
    storage: "database",
    modelName: "rateLimit"
  },
  plugins: [
    adminPlugin(),
    organizationPlugin({
      teams: {
        enabled: true
      },
      ac,
      roles: {
        owner,
        admin,
        member,
        user
      }
    })
  ],
  advanced: {
    useSecureCookies: true,
    cookiePrefix: "auth",
    database: {
      generateId: "uuid"
    }
  }
})
