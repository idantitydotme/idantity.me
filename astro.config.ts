import { defineConfig } from "astro/config"
import { rimelightAstroConfig } from "@rimelight/config/astro"

export default defineConfig(
  rimelightAstroConfig({
    domain: "idantity.me",
    seo: {
      name: "idantity",
      description: "Welcome to my website!",
      author: "idantity",
      branding: {
        logo: {
          alt: "idantity"
        },
        colors: {
          themeColor: "#ffffff",
          backgroundColor: "#ffffff"
        }
      },
      titleTemplate: "%s | idantity",
      locales: {
        en: "en-US",
        pt: "pt-BR"
      },
      privatePathPrefixes: [
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
    },
    solid: true,
    cms: true,
    security: true,
    i18n: {
      locales: ["en", "es"],
      defaultLocale: "en"
    },
    ui: true
  })
)
