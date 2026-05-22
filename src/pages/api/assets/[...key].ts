import type { APIRoute } from "astro"
import { env } from "cloudflare:workers"

interface R2HttpMetadata {
  contentType?: string
  contentLanguage?: string
  contentDisposition?: string
  cacheControl?: string
}

interface R2Object {
  key: string
  size: number
  uploaded: string
  httpMetadata?: R2HttpMetadata
  httpEtag: string
  body: ReadableStream
  customMetadata?: Record<string, string>
}

interface R2Bucket {
  get(key: string): Promise<R2Object | null>
  put(
    key: string,
    value: ArrayBuffer | ReadableStream,
    options?: { httpMetadata?: R2HttpMetadata; customMetadata?: Record<string, string> }
  ): Promise<R2Object>
  delete(key: string): Promise<void>
  list(options?: {
    cursor?: string
  }): Promise<{ objects: R2Object[]; truncated: boolean; cursor?: string }>
}

// BLOB is now typed globally via src/env.d.ts

function getKey(params: { key?: string | string[] }): string | undefined {
  const key = params.key
  if (Array.isArray(key)) {
    return key.join("/")
  }
  return key
}

function isMoveBody(body: unknown): body is { to: string } {
  if (typeof body !== "object" || body === null) return false
  if (!("to" in body)) return false
  const b = body as { to?: unknown }
  return typeof b.to === "string"
}

export const GET: APIRoute = async ({ params }) => {
  const key = getKey(params)
  if (!key) {
    return new Response(null, { status: 400, statusText: "Missing key" })
  }

  const BLOB = env.BLOB

  if (!BLOB) {
    return new Response(null, { status: 500, statusText: "R2 bucket not bound" })
  }

  const object = await BLOB.get(key)

  if (object === null) {
    return new Response(null, { status: 404, statusText: "Object Not Found" })
  }

  const headers = new Headers()

  if (object.httpMetadata?.contentType) {
    headers.set("Content-Type", object.httpMetadata.contentType)
  }
  if (object.httpMetadata?.contentLanguage) {
    headers.set("Content-Language", object.httpMetadata.contentLanguage)
  }
  if (object.httpMetadata?.contentDisposition) {
    headers.set("Content-Disposition", object.httpMetadata.contentDisposition)
  }
  if (object.httpMetadata?.cacheControl) {
    headers.set("Cache-Control", object.httpMetadata.cacheControl)
  }

  headers.set("ETag", object.httpEtag)

  return new Response(object.body, { headers })
}

export const PUT: APIRoute = async ({ params, request }) => {
  const key = getKey(params)
  if (!key) {
    return new Response(null, { status: 400, statusText: "Missing key" })
  }

  const BLOB = env.BLOB

  if (!BLOB) {
    return new Response(null, { status: 500, statusText: "R2 bucket not bound" })
  }

  const contentType = request.headers.get("content-type") ?? undefined

  const buffer = await request.arrayBuffer()
  if (!buffer || buffer.byteLength === 0) {
    return new Response(null, { status: 400, statusText: "Empty body" })
  }

  const putOptions: { httpMetadata?: R2HttpMetadata } = {}
  if (contentType) {
    putOptions.httpMetadata = { contentType }
  }

  const object = await BLOB.put(key, buffer, putOptions)

  if (!object) {
    return new Response(null, { status: 500, statusText: "Failed to upload to R2" })
  }

  return new Response(
    JSON.stringify({
      key: object.key,
      size: object.size,
      etag: object.httpEtag
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" }
    }
  )
}

export const DELETE: APIRoute = async ({ params }) => {
  const key = getKey(params)
  if (!key) {
    return new Response(null, { status: 400, statusText: "Missing key" })
  }

  const BLOB = env.BLOB

  if (!BLOB) {
    return new Response(null, { status: 500, statusText: "R2 bucket not bound" })
  }

  await BLOB.delete(key)

  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" }
  })
}

export const POST: APIRoute = async ({ params, request }) => {
  const key = getKey(params)
  if (!key) {
    return new Response(null, { status: 400, statusText: "Missing key" })
  }

  const BLOB = (env as unknown as Env).BLOB

  if (!BLOB) {
    return new Response(null, { status: 500, statusText: "R2 bucket not bound" })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return new Response(null, { status: 400, statusText: "Invalid JSON body" })
  }

  if (!isMoveBody(body)) {
    return new Response(null, {
      status: 400,
      statusText: "Destination key 'to' is required and must be a string"
    })
  }

  const { to } = body

  try {
    const original = await BLOB.get(key)
    if (!original) {
      return new Response(null, { status: 404, statusText: `Source asset not found: ${key}` })
    }

    const putOptions: { httpMetadata?: R2HttpMetadata; customMetadata?: Record<string, string> } =
      {}
    if (original.httpMetadata) putOptions.httpMetadata = original.httpMetadata
    if (original.customMetadata) putOptions.customMetadata = original.customMetadata

    await BLOB.put(to, original.body, putOptions)

    await BLOB.delete(key)

    return new Response(JSON.stringify({ success: true, from: key, to }), {
      headers: { "Content-Type": "application/json" }
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to move/rename asset"
    console.error(`Move/Rename failed from ${key} to ${to}:`, err)
    return new Response(JSON.stringify({ error: message, from: key, to }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    })
  }
}
