import type { ParentProps } from "solid-js";
import { HydrationScript, useHead } from "@solidjs/web";
import { createSeoHead } from "@rimelight/seo/head";
import { getCurrentLocale } from "@rimelight/i18n";
import "virtual:uno.css";

export default function Document(props: ParentProps) {
  useHead(createSeoHead());

  return (
    <html lang={getCurrentLocale()}>
      <head>
        <HydrationScript />
        <link rel="preconnect" href="https://challenges.cloudflare.com" />
        <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
      </head>
      <body>{props.children}</body>
    </html>
  );
}
