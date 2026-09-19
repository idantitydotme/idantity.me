import { Hono } from "hono"
import { env as cfEnv } from "cloudflare:workers"
import { verifyTurnstile } from "@rimelight/security"

function sanitize(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

const api = new Hono().post("/", async (c) => {
  try {
    const formData = await c.req.formData()
    const name = (formData.get("name") as string | null)?.trim() ?? ""
    const email = (formData.get("email") as string | null)?.trim() ?? ""
    const subject = (formData.get("subject") as string | null)?.trim() || undefined
    const message = (formData.get("message") as string | null)?.trim() ?? ""
    const turnstileToken = (formData.get("cf-turnstile-response") as string | null) || undefined

    if (!name) {
      return c.json({ success: false, error: "Please enter your name." }, 400)
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return c.json({ success: false, error: "Please enter a valid email address." }, 400)
    }
    if (!message || message.length < 10) {
      return c.json(
        { success: false, error: "Your message should be at least 10 characters." },
        400
      )
    }

    const env =
      (c.env as Record<string, any> | undefined) ?? (cfEnv as Record<string, any> | undefined) ?? {}
    const clientIP = c.req.header("CF-Connecting-IP") || undefined

    const verification = await verifyTurnstile(turnstileToken, env, clientIP)
    if (!verification.success) {
      return c.json(
        {
          success: false,
          error: verification.error || "Anti-bot verification failed. Please try again."
        },
        400
      )
    }

    const domain = env["EMAIL_DOMAIN"] || "idantity.me"
    const ownerEmail = env["CONTACT_OWNER_EMAIL"] || `owner@${domain}`
    const mailSubject =
      subject && subject.length > 0
        ? `[Contact Form] ${subject}`
        : `[Contact Form] New message from ${name}`

    const textBody = `Name: ${name}\nEmail: ${email}\n${subject ? `Subject: ${subject}\n` : ""}\nMessage:\n${message}`

    const htmlBody = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f4f4f5;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e4e4e7;">
    <div style="background: #18181b; color: #ffffff; padding: 20px; font-size: 18px; font-weight: 600;">
      New Contact Form Message
    </div>
    <div style="padding: 24px;">
      <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 16px; margin-bottom: 20px;">
        <p style="margin: 0 0 8px 0; font-size: 14px; color: #4b5563;">
          <strong style="color: #111;">From:</strong> ${sanitize(name)} &lt;<a href="mailto:${sanitize(email)}" style="color: #2563eb; text-decoration: none;">${sanitize(email)}</a>&gt;
        </p>
        ${subject ? `<p style="margin: 0; font-size: 14px; color: #4b5563;"><strong style="color: #111;">Subject:</strong> ${sanitize(subject)}</p>` : ""}
      </div>
      <h3 style="margin: 0 0 8px 0; font-size: 15px; color: #374151;">Message Content:</h3>
      <div style="white-space: pre-wrap; font-size: 14px; color: #1f2937; background: #ffffff; padding: 16px; border-left: 4px solid #2563eb; border-radius: 4px; border-top: 1px solid #f3f4f6; border-right: 1px solid #f3f4f6; border-bottom: 1px solid #f3f4f6;">
${sanitize(message)}
      </div>
    </div>
  </div>
</body>
</html>`.trim()

    const emailBinding = env["EMAIL"]
    if (!emailBinding) {
      if (import.meta.env.DEV) {
        console.warn(
          "[contact] Dev mode: EMAIL binding missing. Message logged to console:\n",
          textBody
        )
        return c.json({ success: true })
      }
      console.error("[contact] EMAIL binding not available")
      return c.json({ success: false, error: "Email service is temporarily unavailable." }, 500)
    }

    await emailBinding.send({
      to: ownerEmail,
      from: `noreply@${domain}`,
      subject: mailSubject,
      text: textBody,
      html: htmlBody,
      replyTo: email
    })

    return c.json({ success: true })
  } catch (err: unknown) {
    console.error("[contact API error]", err)
    return c.json(
      {
        success: false,
        error: "Could not send your contact message. Please try again later."
      },
      500
    )
  }
})

export default api
