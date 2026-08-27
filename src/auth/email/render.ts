import { experimental_AstroContainer as AstroContainer } from "astro/container"
import VerificationEmail from "@/components/email/VerificationEmail.astro"
import PasswordResetEmail from "@/components/email/PasswordResetEmail.astro"
import SignupNotificationEmail from "@/components/email/SignupNotificationEmail.astro"
import ContactEmail from "@/components/email/ContactEmail.astro"
import { getEmailMessages } from "./messages"

const container = AstroContainer.create()

export async function renderVerificationEmail(url: string, locale = "en") {
  return (await container).renderToString(VerificationEmail, {
    props: { url, messages: getEmailMessages(locale) }
  })
}

export async function renderPasswordResetEmail(url: string, locale = "en") {
  return (await container).renderToString(PasswordResetEmail, {
    props: { url, messages: getEmailMessages(locale) }
  })
}

export async function renderSignupNotificationEmail(signInUrl: string, locale = "en") {
  return (await container).renderToString(SignupNotificationEmail, {
    props: { signInUrl, messages: getEmailMessages(locale) }
  })
}

export async function renderContactEmail(props: {
  name: string
  email: string
  subject?: string | undefined
  message: string
}) {
  return (await container).renderToString(ContactEmail, {
    props
  })
}
