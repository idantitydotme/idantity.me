import { db } from "#db"
import { renderCorpusMarkdown } from "@rimelight/cms"

export const prerender = false

export async function GET(context: { url: URL; site?: URL }) {
  const siteUrl = context.site?.toString() || `${context.url.protocol}//${context.url.host}`

  const body = await renderCorpusMarkdown(db, {
    type: "doc",
    locale: "en",
    siteUrl,
    title: "idantity Full Documentation Corpus",
    description: "Complete single-corpus documentation for AI agents and LLM ingest."
  })

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400"
    }
  })
}
