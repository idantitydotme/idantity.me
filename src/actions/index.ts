import { ActionError, defineAction, type ActionErrorCode } from "astro:actions"
import { z } from "astro/zod"
import { APIError } from "better-auth/api"
import { contact, upload } from "./contact"

export const server = {
  contact,
  upload,
  signUp: defineAction({
    accept: "form",
    input: z.object({
      firstName: z.string(),
      lastName: z.string(),
      email: z.email(),
      password: z.string().min(8).max(128)
    }),
    handler: async (input) => {
      try {
        const { auth } = await import("#auth/auth")
        await auth.api.signUpEmail({
          body: {
            name: `${input.firstName} ${input.lastName}`,
            firstName: input.firstName,
            lastName: input.lastName,
            email: input.email,
            password: input.password
          }
        })
        return { success: true }
      } catch (error) {
        return throwActionAuthError("BAD_REQUEST", error)
      }
    }
  }),
  signIn: defineAction({
    accept: "form",
    input: z.object({
      email: z.email(),
      password: z.string()
    }),
    handler: async (input, ctx) => {
      try {
        const { auth } = await import("#auth/auth")
        const response = await auth.api.signInEmail({
          body: {
            email: input.email,
            password: input.password
          },
          headers: ctx.request.headers,
          asResponse: true
        })
        return { cookies: response.headers.getSetCookie() }
      } catch (error) {
        return throwActionAuthError("UNAUTHORIZED", error)
      }
    }
  }),
  signOut: defineAction({
    accept: "form",
    handler: async (_input, ctx) => {
      try {
        const { auth } = await import("#auth/auth")
        const response = await auth.api.signOut({
          headers: ctx.request.headers,
          asResponse: true
        })
        return { cookies: response.headers.getSetCookie() }
      } catch (error) {
        return throwActionAuthError("BAD_REQUEST", error)
      }
    }
  })
}

function throwActionAuthError(code: ActionErrorCode, error: unknown): never {
  throw new ActionError({
    code,
    message:
      error instanceof APIError
        ? `${error.body?.message ?? "Unknown error"}.`
        : "Something went wrong, please try again later."
  })
}
