import { db } from "#db"
import { pages } from "#db/schema"
import { and, isNotNull, isNull } from "drizzle-orm"
import { buildLlmsTxt } from "@rimelight/seo"

export const prerender = false

export async function GET(context: { url: URL; site?: URL }) {
  const siteUrl = context.site?.toString() || `${context.url.protocol}//${context.url.host}`

  let docRows: any[] = []
  try {
    docRows = await db
      .select()
      .from(pages)
      .where(and(isNull(pages.deletedAt), isNotNull(pages.publishedVersionId)))
  } catch {
    docRows = []
  }

  const resolveLocalized = (val: unknown): string => {
    if (typeof val === "string") return val
    if (typeof val === "object" && val !== null) {
      const rec = val as Record<string, string>
      return rec["en"] || Object.values(rec)[0] || ""
    }
    return typeof val === "number" ? String(val) : ""
  }

  const llmsPages = docRows.map((p) => {
    const title = resolveLocalized(p.title) || p.slug
    const description = resolveLocalized(p.description)
    const slug = p.slug === "index" ? "" : p.slug
    const pathPrefix = p.type === "doc" ? "docs" : p.type
    const url = `${siteUrl}/en/${pathPrefix}/${slug}`.replace(/\/+$/, "")
    const markdownUrl = `${url}.md`

    return {
      title,
      description,
      url,
      markdownUrl,
      section: p.type ? p.type.toUpperCase() : "GENERAL"
    }
  })

  const body = buildLlmsTxt({
    site: siteUrl,
    title: "idantity",
    description: "Personal portfolio, blog, and projects by idantity.",
    pages: llmsPages
  })

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400"
    }
  })
}
