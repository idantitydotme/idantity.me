import { sequence } from "astro:middleware"
import { security } from "@rimelight/ui/middleware"

export const onRequest = sequence(security)
