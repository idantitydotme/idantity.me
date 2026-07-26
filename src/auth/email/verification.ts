import { sendEmail } from "."
import { renderVerificationEmail } from "./render"
import { getEmailMessages } from "./messages"

export interface VerificationEmailOptions {
  user: { email: string }
  url: string
  token: string
  locale?: string
}

export async function sendVerificationEmail({ user, url, locale }: VerificationEmailOptions) {
  const messages = getEmailMessages(locale)
  const subject = messages.verification.subject

  const html = await renderVerificationEmail(url, locale)

  await sendEmail({
    to: user.email,
    subject,
    text: `${messages.verification.description} ${url}`,
    html
  })
}