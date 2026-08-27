import { pgTable, text, timestamp, unique, customType } from "drizzle-orm/pg-core"

const tsvector = customType<{ data: string; notNull: true; default: true }>({
  dataType() {
    return "tsvector"
  }
})

export const searchIndex = pgTable(
  "search_index",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    sourceType: text("source_type").notNull(),
    sourceId: text("source_id").notNull(),
    title: text("title").notNull(),
    url: text("url").notNull(),
    bodyContent: text("body_content").notNull(),
    searchableText: text("searchable_text").notNull(),
    searchVector: tsvector("search_vector").notNull(),
    updatedAt: timestamp("updated_at")
      .$defaultFn(() => new Date())
      .notNull()
  },
  (t) => [unique("search_index_source_type_source_id_key").on(t.sourceType, t.sourceId)]
)

export type SearchIndex = typeof searchIndex.$inferSelect
export type NewSearchIndex = typeof searchIndex.$inferInsert
