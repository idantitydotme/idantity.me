import { visualizer } from "rollup-plugin-visualizer"
import sitemap from "@astrojs/sitemap"
import starlight from "@astrojs/starlight"
import { ui } from "@rimelight/ui/integrations"
import { sri } from "@rimelight/ui/integrations"
import { starlightAddons } from "@rimelight/ui/plugins"
import { defineConfig, fontProviders, memoryCache, svgoOptimizer } from "astro/config"

import cloudflare from "@astrojs/cloudflare"

export default defineConfig({
  experimental: {
    contentIntellisense: true,
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
    svgOptimizer: svgoOptimizer({
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
    })
  },

  vite: {
    plugins: [
      visualizer({
        emitFile: true,
        filename: "stats.html"
      })
    ]
  },

  site: "https://idantity.me",
  prefetch: {
    prefetchAll: true
  },

  output: "server",
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
  },

  i18n: {
    locales: ["en", "pt"],
    defaultLocale: "en",
    routing: {
      prefixDefaultLocale: true,
      redirectToDefaultLocale: true
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

  markdown: {
    syntaxHighlight: "prism"
  },

  integrations: [
    sitemap({
      i18n: {
        defaultLocale: "en",
        locales: {
          en: "en-US",
          pt: "pt-BR"
        }
      }
    }),
    starlight({
      customCss: ["./src/styles/starlight.css"],
      plugins: [starlightAddons()],
      //TODO Temporarily true while issue gets resolved: https://github.com/withastro/starlight/issues/3859
      // prerender: false,
      lastUpdated: true,
      disable404Route: true,
      title: {
        en: "Website Docs"
      },
      description: "Rimelight Entertainment Documentation",
      social: [
        { icon: "github", label: "GitHub", href: "https://github.com/Rimelight-Entertainment" }
      ],
      sidebar: [
        { label: "Home", link: "/docs/" },
        {
          label: "Documentation",
          items: [{ autogenerate: { directory: "docs" } }]
        }
      ]
    }),

    ui({
      logos: {
        logomark: "/favicon.svg"
      }
    }),

    sri()
  ]
})
