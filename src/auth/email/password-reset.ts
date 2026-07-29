import { sendEmail } from "."
import { renderPasswordResetEmail } from "./render"
import { getEmailMessages } from "./messages"

export interface PasswordResetEmailOptions {
  user: { email: string }
  url: string
  token: string
  locale?: string
}

export async function sendPasswordResetEmail({ user, url, locale }: PasswordResetEmailOptions) {
  const messages = getEmailMessages(locale)
  const subject = messages.passwordReset.subject

  const html = await renderPasswordResetEmail(url, locale)

  await sendEmail({
    to: user.email,
    subject,
    text: `${messages.passwordReset.description} ${url}`,
    html
  })
}
