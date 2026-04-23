import { sequence } from "astro:middleware"
import { sri, security } from "@rimelight/ui/middleware"

export const onRequest = sequence(security, sri)
