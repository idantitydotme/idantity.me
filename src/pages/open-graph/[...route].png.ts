import type { APIRoute } from "astro"
import { renderDefaultOg } from "@rimelight/seo/og"
import { db } from "#db"
import { pages } from "#db/schema"
import { eq, and, isNull } from "drizzle-orm"

function getLocalizedText(val: unknown, locale = "en"): string {
  if (typeof val === "object" && val !== null) {
    const record = val as Record<string, string>
    return record[locale] || Object.values(record)[0] || ""
  }
  if (typeof val === "string") return val
  if (typeof val === "number" || typeof val === "boolean") return String(val)
  return ""
}

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url)
  const routeParam = url.pathname.replace(/^\/open-graph\//, "").replace(/\.png$/, "")

  let title = url.searchParams.get("title") || ""
  let description = url.searchParams.get("description") || ""
  let date = url.searchParams.get("pubDate") || ""
  const badge = url.searchParams.get("type") ||
    (routeParam.includes("blog") ? "Blog Post" : routeParam.includes("legal") ? "Legal" : "")

  if (!title && routeParam && routeParam !== "page" && routeParam !== "default") {
    const slug = routeParam.split("/").pop() ?? ""
    const page = await db
      .select({ title: pages.title, description: pages.description, postedAt: pages.postedAt })
      .from(pages)
      .where(and(eq(pages.slug, slug), isNull(pages.deletedAt)))
      .limit(1)
      .then((r) => r[0])
      .catch(() => undefined)

    if (page) {
      title = getLocalizedText(page.title)
      description = description || getLocalizedText(page.description)
      if (page.postedAt && !date) date = new Date(page.postedAt).toLocaleDateString()
    }
  }

  const isDocs =
    url.searchParams.get("isDocs") === "true" || routeParam.includes("docs")

  return renderDefaultOg({
    title: title || "idantity.me",
    description,
    brand: "idantity.me",
    badge,
    date,
    background: isDocs ? "gradient" : "dark",
    preview: url.searchParams.get("preview") === "1"
  })
}