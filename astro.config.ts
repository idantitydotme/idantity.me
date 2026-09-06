import en from "./src/translations/en.json"
import pt from "./src/translations/pt.json"
import solid from "@astrojs/solid-js"
import { ui } from "@rimelight/ui"
import { security } from "@rimelight/security"
import cloudflare from "@astrojs/cloudflare"
import { i18n } from "@rimelight/i18n"
import { rimelightCms } from "@rimelight/cms/integration"
import { r2 } from "@rimelight/cms/storage"
import { defineConfig, fontProviders } from "astro/config"
import { cacheCloudflare } from "@astrojs/cloudflare/cache"

export default defineConfig({
  site: "https://idantity.me",
  prefetch: {
    prefetchAll: true
  },

  output: "server",
  session: false,
  adapter: cloudflare(),
  cache: {
    provider: cacheCloudflare()
  },
  routeRules: {
    "/api/[...path]": {
      swr: 600 // 10 minutes stale-while-revalidate
    },
    "/[...path]": {
      maxAge: 300 // 5 minutes cache
    }
  },

  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: "Noto Sans",
      cssVariable: "--font-sans",
      fallbacks: ["sans-serif"]
    },
    {
      provider: fontProviders.fontsource(),
      name: "Noto Serif",
      cssVariable: "--font-serif",
      fallbacks: ["serif"]
    },
    {
      provider: fontProviders.fontsource(),
      name: "JetBrains Mono",
      cssVariable: "--font-mono",
      fallbacks: ["monospace"]
    }
  ],

  image: {
    domains: ["idantity.me", "cdn.idantity.me"],
    layout: "constrained",
    responsiveStyles: true
  },

  markdown: {
    syntaxHighlight: "prism"
  },

  integrations: [
    solid({
      include: ["**/solid/**", "**/*.tsx"]
    }),
    rimelightCms({
      storage: r2({
        binding: "BLOB"
      })
    })
  ],

  vite: {
    plugins: [
      security(),
      i18n({
        locales: ["en", "pt"],
        defaultLocale: "en",
        prefixDefaultLocale: true,
        translations: { en, pt },
        kvBinding: "idantity-dot-me_translations"
      }),
      ui({
        logos: {
          logomark: {
            color: "./src/assets/logos/logomark_color.svg",
            white: "./src/assets/logos/logomark_white.svg",
            black: "./src/assets/logos/logomark_black.svg"
          },
          logotype: {
            color: "./src/assets/logos/logotype_color.svg",
            white: "./src/assets/logos/logotype_color.svg",
            black: "./src/assets/logos/logotype_black.svg"
          }
        }
      })
    ]
  }
})
