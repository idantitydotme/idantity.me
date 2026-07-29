import { sendEmail } from "."
import { renderSignupNotificationEmail } from "./render"
import { getEmailMessages } from "./messages"

export interface ExistingUserSignUpNotificationOptions {
  user: { email: string }
  locale?: string
}

export async function sendExistingUserSignUpNotification({
  user,
  locale
}: ExistingUserSignUpNotificationOptions) {
  const messages = getEmailMessages(locale)
  const subject = messages.signupNotification.subject

  const html = await renderSignupNotificationEmail("/auth/sign-in", locale)

  await sendEmail({
    to: user.email,
    subject,
    text: `${messages.signupNotification.description} ${messages.signupNotification.sign_in_prefix} ${messages.signupNotification.sign_in} ${messages.signupNotification.sign_in_suffix}`,
    html
  })
}
