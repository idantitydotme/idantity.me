import { Hono } from "hono"
import { db } from "@/db"
import { pages } from "@/db/schema"
import { sql, desc, like, inArray, asc, isNull } from "drizzle-orm"
import type { PageType } from "@/types/pages"

const isPageType = (_t: string): _t is PageType => true
const api = new Hono()

api.get("/", async (c) => {
  try {
    const type = c.req.query("type")
    const statusInput = c.req.query("status")
    const status = statusInput === "published" || statusInput === "draft" ? statusInput : undefined
    const limitVal = Math.max(1, parseInt(c.req.query("limit") || "50") || 50)
    const offsetVal = Math.max(0, parseInt(c.req.query("offset") || "0") || 0)
    const orderByVal = c.req.query("orderBy") || "postedAt"
    const orderVal = c.req.query("order") || "desc"

    const conditions = [isNull(pages.deletedAt)]
    if (type) conditions.push(sql`LOWER(${pages.type}) = LOWER(${type})`)
    if (status === "published") conditions.push(sql`${pages.postedAt} IS NOT NULL`)
    else if (status === "draft") conditions.push(sql`${pages.postedAt} IS NULL`)

    const orderFn = orderVal === "asc" ? asc : desc
    const orderColumn =
      orderByVal === "title"
        ? pages.title
        : orderByVal === "createdAt"
          ? pages.createdAt
          : pages.postedAt

    const results = await db
      .select()
      .from(pages)
      .where(sql`${conditions.join(" AND ")}`)
      .orderBy(orderFn(orderColumn))
      .limit(limitVal)
      .offset(offsetVal)

    return c.json(
      results.map((row) => ({
        ...row,
        blocks: row.content?.blocks || [],
        properties: row.content?.properties || {}
      }))
    )
  } catch (err: any) {
    return c.json({ error: err.message }, 500)
  }
})

api.get("/list", async (c) => {
  try {
    const typesParam = c.req.query("types")
    const prefix = c.req.query("prefix")

    const conditions = [isNull(pages.deletedAt)]
    if (prefix) conditions.push(like(pages.slug, `${prefix}%`))
    if (typesParam) {
      const typesList = typesParam.split(",").filter(Boolean).filter(isPageType)
      if (typesList.length > 0) conditions.push(inArray(pages.type, typesList))
    }

    const results = await db
      .select({ id: pages.id, title: pages.title, slug: pages.slug, type: pages.type })
      .from(pages)
      .where(sql`${conditions.join(" AND ")}`)
      .orderBy(asc(pages.slug))
    return c.json(results)
  } catch (err: any) {
    return c.json({ error: err.message }, 500)
  }
})

export default api
