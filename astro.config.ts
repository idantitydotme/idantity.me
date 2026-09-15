import { defineConfig } from "astro/config"
import { rimelightAstroConfig } from "@rimelight/config/astro"

export default defineConfig(
  rimelightAstroConfig({
    domain: "idantity.me",
    solid: true,
    cms: true,
    security: true,
    i18n: true,
    ui: {
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
      },
      shortcuts: {
        categories: {
          system: { label: "System" },
          navigation: { label: "Navigation" }
        }
      }
    }
  })
)
