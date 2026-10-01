import type { ParentProps } from "solid-js";
import { HydrationScript, NoHydration } from "@solidjs/web";
import { createUiHead } from "@rimelight/ui/head";
import { createSecurityHead } from "@rimelight/security/head";
import { createSeoHead } from "@rimelight/seo/head";
import "virtual:uno.css";

import manifest from "virtual:solid-manifest";

const seoHead = createSeoHead();
const securityHead = createSecurityHead();
const uiHead = createUiHead();

// Extract entry stylesheets from the client manifest
const entryStyles: { tag: "link"; props: { rel: string; href: string } }[] = [];
if (manifest && typeof manifest === "object") {
  for (const key of Object.keys(manifest)) {
    const chunk = manifest[key];
    if (chunk?.isEntry && Array.isArray(chunk.css)) {
      for (const cssFile of chunk.css) {
        const href = cssFile.startsWith("/") ? cssFile : `/${cssFile}`;
        entryStyles.push({ tag: "link", props: { rel: "stylesheet", href } });
      }
    }
  }
}

const headTags = [...entryStyles, ...seoHead.tags, ...securityHead.tags, ...uiHead.tags];

export default function Document(props: ParentProps) {
  return (
    <html lang="en">
      <head>
        <NoHydration>
          {headTags.map((tag) => {
            if (tag.tag === "title") {
              return <title>{tag.children}</title>;
            }
            if (tag.tag === "meta") {
              const p = tag.props as Record<string, string | undefined>;
              return (
                <meta
                  charset={p["charset"]}
                  name={p["name"]}
                  property={p["property"]}
                  http-equiv={p["http-equiv"] as "refresh" | undefined}
                  media={p["media"]}
                  content={p["content"]}
                />
              );
            }
            if (tag.tag === "link") {
              return <link {...tag.props} />;
            }
            if (tag.tag === "style") {
              return <style nonce={tag.props?.nonce}>{tag.children}</style>;
            }
            if (tag.tag === "script") {
              return (
                <script type={tag.props?.type} nonce={tag.props?.nonce}>
                  {tag.children}
                </script>
              );
            }
            return null;
          })}
        </NoHydration>
        <HydrationScript />
      </head>
      <body>{props.children}</body>
    </html>
  );
}
