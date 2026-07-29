export interface CloudflareEnv {
  BLOB: R2Bucket
  R2: R2Bucket
  EMAIL: SendEmail
  EMAIL_TEST_RECIPIENT?: string
}

export function isCloudflareEnv(env: unknown): env is CloudflareEnv {
  return typeof env === "object" && env !== null && "BLOB" in env && "R2" in env
}

export async function getCloudflareEnv(c: any): Promise<CloudflareEnv | undefined> {
  // Method 1: Try c.env directly (Hono context)
  if (c?.env && typeof c.env === "object") {
    if (isCloudflareEnv(c.env)) {
      console.log("[getCloudflareEnv] Found on c.env")
      return c.env
    }
  }

  // Method 2: Use cloudflare:workers module (ASTRO V6 WAY)
  try {
    const { env: cfEnv } = await import("cloudflare:workers")
    if (cfEnv && typeof cfEnv === "object" && ("EMAIL" in cfEnv || "BLOB" in cfEnv)) {
      console.log("[getCloudflareEnv] Found on cloudflare:workers")
      if (isCloudflareEnv(cfEnv)) {
        return cfEnv
      }
    }
  } catch (err) {
    console.log("[getCloudflareEnv] cloudflare:workers import failed:", err)
  }

  console.log("[getCloudflareEnv] Not found anywhere")
  return undefined
}
