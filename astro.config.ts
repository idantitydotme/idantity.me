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
        favicon: {
          svg: "https://cdn.idantity.me/logos/logomark_color.svg"
        },
        appleTouchIcon: "https://cdn.idantity.me/logos/logomark_color.svg",
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
    auth: true,
    security: true,
    i18n: {
      locales: ["en", "pt"],
      defaultLocale: "en"
    },
    ui: {
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
    }
  })
)
