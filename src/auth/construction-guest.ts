import { getCookie, setCookie } from "hono/cookie"

export const CONSTRUCTION_GUEST_COOKIE = "rimelight-construction-guest"

type GuestEnv = {
  CONSTRUCTION_PASSPHRASE?: string
}

const getConfig = (env?: GuestEnv) => {
  return {
    passphrase: env?.CONSTRUCTION_PASSPHRASE ?? process.env.CONSTRUCTION_PASSPHRASE
  }
}

const encode = (value: Uint8Array) =>
  btoa(String.fromCharCode(...value))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "")

const decode = (value: string) => {
  const padded = value
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(Math.ceil(value.length / 4) * 4, "=")
  return Uint8Array.from(atob(padded), (char) => char.charCodeAt(0))
}

const sign = async (payload: string, secret: string) => {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  )
  return {
    key,
    signature: await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload))
  }
}

export const isConstructionGuest = async (c: any) => {
  const token = getCookie(c, CONSTRUCTION_GUEST_COOKIE)
  const passphrase = getConfig(c.env).passphrase
  if (!token || !passphrase) return false

  try {
    const [encodedPayload, encodedSignature] = token.split(".")
    if (!encodedPayload || !encodedSignature) return false
    const payload = new TextDecoder().decode(decode(encodedPayload))
    const { key } = await sign(payload, passphrase)
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      decode(encodedSignature),
      new TextEncoder().encode(payload)
    )
    return valid && JSON.parse(payload).expiresAt > Date.now()
  } catch {
    return false
  }
}

export const signInConstructionGuest = async (c: any, passphrase: string, rememberMe = true) => {
  const config = getConfig(c.env)
  if (!config.passphrase || !passphrase || passphrase !== config.passphrase) {
    return false
  }

  const payload = JSON.stringify({
    expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 7
  })
  const { signature } = await sign(payload, config.passphrase)
  setCookie(
    c,
    CONSTRUCTION_GUEST_COOKIE,
    encode(new TextEncoder().encode(payload)) + "." + encode(new Uint8Array(signature)),
    {
      httpOnly: true,
      secure: true,
      sameSite: "Lax",
      path: "/",
      ...(rememberMe ? { maxAge: 60 * 60 * 24 * 7 } : {})
    }
  )
  return true
}
