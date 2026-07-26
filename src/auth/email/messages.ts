import en from "@/translations/en.json"

export type EmailMessages = {
  common: typeof en.email_common
  verification: typeof en.email_verification
  passwordReset: typeof en.email_password_reset
  signupNotification: typeof en.email_signup_notification
}

export function getEmailMessages(_locale = "en"): EmailMessages {
  return {
    common: en.email_common,
    verification: en.email_verification,
    passwordReset: en.email_password_reset,
    signupNotification: en.email_signup_notification
  }
}