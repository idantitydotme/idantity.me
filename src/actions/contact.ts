import { defineAction, ActionError } from "astro:actions"
import { z } from "astro/zod"
import { env as cfEnv } from "cloudflare:workers"
import { verifyTurnstile } from "@/lib/turnstile"
import { sendEmail } from "@/auth/email"
import { renderContactEmail } from "@/auth/email/render"

export const contact = defineAction({
  accept: "form",
  input: z.object({
    "name": z.string().trim().min(1, "Please enter your name."),
    "email": z.email(),
    "subject": z.string().trim().optional(),
    "message": z.string().trim().min(10, "Your message should be at least 10 characters."),
    "cf-turnstile-response": z.string().optional()
  }),
  handler: async (input, context) => {
    const env = (cfEnv as Record<string, any> | undefined) ?? {}
    const token = input["cf-turnstile-response"]
    const clientIP = context.request.headers.get("CF-Connecting-IP") || undefined

    const verification = await verifyTurnstile(token, env, clientIP)
    if (!verification.success) {
      throw new ActionError({
        code: "BAD_REQUEST",
        message: verification.error || "Anti-bot verification failed. Please try again."
      })
    }

    const ownerEmail = env.CONTACT_OWNER_EMAIL || `owner@${env.EMAIL_DOMAIN || "idantity.me"}`

    const mailSubject =
      input.subject && input.subject.length > 0
        ? `[Contact Form] ${input.subject}`
        : `[Contact Form] New message from ${input.name}`

    const textBody = `Name: ${input.name}\nEmail: ${input.email}\n\nMessage:\n${input.message}`

    const htmlBody = await renderContactEmail({
      name: input.name,
      email: input.email,
      subject: input.subject,
      message: input.message
    })

    try {
      await sendEmail({
        to: ownerEmail,
        subject: mailSubject,
        text: textBody,
        html: htmlBody
      })
      return { success: true }
    } catch (err: unknown) {
      console.error("[contact action error]", err)
      // If email binding is missing in local dev, still succeed gracefully for dev preview
      if (import.meta.env.DEV) {
        console.warn("[contact] Dev mode fallback: email logged to console.")
        return { success: true }
      }
      throw new ActionError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Could not send your contact message. Please try again later."
      })
    }
  }
})

export const upload = defineAction({
  accept: "form",
  input: z.object({
    file: z
      .instanceof(File, { message: "Please choose a file to upload." })
      .refine((f) => f.size > 0, "The selected file is empty.")
      .refine((f) => f.size <= 5 * 1024 * 1024, "File must be 5 MB or smaller.")
      .refine(
        (f) => ["image/png", "image/jpeg", "image/webp", "application/pdf"].includes(f.type),
        "Only PNG, JPEG, WEBP, or PDF files are allowed."
      )
  }),
  handler: async (input) => {
    const env = (cfEnv as Record<string, any> | undefined) ?? {}
    const bucket = env.BLOB ?? env.STORAGE_BUCKET

    if (!bucket) {
      if (import.meta.env.DEV) {
        return {
          success: true,
          key: `dev-uploads/${crypto.randomUUID()}`,
          filename: input.file.name,
          size: input.file.size
        }
      }
      console.error("[upload action] R2 bucket binding not available")
      throw new ActionError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Storage service is unavailable."
      })
    }

    const ext = input.file.name.split(".").pop()?.toLowerCase() ?? "bin"
    const key = `uploads/${crypto.randomUUID()}.${ext}`

    try {
      await bucket.put(key, await input.file.arrayBuffer(), {
        httpMetadata: { contentType: input.file.type }
      })
      return { success: true, key, filename: input.file.name, size: input.file.size }
    } catch (err: unknown) {
      console.error("[upload action error]", err)
      throw new ActionError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to upload file to storage."
      })
    }
  }
})
