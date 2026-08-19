import type { SeoEntry, LocaleConfig } from "@rimelight/seo"
import { db } from "@/db"
import { pages } from "@/db/schema"
import { eq, and, isNull } from "drizzle-orm"

/**
 * SEO locale configuration
 */
export const SEO_LOCALES: LocaleConfig = {
  site: "https://idantity.me",
  locales: {
    en: "en-US",
    pt: "pt-BR"
  },
  defaultLocale: "en",
  trailingSlash: "never"
}

/**
 * Static marketing/company paths (not in content collections)
 */
const STATIC_PATHS = [
  "/",
  "/about",
  "/assets",
  "/blog",
  "/branding",
  "/legal",
  "/music",
  "/projects",
  "/resume",
  "/services",
  "/construction"
]

/**
 * Private path prefixes to exclude from sitemap
 */
export const PRIVATE_PATH_PREFIXES = [
  "/dashboard",
  "/admin",
  "/cms",
  "/internal",
  "/api",
  "/dev",
  "/og",
  "/open-graph",
  "/auth"
]

/**
 * Extract all doc paths from docs config (falls back to empty when absent)
 */
async function extractDocPaths(): Promise<string[]> {
  try {
    const { default: docsConfig } = await import("./docs.config")
    const paths: string[] = []

    function processSidebar(items: any[]) {
      for (const item of items) {
        if (item.href) {
          // Convert /{locale}/docs/path to /docs/path
          const path = item.href.replace("/{locale}", "")
          paths.push(path)
        }
        if (item.items) {
          processSidebar(item.items)
        }
      }
    }

    const sidebarItems = Array.isArray(docsConfig.sidebar)
      ? docsConfig.sidebar
      : docsConfig.sidebar.scopes
    processSidebar(sidebarItems)
    return paths
  } catch {
    return []
  }
}

/**
 * Gather all SEO entries for the site
 */
export async function seoEntries(): Promise<SeoEntry[]> {
  const entries: SeoEntry[] = []

  // Static paths
  for (const path of STATIC_PATHS) {
    entries.push({ path })
  }

  // Doc paths from registry
  const docPaths = await extractDocPaths()
  for (const path of docPaths) {
    entries.push({ path })
  }

  // Blog entries from CMS
  const blogPages = await db
    .select({ slug: pages.slug, postedAt: pages.postedAt, updatedAt: pages.updatedAt })
    .from(pages)
    .where(and(eq(pages.type, "blog"), isNull(pages.deletedAt)))
    .catch(() => [])

  for (const post of blogPages) {
    const path = `/blog/${post.slug}`
    const lastmod = post.updatedAt ?? post.postedAt
    entries.push({
      path,
      ...(lastmod ? { lastmod } : {}),
      changefreq: "weekly"
    })
  }

  // Legal entries from CMS
  const legalPages = await db
    .select({ slug: pages.slug, postedAt: pages.postedAt, updatedAt: pages.updatedAt })
    .from(pages)
    .where(and(eq(pages.type, "legal"), isNull(pages.deletedAt)))
    .catch(() => [])

  for (const page of legalPages) {
    const path = `/legal/${page.slug}`
    const lastmod = page.updatedAt ?? page.postedAt
    entries.push({
      path,
      ...(lastmod ? { lastmod } : {}),
      changefreq: "monthly"
    })
  }

  // Filter out private paths
  return entries.filter(
    (entry) => !PRIVATE_PATH_PREFIXES.some((prefix) => entry.path.startsWith(prefix))
  )
}