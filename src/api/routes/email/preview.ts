import { Hono } from "hono"
import type { Context } from "hono"
import { sendVerificationEmail } from "@/auth/email/verification"
import { sendPasswordResetEmail } from "@/auth/email/password-reset"
import { sendExistingUserSignUpNotification } from "@/auth/email/notifications"
import { getCloudflareEnv, isCloudflareEnv } from "../../lib/env"

const api = new Hono()

function previewUrl(c: Context, suffix = "") {
  const firstSegment = new URL(c.req.url).pathname.split("/").filter(Boolean)[0]
  const locale = firstSegment === "pt" ? "pt" : "en"
  return `/${locale}/dev/email${suffix}`
}

// Keep the old API URLs working while the previews are served by Astro pages.
api.get("/", (c) => c.redirect(previewUrl(c)))
api.get("/:template", (c) => c.redirect(previewUrl(c, `/${c.req.param("template")}`)))

api.post("/test", async (c) => {
  if (!import.meta.env.DEV) {
    return c.json({ error: "Test email sending is only available in development." }, 404)
  }

  try {
    const env = (c.env ?? (await getCloudflareEnv(c))) as CloudflareEnv
    const recipient = env.EMAIL_TEST_RECIPIENT
    if (!recipient) {
      return c.json({ error: "EMAIL_TEST_RECIPIENT is not configured." }, 500)
    }

    const body = await c.req.json<{ template?: string; locale?: string }>()
    const locale = body.locale ?? "en"

    if (body.template === "verification") {
      await sendVerificationEmail({
        user: { email: recipient },
        url: "https://rimelight.com/en/api/auth/verify-email?token=test-token",
        token: "test-token",
        locale
      })
    } else if (body.template === "password-reset") {
      await sendPasswordResetEmail({
        user: { email: recipient },
        url: "https://rimelight.com/en/auth/reset-password?token=test-token",
        token: "test-token",
        locale
      })
    } else if (body.template === "signup-notification") {
      await sendExistingUserSignUpNotification({
        user: { email: recipient },
        locale
      })
    } else {
      return c.json({ error: "Unknown email template." }, 400)
    }

    return c.json({ ok: true, recipient, template: body.template })
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : "Unable to send test email." },
      500
    )
  }
})

export default api
