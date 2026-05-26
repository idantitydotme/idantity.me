import type { PropMeta, ThemeMeta } from "./types"

export function kebabToPascal(name: string): string {
  return name
    .split("-")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join("")
}

export function filterProps(
  props: PropMeta[],
  options: { hide?: string[]; show?: string[] }
): PropMeta[] {
  if (options.show?.length) {
    return props.filter((p) => options.show!.includes(p.name))
  }
  if (options.hide?.length) {
    return props.filter((p) => !options.hide!.includes(p.name))
  }
  return props
}

export function generateThemeCode(componentName: string, theme: ThemeMeta): string {
  const componentConfig: Record<string, unknown> = {
    ...(theme.slots.length ? { slots: theme.slots } : {}),
    ...(Object.keys(theme.base).length ? { base: theme.base } : {}),
    ...(Object.keys(theme.variants).length ? { variants: theme.variants } : {}),
    ...(theme.compoundVariants.length ? { compoundVariants: theme.compoundVariants } : {}),
    ...(Object.keys(theme.defaultVariants).length ? { defaultVariants: theme.defaultVariants } : {})
  }

  return `// astro.config.ts
import { ui } from "@rimelight/ui"
import { defineConfig } from "astro/config"

export default defineConfig({
  integrations: [
    ui({
      components: {
        ${componentName}: ${JSON.stringify(componentConfig, null, 6).replace(/\n/g, "\n        ")}
      }
    })
  ]
})`
}
