import { defineConfig } from "vite-plus";
import { cloudflare } from "@cloudflare/vite-plugin";
import solid from "@solidjs/vite-plugin";
import { r2 } from "@rimelight/cms/storage";
import { fileRoutes } from "filesystem-routing/vite";
import { seo } from "@rimelight/seo/plugin";
import { security } from "@rimelight/security/plugin";
import { auth } from "@rimelight/auth/plugin";
import { i18n } from "@rimelight/i18n/plugin";
import { ui } from "@rimelight/ui/plugin";
import { cms } from "@rimelight/cms/plugin";

export default defineConfig({
  lint: {
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  staged: {
    "{package.json,pnpm-workspace.yaml,pnpm-lock.yaml}": () => "pnpm audit",
    "*": "vp check --fix",
  },
  builder: { sharedPlugins: true },
  plugins: [
    cloudflare(),

    solid({
      start: true,
      ssr: true,
      serverFunctions: true,
    }),

    fileRoutes({ types: ".cloudflare/types/file-routes.d.ts" }),

    seo({
      id: "idantity.me",
      url: "https://idantity.me",
      name: "idantity",
      description: "Welcome to my website!",
      author: "Daniel Marchi",
      email: "daniel@idantity.me",
      branding: {
        logo: { alt: "idantity" },
        favicon: {
          svg: "https://cdn.idantity.me/images/branding/logo/logomark/color/svg/idantity.me%20-%20Logomark%20-%20Color.svg",
        },
        appleTouchIcon:
          "https://cdn.idantity.me/images/branding/logo/logomark/color/png/idantity.me%20-%20Logomark%20-%20Color.png",
        colors: { themeColor: "#ffffff", backgroundColor: "#ffffff" },
      },
      titleTemplate: "%s | idantity",
      og: {
        routes: {
          "*/blog/*": "./src/components/og/BlogOgCard.tsx",
        },
      },
    }),

    security({
      domain: "idantity.me",
    }),

    auth(),

    i18n(),

    ui({
      // Heading classes come from the page-section override below; safelist them so UnoCSS emits them.
      unocss: {
        safelist: ["!text-[60px]", "sm:!text-[96px]"],
      },
      colors: {
        primary: [0.19, 248],
        secondary: [0.17, 66],
      },
      fonts: {
        fonts: {
          sans: [
            {
              name: "Chakra Petch",
              weights: [400, 500, 600, 700],
              subsets: ["latin", "latin-ext"],
            },
          ],
        },
      },
      components: {
        themes: {
          "page-section": {
            variants: {
              layout: {
                default: {
                  title: "!text-[60px] sm:!text-[96px] tracking-tight",
                },
                cta: {
                  title: "!text-[60px] sm:!text-[96px] tracking-tight",
                },
              },
            },
          },
        },
      },
      logos: {
        logomark: {
          color:
            "https://cdn.idantity.me/images/branding/logo/logomark/color/svg/idantity.me%20-%20Logomark%20-%20Color.svg",
          white:
            "https://cdn.idantity.me/images/branding/logo/logomark/monochrome%20white/svg/idantity.me%20-%20Logomark%20-%20Monochrome%20White.svg",
          black:
            "https://cdn.idantity.me/images/branding/logo/logomark/monochrome%20black/svg/idantity.me%20-%20Logomark%20-%20Monochrome%20Black.svg",
        },
        logotype: {
          color:
            "https://cdn.idantity.me/images/branding/logo/logotype/color/svg/idantity.me%20-%20Logotype%20-%20Color.svg",
          white:
            "https://cdn.idantity.me/images/branding/logo/logotype/monochrome%20white/svg/idantity.me%20-%20Logotype%20-%20Monochrome%20White.svg",
          black:
            "https://cdn.idantity.me/images/branding/logo/logotype/monochrome%20black/svg/idantity.me%20-%20Logotype%20-%20Monochrome%20Black.svg",
        },
      },
    }),

    cms({
      autoMigrate: true,
      devBypassAuth: true,
      storage: r2({ publicUrl: "https://cdn.idantity.me" }),
    }),
  ],
});
