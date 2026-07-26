import { env as cfEnv } from "cloudflare:workers"

const getDomain = () => (cfEnv as any)?.EMAIL_DOMAIN || "idantity.me"

export interface EmailPayload {
  to: string
  subject: string
  text: string
  html?: string
}

export async function sendEmail({ to, subject, text, html }: EmailPayload) {
  const EMAIL = cfEnv?.EMAIL

  if (!EMAIL) {
    console.error("[email] EMAIL binding not available")
    throw new Error("EMAIL binding not available")
  }

  const domain = getDomain()

  const response = await EMAIL.send({
    to,
    from: `noreply@${domain}`,
    subject,
    text,
    html: html ?? text
  })

  console.log(`[email] Sent to ${to}, messageId: ${response.messageId}`)
  return response
}