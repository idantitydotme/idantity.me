import { defineConfig } from "vite-plus"
import { rimelightConfig } from "@rimelight/config/vite-plus/base"

export default defineConfig({
  ...rimelightConfig(),
  run: {
    cache: true,
    tasks: {
      "audit": {
        command: "pnpm audit --audit-level=moderate"
      },
      "typegen": {
        command: "wrangler types",
        input: [{ auto: true }, "!worker-configuration.d.ts"]
      },
      "check:vp": {
        command: "vp check --fix"
      },
      "check": {
        dependsOn: ["audit", "typegen", "check:vp"],
        command: "astro check",
        input: [{ auto: true }, "!.wrangler/**", "!.astro/**"]
      },
      "fix": {
        command: "pnpm audit fix && vp check --fix"
      }
    }
  }
})
