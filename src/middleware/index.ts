import { sequence } from "astro:middleware"
import { security } from "@rimelight/ui/middleware"
import { auth } from "@/middleware/auth"

export const onRequest = sequence(security, auth)
