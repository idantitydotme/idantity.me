import { defineConfig } from "vite-plus";
import { cloudflare } from "@cloudflare/vite-plugin";
import solid from "@solidjs/vite-plugin";
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
  plugins: [
    cloudflare({
      viteEnvironment: {
        name: "ssr",
      },
      experimental: {
        newConfig: true,
      },
    }),

    solid({
      start: true,
      ssr: true,
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
        favicon: { svg: "https://cdn.idantity.me/logos/logomark_color.svg" },
        appleTouchIcon: "https://cdn.idantity.me/logos/logomark_color.svg",
        colors: { themeColor: "#ffffff", backgroundColor: "#ffffff" },
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
        "/cdn-cgi",
      ],
    }),

    security({
      domain: "idantity.me",
      connectSrc: ["https://challenges.cloudflare.com"],
    }),

    auth({
      roleGuards: {
        "/admin": ["admin", "owner"],
      },
    }),

    i18n(),

    ui({
      logos: {
        logomark: {
          color: "https://cdn.idantity.me/logos/logomark_color.svg",
          white: "https://cdn.idantity.me/logos/logomark_white.svg",
          black: "https://cdn.idantity.me/logos/logomark_black.svg",
        },
        logotype: {
          color: "https://cdn.idantity.me/logos/logotype_color.svg",
          white: "https://cdn.idantity.me/logos/logotype_white.svg",
          black: "https://cdn.idantity.me/logos/logotype_black.svg",
        },
      },
    }),

    cms(),
  ],
});
