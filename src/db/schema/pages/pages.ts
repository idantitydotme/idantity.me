import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"
// Commented out to prevent breaking compilation until ported from older package
// import {
//   type Block,
//   type Localized,
//   type PageType,
//   type RegisterPageTypes
// } from "rimelight-components/types"

type Block = any
type Localized<_T = string> = any
type PageType = any
type RegisterPageTypes = any

export const pages = pgTable("pages", {
  id: uuid("id").defaultRandom().notNull().primaryKey(),
  slug: text("slug").notNull().unique(),
  type: text("type").$type<PageType>().notNull(),
  title: jsonb("title").$type<Localized>().notNull(),
  description: jsonb("description").$type<Localized>(),
  tags: jsonb("tags").$type<Localized[]>().default([]).notNull(),
  authorIds: jsonb("author_ids").$type<string[]>().default([]),
  content: jsonb("content")
    .$type<{
      blocks: Block[]
      properties: RegisterPageTypes[PageType]
    }>()
    .notNull(),
  postedAt: timestamp("posted_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", {
    withTimezone: true
  }).$onUpdate(() => new Date()),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true })
})
