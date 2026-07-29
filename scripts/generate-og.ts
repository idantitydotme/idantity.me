import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "fs"
import { join, relative, dirname, parse } from "path"
import satori from "satori"
import { Resvg } from "@resvg/resvg-js"

const CONTENT_ROOT = join(process.cwd(), "src/content")

function getSubDirectories(dir: string): string[] {
  if (!existsSync(dir)) return []
  return readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.endsWith("_bak") && !d.name.endsWith("_held"))
    .map((d) => join(dir, d.name))
}

const CONTENT_DIRS = getSubDirectories(CONTENT_ROOT)
const OUTPUT_DIR = join(process.cwd(), "public/og")

const pad = (n: number) => n.toString().padStart(2, "0")

const originalLog = console.log
console.log = (...args: any[]) => {
  const now = new Date()
  const timestamp = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
  originalLog(`${timestamp} [generate-og]`, ...args)
}

const originalError = console.error
console.error = (...args: any[]) => {
  const now = new Date()
  const timestamp = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
  originalError(`${timestamp} [generate-og]`, ...args)
}

interface Post {
  id: string
  locale: string
  type: string
  slug: string
  title: string
  description: string
  pubDate: string
  collection: string
}

const STATIC_PAGES: Post[] = [
  {
    id: "en/home",
    locale: "en",
    type: "Overview",
    slug: "home",
    title: "Idantity",
    description: "Accessing me.",
    pubDate: "",
    collection: "static"
  },
  {
    id: "pt/home",
    locale: "pt",
    type: "Visão Geral",
    slug: "home",
    title: "Idantity",
    description: "Acessando você.",
    pubDate: "",
    collection: "static"
  }
]

const loadFonts = (() => {
  let cache: Promise<{ regular: ArrayBuffer; bold: ArrayBuffer }> | undefined
  return () => {
    cache ??= Promise.all([
      fetch("https://cdn.jsdelivr.net/fontsource/fonts/noto-sans@latest/latin-400-normal.ttf").then(
        (res) => {
          if (!res.ok) throw new Error(`Failed to fetch Noto Sans 400: ${res.status}`)
          return res.arrayBuffer()
        }
      ),
      fetch("https://cdn.jsdelivr.net/fontsource/fonts/noto-sans@latest/latin-700-normal.ttf").then(
        (res) => {
          if (!res.ok) throw new Error(`Failed to fetch Noto Sans 700: ${res.status}`)
          return res.arrayBuffer()
        }
      )
    ]).then(([regular, bold]) => ({ regular, bold }))
    return cache
  }
})()

function parseFrontmatter(filePath: string): Record<string, string> {
  const raw = readFileSync(filePath, "utf-8")
  const rawMatch = raw.match(/^---\n([\s\S]*?)\n---/)
  if (!rawMatch) return {}

  const frontmatter = rawMatch[1]!
  const fields: Record<string, string> = {}

  for (const line of frontmatter.split("\n")) {
    const sep = line.indexOf(":")
    if (sep === -1) continue
    const key = line.slice(0, sep).trim()
    if (!key || !/^\w+$/.test(key)) continue
    let value = line.slice(sep + 1).trim()
    if (value.startsWith('"')) {
      const close = value.indexOf('"', 1)
      if (close !== -1) value = value.slice(1, close)
    } else {
      const hash = value.indexOf(" #")
      if (hash !== -1) value = value.slice(0, hash)
    }
    fields[key] = value.trim()
  }

  return fields
}

function walkDir(dir: string): string[] {
  const files: string[] = []
  if (!existsSync(dir)) return files
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...walkDir(full))
    } else if (entry.isFile() && (entry.name.endsWith(".md") || entry.name.endsWith(".mdx"))) {
      files.push(full)
    }
  }
  return files
}

function readPosts(): Post[] {
  const files: string[] = []
  for (const dir of CONTENT_DIRS) {
    files.push(...walkDir(dir))
  }

  const collectionPosts = files
    .map((file) => {
      const normalizedPath = file.replace(/\\/g, "/")
      const contentDir = CONTENT_DIRS.find((d) => normalizedPath.startsWith(d.replace(/\\/g, "/")))
      if (!contentDir) return null
      const collection = contentDir.replace(/\\/g, "/").split("/").pop() || ""

      const relativePath = relative(contentDir, file)
      const parts = relativePath.split(/[\\/]/)

      if (parts.length < 2) return null

      const locale = parts[0]!
      const type = parts.length > 2 ? parts.slice(1, -1).join("/") : ""
      const slug = parse(parts[parts.length - 1]!).name
      const id = type ? `${locale}/${type}/${slug}` : `${locale}/${slug}`

      const fm = parseFrontmatter(file)
      const title = fm["title"] || slug
      const description = fm["description"] || ""
      const pubDate = fm["pubDate"] || ""

      return { id, locale, type, slug, title, description, pubDate, collection }
    })
    .filter((p): p is Post => p !== null)

  return [...STATIC_PAGES, ...collectionPosts]
}

