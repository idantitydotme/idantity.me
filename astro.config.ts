import mdx from "@astrojs/mdx"
import sitemap from "@astrojs/sitemap"
import vue from "@astrojs/vue"
import ui from "@nuxt/ui/vite"
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

  integrations: [mdx(), sitemap(), vue({ appEntrypoint: "/src/_app" })],

  vite: {
    plugins: [ui()]
  },

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

  adapter: cloudflare(),

  security: {
    checkOrigin: true,
    allowedDomains: [
      {
        hostname: "**.idantity.me",
        protocol: "https"
      }
    ],
    csp: {
      algorithm: "SHA-384",
      directives: [
        "default-src 'none'",
        "img-src 'self' https://cdn.idantity.me https://i3.ytimg.com https://www.youtube.com https://www.youtube-nocookie.com",
        "font-src 'self'",
        "connect-src 'self'",
        "frame-ancestors 'none'",
        "frame-src https://www.youtube.com https://www.youtube-nocookie.com https://challenges.cloudflare.com",
        "upgrade-insecure-requests",
        "base-uri 'self'",
        "form-action 'self'"
      ],
      scriptDirective: {
        resources: [
          "'self'",
          "https://challenges.cloudflare.com",
          "https://betterlytics.io/analytics.js"
        ]
      },
      styleDirective: {
        resources: ["'self'"]
      }
    }
  }
})
