import { getCookie, setCookie } from "hono/cookie"

export const CONSTRUCTION_GUEST_COOKIE = "rimelight-construction-guest"

type GuestEnv = {
  CONSTRUCTION_GUEST_EMAIL?: string
  CONSTRUCTION_GUEST_PASSWORD?: string
  CONSTRUCTION_GUEST_SECRET?: string
  BETTER_AUTH_SECRET?: string
}

const getConfig = (env?: GuestEnv) => ({
  email: env?.CONSTRUCTION_GUEST_EMAIL ?? process.env.CONSTRUCTION_GUEST_EMAIL,
  password: env?.CONSTRUCTION_GUEST_PASSWORD ?? process.env.CONSTRUCTION_GUEST_PASSWORD,
  secret:
    env?.CONSTRUCTION_GUEST_SECRET ??
    process.env.CONSTRUCTION_GUEST_SECRET ??
    env?.BETTER_AUTH_SECRET ??
    process.env.BETTER_AUTH_SECRET
})

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
  const secret = getConfig(c.env).secret
  if (!token || !secret) return false

  try {
    const [encodedPayload, encodedSignature] = token.split(".")
    if (!encodedPayload || !encodedSignature) return false
    const payload = new TextDecoder().decode(decode(encodedPayload))
    const { key } = await sign(payload, secret)
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

export const signInConstructionGuest = async (
  c: any,
  email: string,
  password: string,
  rememberMe = true
) => {
  const config = getConfig(c.env)
  if (
    !config.email ||
    !config.password ||
    !config.secret ||
    email !== config.email ||
    password !== config.password
  ) {
    return false
  }

  const payload = JSON.stringify({
    email: config.email,
    expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 7
  })
  const { signature } = await sign(payload, config.secret)
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