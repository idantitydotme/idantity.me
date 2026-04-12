import mdx from "@astrojs/mdx"
import sitemap from "@astrojs/sitemap"
import { defineConfig, fontProviders, memoryCache } from "astro/config"

import cloudflare from "@astrojs/cloudflare"

export default defineConfig({
  experimental: {
    contentIntellisense: true,
    rustCompiler: true,
    queuedRendering: {
      enabled: true,
      contentCache: true
    },
    cache: {
      provider: memoryCache()
    },
    routeRules: {
      "/api/[...path]": {
        swr: 600 // 10 minutes stale-while-revalidate
      },
      "/[...path]": {
        maxAge: 300 // 5 minutes cache
      }
    },
    clientPrerender: true,
    svgo: {
      plugins: [
        "preset-default",
        "removeXMLNS",
        {
          name: "removeXlink",
          params: {
            includeLegacy: true
          }
        }
      ]
    }
  },

  site: "https://example.com",
  integrations: [mdx(), sitemap()],

  fonts: [
    {
      provider: fontProviders.local(),
      name: "Atkinson",
      cssVariable: "--font-atkinson",
      fallbacks: ["sans-serif"],
      options: {
        variants: [
          {
            src: ["./src/assets/fonts/atkinson-regular.woff"],
            weight: 400,
            style: "normal",
            display: "swap"
          },
          {
            src: ["./src/assets/fonts/atkinson-bold.woff"],
            weight: 700,
            style: "normal",
            display: "swap"
          }
        ]
      }
    }
  ],

  adapter: cloudflare()
})
