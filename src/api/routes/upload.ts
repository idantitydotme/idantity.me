import { Hono } from "hono"
import { env as cfEnv } from "cloudflare:workers"

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "application/pdf"]
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

const api = new Hono().post("/", async (c) => {
  try {
    const formData = await c.req.formData()
    const file = formData.get("file")

    if (!file || !(file instanceof File)) {
      return c.json({ success: false, error: "Please choose a file to upload." }, 400)
    }

    if (file.size === 0) {
      return c.json({ success: false, error: "The selected file is empty." }, 400)
    }

    if (file.size > MAX_SIZE) {
      return c.json({ success: false, error: "File must be 5 MB or smaller." }, 400)
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return c.json(
        {
          success: false,
          error: "Only PNG, JPEG, WEBP, or PDF files are allowed."
        },
        400
      )
    }

    const env =
      (c.env as Record<string, any> | undefined) ?? (cfEnv as Record<string, any> | undefined) ?? {}
    const bucket = env["BLOB"] ?? env["STORAGE_BUCKET"]

    if (!bucket) {
      if (import.meta.env.DEV) {
        const fakeKey = `dev-uploads/${crypto.randomUUID()}`
        return c.json({
          success: true,
          key: fakeKey,
          filename: file.name,
          size: file.size
        })
      }
      console.error("[upload API] R2 bucket binding not available")
      return c.json({ success: false, error: "Storage service is unavailable." }, 500)
    }

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin"
    const key = `uploads/${crypto.randomUUID()}.${ext}`

    await bucket.put(key, await file.arrayBuffer(), {
      httpMetadata: { contentType: file.type }
    })

    return c.json({
      success: true,
      key,
      filename: file.name,
      size: file.size
    })
  } catch (err: unknown) {
    console.error("[upload API error]", err)
    return c.json({ success: false, error: "Failed to upload file to storage." }, 500)
  }
})

export default api
