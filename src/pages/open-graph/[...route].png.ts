import type { APIRoute } from "astro"
import { render } from "takumi-js"

export const prerender = true

export async function getStaticPaths() {
  const paths = [
    {
      params: { route: "page" },
      props: {
        title: "Daniel Marchi",
        description: "idantity.me",
        type: "Page"
      },
      cacheKey: "static-page"
    },
    {
      params: { route: "default" },
      props: {
        title: "Daniel Marchi",
        description: "idantity.me",
        type: "Portfolio"
      },
      cacheKey: "static-default"
    },
    {
      params: { route: "forum-default" },
      props: {
        title: "Daniel Marchi",
        description: "Discussions & Community",
        type: "Community"
      },
      cacheKey: "static-forum"
    }
  ]
  return paths
}

let fontCache: { regular: ArrayBuffer; bold: ArrayBuffer } | null = null

async function getFonts(): Promise<{ regular: ArrayBuffer; bold: ArrayBuffer }> {
  if (fontCache) return fontCache
  const [regular, bold] = await Promise.all([
    fetch("https://cdn.jsdelivr.net/fontsource/fonts/noto-sans@latest/latin-400-normal.ttf").then(
      (r) => r.arrayBuffer()
    ),
    fetch("https://cdn.jsdelivr.net/fontsource/fonts/noto-sans@latest/latin-700-normal.ttf").then(
      (r) => r.arrayBuffer()
    )
  ])
  fontCache = { regular, bold }
  return fontCache
}

function buildOgJsx(title: string, description: string, typeDisplay: string, pubDate: string): any {
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
                  children: title
                }
              },
              description
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
                      children: description
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
              pubDate
                ? {
                    type: "div",
                    props: {
                      style: { fontSize: "16px", color: "#666666" },
                      children: pubDate
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

interface OgProps {
  title?: string
  description?: string
  type?: string
  pubDate?: string
}

export const GET: APIRoute<OgProps> = async ({ request, params, props }) => {
  const url = new URL(request.url)
  const routeParam = params.route ?? ""

  const title = props.title || url.searchParams.get("title") || routeParam || "Daniel Marchi"
  const description = props.description || url.searchParams.get("description") || ""
  const type = props.type || url.searchParams.get("type") || ""
  const pubDate = props.pubDate || url.searchParams.get("pubDate") || ""

  const jsx = buildOgJsx(title, description, type, pubDate)
  const { regular, bold } = await getFonts()

  const pngBuffer = await render(jsx, {
    width: 1200,
    height: 630,
    fonts: [
      { name: "Noto Sans", data: regular, weight: 400, style: "normal" },
      { name: "Noto Sans", data: bold, weight: 700, style: "normal" }
    ]
  })

  return new Response(new Blob([new Uint8Array(pngBuffer)], { type: "image/png" }), {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
      "CDN-Cache-Control": "public, max-age=31536000"
    }
  })
}
