import { sequence } from "astro:middleware"
import { security } from "@rimelight/ui/middleware"
import { construction } from "@/middleware/construction"
import { auth } from "@/middleware/auth"

export const onRequest = sequence(security, construction, auth)
