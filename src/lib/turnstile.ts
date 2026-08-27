export function isTurnstileEnabled(env: any): boolean {
  const siteKey =
    env?.TURNSTILE_SITE_KEY ||
    (typeof process !== "undefined" ? process.env?.TURNSTILE_SITE_KEY : undefined)
  const secretKey =
    env?.TURNSTILE_SECRET_KEY ||
    (typeof process !== "undefined" ? process.env?.TURNSTILE_SECRET_KEY : undefined)
  return !!(siteKey && secretKey)
}

interface VerifyResponse {
  "success": boolean
  "error-codes"?: string[]
}

export async function verifyTurnstile(
  token: string | null | undefined,
  env: any,
  remoteIP?: string
): Promise<{ success: boolean; error?: string; errorCodes?: string[] }> {
  if (!isTurnstileEnabled(env)) {
    console.log(
      "[Turnstile] Keys missing or not configured. Skipping verification (Failing Open for local dev)."
    )
    return { success: true }
  }

  if (!token) {
    return { success: false, error: "Security check token is missing." }
  }

  const secretKey =
    env?.TURNSTILE_SECRET_KEY ||
    (typeof process !== "undefined" ? process.env?.TURNSTILE_SECRET_KEY : "")

  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: secretKey,
        response: token,
        remoteip: remoteIP
      })
    })

    if (!response.ok) {
      return {
        success: false,
        error: `Cloudflare Turnstile API returned status ${response.status}`
      }
    }

    const data: VerifyResponse = await response.json()
    if (data.success) {
      return { success: true }
    } else {
      const codes = data["error-codes"] || []
      let msg = "Bot check verification failed."
      if (codes.includes("timeout-or-duplicate")) {
        msg = "Verification token expired or already used. Please refresh the security check."
      } else if (codes.includes("invalid-input-response")) {
        msg = "Invalid verification response. Please try again."
      }
      return { success: false, error: msg, errorCodes: codes }
    }
  } catch (err: any) {
    console.error("[Turnstile Exception]", err)
    return { success: true }
  }
}
