import { Hono } from "hono"
import { env } from "cloudflare:workers"

function previewUrl(c: any, suffix = "") {
  const firstSegment = new URL(c.req.url).pathname.split("/").find(Boolean) ?? ""
  const locale = firstSegment === "pt" ? "pt" : "en"
  return `/${locale}/dev/email${suffix}`
}

const api = new Hono()
  .get("/", (c) => c.redirect(previewUrl(c)))
  .get("/:template", (c) => c.redirect(previewUrl(c, `/${c.req.param("template")}`)))
  .post("/test", async (c) => {
    try {
      const recipient = (env as any)?.EMAIL_TEST_RECIPIENT || (c.env as any)?.EMAIL_TEST_RECIPIENT
      if (!recipient) {
        return c.json({ error: "EMAIL_TEST_RECIPIENT is not configured." }, 500)
      }

      const body = await c.req.json<{ template?: string; locale?: string }>()

      if (body.template === "contact") {
        const { sendEmail } = await import("#auth/email")
        const { renderContactEmail } = await import("#auth/email/render")
        const html = await renderContactEmail({
          name: "Test User",
          email: "test.user@example.com",
          subject: "Test Contact Subject",
          message: "This is a test message from the preview email tool."
        })
        await sendEmail({
          to: recipient,
          subject: "[Preview Test] Contact Form Submission",
          text: "Test contact message",
          html
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