function buildOgJsx(post: Post): any {
  const isDocs = post.collection === "docs"
  const typeDisplay = post.type
    ? post.type
        .split("/")
        .map((segment) =>
          segment
            .split("-")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ")
        )
        .join(" · ")
    : isDocs
      ? "Documentation"
      : "Page"

  if (isDocs) {
    return {
      type: "div",
      props: {
        style: {
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "56px",
          background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)",
          color: "#e5e5e5",
          fontFamily: "Noto Sans"
        },
        children: [
          {
            type: "div",
            props: {
              style: { display: "flex", alignItems: "center" },
              children: [
                {
                  type: "span",
                  props: {
                    style: {
                      fontSize: "28px",
                      fontWeight: 700,
                      color: "#ffffff",
                      letterSpacing: "-0.02em"
                    },
                    children: "idantity.me"
                  }
                }
              ]
            }
          },
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                flexGrow: 1,
                paddingTop: "20px"
              },
              children: [
                {
                  type: "div",
                  props: {
                    style: {
                      width: "60px",
                      height: "4px",
                      backgroundColor: "#60a5fa",
                      borderRadius: "2px",
                      marginBottom: "16px"
                    }
                  }
                },
                {
                  type: "div",
                  props: {
                    style: {
                      fontSize: "52px",
                      fontWeight: 700,
                      color: "#ffffff",
                      lineHeight: 1.15,
                      maxWidth: "950px"
                    },
                    children: post.title
                  }
                },
                post.description
                  ? {
                      type: "div",
                      props: {
                        style: {
                          fontSize: "22px",
                          fontWeight: 400,
                          color: "#94a3b8",
                          marginTop: "12px",
                          lineHeight: 1.4,
                          maxWidth: "800px"
                        },
                        children: post.description
                      }
                    }
                  : null
              ].filter(Boolean)
            }
          },
          {
            type: "div",
            props: {
              style: { display: "flex", alignItems: "center", gap: "12px", marginTop: "auto" },
              children: [
                {
                  type: "div",
                  props: {
                    style: {
                      padding: "6px 16px",
                      borderRadius: "9999px",
                      backgroundColor: "rgba(96, 165, 250, 0.15)",
                      border: "1px solid rgba(96, 165, 250, 0.3)",
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#93c5fd"
                    },
                    children: typeDisplay
                  }
                }
              ]
            }
          }
        ]
      }
    }
  }

  return {
    type: "div",
    props: {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: "56px",
        backgroundColor: "#0a0a0a",
        color: "#e5e5e5",
        fontFamily: "Noto Sans"
      },
      children: [
        {
          type: "div",
          props: {
            style: { display: "flex", alignItems: "center" },
            children: [
              {
                type: "span",
                props: {
                  style: {
                    fontSize: "28px",
                    fontWeight: 700,
                    color: "#ffffff",
                    letterSpacing: "-0.02em"
                  },
                  children: "idantity.me"
                }
              }
            ]
          }
        },
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              flexGrow: 1,
              paddingTop: "24px"
            },
            children: [
              {
                type: "div",
                props: {
                  style: {
                    fontSize: "56px",
                    fontWeight: 700,
                    color: "#ffffff",
                    lineHeight: 1.15,
                    maxWidth: "950px"
                  },
                  children: post.title
                }
              },
              post.description
                ? {
                    type: "div",
                    props: {
                      style: {
                        fontSize: "24px",
                        fontWeight: 400,
                        color: "#a0a0a0",
                        marginTop: "16px",
                        lineHeight: 1.4,
                        maxWidth: "850px"
                      },
                      children: post.description
                    }
                  }
                : null
            ].filter(Boolean)
          }
        },
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: "auto"
            },
            children: [
              typeDisplay
                ? {
                    type: "div",
                    props: {
                      style: {
                        padding: "8px 20px",
                        borderRadius: "9999px",
                        border: "1px solid #333333",
                        fontSize: "16px",
                        fontWeight: 600,
                        color: "#e5e5e5"
                      },
                      children: typeDisplay
                    }
                  }
                : null,
              post.pubDate
                ? {
                    type: "div",
                    props: {
                      style: { fontSize: "16px", color: "#666666" },
                      children: post.pubDate
                    }
                  }
                : null
            ].filter(Boolean)
          }
        }
      ]
    }
  }
}

async function renderOgCard(
  post: Post,
  fonts: { regular: ArrayBuffer; bold: ArrayBuffer }
): Promise<Buffer> {
  const jsx = buildOgJsx(post)
  const svg = await satori(jsx, {
    width: 1200,
    height: 630,
    fonts: [
      { name: "Noto Sans", data: fonts.regular, weight: 400, style: "normal" },
      { name: "Noto Sans", data: fonts.bold, weight: 700, style: "normal" }
    ]
  })

  const resvg = new Resvg(svg, {
    font: { loadSystemFonts: false },
    fitTo: { mode: "width", value: 1200 }
  })

  return resvg.render().asPng()
}

async function main() {
  const posts = readPosts()

  if (posts.length === 0) {
    console.log("No posts found.")
    return
  }

  console.log(`Found ${posts.length} pages/files. Loading fonts...`)
  const fonts = await loadFonts()
  console.log("Fonts loaded. Generating OG cards with Satori & resvg-js...\n")

  mkdirSync(OUTPUT_DIR, { recursive: true })

  let generated = 0

  await Promise.all(
    posts.map(async (post, index) => {
      const outPath = join(OUTPUT_DIR, `${post.id}.png`)
      const label = `[${index + 1}/${posts.length}]`

      try {
        const pngBuffer = await renderOgCard(post, fonts)
        mkdirSync(dirname(outPath), { recursive: true })
        writeFileSync(outPath, pngBuffer)
        console.log(`${label} ${post.id}.png — done`)
        generated++
      } catch (err) {
        console.error(`${label} ${post.id}.png — failed:`, err)
      }
    })
  )

  console.log(`\nDone. Generated: ${generated}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
