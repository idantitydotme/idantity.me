import type { SiteConfig } from "@rimelight/ui/config"

export const siteConfig: SiteConfig = {
  id: "idantity.me",
  name: "idantity",
  description: "Welcome to my website!",
  url: "https://idantity.me",
  ogImage: "/og/placeholder.webp",
  author: "idantity",
  email: "",
  branding: {
    logo: {
      alt: "idantity"
    },
    favicon: {
      svg: "/favicon.svg"
    },
    colors: {
      themeColor: "#ffffff",
      backgroundColor: "#ffffff"
    }
  },
  seo: {
    titleTemplate: "%s | idantity",
    ogImageFallback: "/og/placeholder.webp",
    maxDescriptionLength: 160
  }
}
