import { pgTable, text, integer, timestamp, jsonb, uuid } from "drizzle-orm/pg-core"
import { list } from "./lists"
import { relations } from "drizzle-orm"

export const card = pgTable("kanban_card", {
  id: uuid("id").defaultRandom().notNull().primaryKey(),
  listId: uuid("list_id")
    .notNull()
    .references(() => list.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  order: integer("order").notNull().default(0),
  dueDate: timestamp("due_date"),
  customFields: jsonb("custom_fields").$type<Record<string, any>>().default({}),
  updatedAt: timestamp("updated_at", {
    withTimezone: true
  }).$onUpdate(() => new Date()),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true })
})

export type Card = typeof card.$inferSelect

export const cardRelations = relations(card, ({ one }) => ({
  list: one(list, {
    fields: [card.listId],
    references: [list.id]
  })
}))
