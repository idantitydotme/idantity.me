import en from "#translations/en.json"

export type EmailMessages = {
  common: any
  verification: any
  passwordReset: any
  signupNotification: any
}

export function getEmailMessages(_locale = "en"): EmailMessages {
  const json = en as Record<string, any>
  return {
    common: json.email_common ?? {},
    verification: json.email_verification ?? {},
    passwordReset: json.email_password_reset ?? {},
    signupNotification: json.email_signup_notification ?? {}
  }
}
