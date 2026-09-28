import { defineConfig } from "vite-plus"
import { fileRoutes } from "filesystem-routing/vite"
import { rimelightConfig } from "@rimelight/config/vite-plus/base"
import { cloudflare } from "@cloudflare/vite-plugin"
import solid from "@solidjs/vite-plugin"
import { ui } from "@rimelight/ui/plugin"
import { seo } from "@rimelight/seo/plugin"
import { security } from "@rimelight/security/plugin"
import { auth } from "@rimelight/auth/plugin"
import { i18n } from "@rimelight/i18n/plugin"
import { rimelightSolidConfig } from "@rimelight/config/solid"
import en from "./src/i18n/en.json"
import pt from "./src/i18n/pt.json"

const site = rimelightSolidConfig({
  domain: "idantity.me",
  security: {
    connectSrc: ["https://challenges.cloudflare.com"]
  }
})

export default defineConfig({
  ...rimelightConfig(),
  plugins: [
    cloudflare({
      viteEnvironment: {
        name: "ssr"
      }
    }),

    solid({
      start: {
        devtools: false
      },
      ssr: true,
      extensions: [".jsx", ".tsx"]
    }),

    fileRoutes({ types: true }),

    ui({
      logos: {
        logomark: {
          color: "https://cdn.idantity.me/logos/logomark_color.svg",
          white: "https://cdn.idantity.me/logos/logomark_white.svg",
          black: "https://cdn.idantity.me/logos/logomark_black.svg"
        },
        logotype: {
          color: "https://cdn.idantity.me/logos/logotype_color.svg",
          white: "https://cdn.idantity.me/logos/logotype_white.svg",
          black: "https://cdn.idantity.me/logos/logotype_black.svg"
        }
      }
    }),

    seo({
      id: "idantity.me",
      url: "https://idantity.me",
      name: "idantity",
      description: "Welcome to my website!",
      author: "Daniel Marchi",
      email: "daniel@idantity.me",
      branding: {
        logo: { alt: "idantity" },
        favicon: { svg: "https://cdn.idantity.me/logos/logomark_color.svg" },
        appleTouchIcon: "https://cdn.idantity.me/logos/logomark_color.svg",
        colors: { themeColor: "#ffffff", backgroundColor: "#ffffff" }
      },
      titleTemplate: "%s | idantity",
      locales: { en: "en-US", pt: "pt-BR" },
      privatePathPrefixes: [
        "/dashboard",
        "/admin",
        "/cms",
        "/internal",
        "/api",
        "/dev",
        "/og",
        "/open-graph",
        "/auth",
        "/cdn-cgi"
      ]
    }),

    security(site.securityOptions ?? {}),

    auth(),

    i18n({
      locales: ["en", "pt"],
      defaultLocale: "en",
      translations: { en, pt }
    })
  ]
})
