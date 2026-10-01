import { defineConfig } from "vite-plus";
import { fileRoutes } from "filesystem-routing/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import solid from "@solidjs/vite-plugin";
import { ui } from "@rimelight/ui/plugin";
import { seo } from "@rimelight/seo/plugin";
import { security } from "@rimelight/security/plugin";
import { auth } from "@rimelight/auth/plugin";
import { i18n } from "@rimelight/i18n/plugin";
import en from "./src/i18n/en.json";
import pt from "./src/i18n/pt.json";

export default defineConfig({
  lint: {
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  staged: {
    "*": "vp check --fix",
  },
  plugins: [
    solid({
      start: {
        devtools: false,
      },
      ssr: true,
      extensions: [".jsx", ".tsx"],
    }),

    cloudflare({
      viteEnvironment: {
        name: "ssr",
      },
      experimental: {
        newConfig: true,
      },
    }),

    fileRoutes({ types: true, codeSplitting: false }),

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

    auth(),

    i18n({
      locales: ["en", "pt"],
      defaultLocale: "en",
      translations: { en, pt },
    }),
  ],
});
