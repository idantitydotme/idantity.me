import type { APIRoute } from "astro"

interface R2Object {
  key: string
  size: number
  uploaded: string
  httpMetadata?: {
    contentType?: string
    contentLanguage?: string
    contentDisposition?: string
    cacheControl?: string
  }
  httpEtag: string
}

interface R2ListResult {
  objects: R2Object[]
  truncated: boolean
  cursor?: string
}

interface R2Bucket {
  list(options?: { cursor?: string }): Promise<R2ListResult>
}

// BLOB is now typed globally via src/env.d.ts

async function fetchAllPages(blob: R2Bucket, cursor?: string): Promise<R2ListResult[]> {
  const list = await blob.list(cursor ? { cursor } : {})
  if (!list.truncated || !list.cursor) {
    return [list]
  }
  const rest = await fetchAllPages(blob, list.cursor)
  return [list, ...rest]
}

import { env } from "cloudflare:workers"

export const GET: APIRoute = async () => {
  const BLOB = env.BLOB

  if (!BLOB) {
    return new Response(JSON.stringify({ error: "R2 bucket (BLOB) not bound" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    })
  }

  const headers = {
    "Content-Type": "application/json",
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    "Pragma": "no-cache",
    "Expires": "0"
  }

  const pages = await fetchAllPages(BLOB)

  const allObjects = pages.flatMap((page) => page.objects)

  const uniqueObjectsMap = new Map<string, R2Object>()
  allObjects.forEach((obj) => {
    uniqueObjectsMap.set(obj.key, obj)
  })

  const result = Array.from(uniqueObjectsMap.values()).map((obj) => ({
    key: obj.key,
    size: obj.size,
    uploaded: obj.uploaded,
    contentType: obj.httpMetadata?.contentType,
    etag: obj.httpEtag
  }))

  return new Response(JSON.stringify(result), { headers })
}
