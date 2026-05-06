import { relations } from "drizzle-orm"
import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"
import { user } from "../auth"
import { customFieldDefinition } from "./custom_fields"
import { list } from "./lists"

export const board = pgTable("kanban_board", {
  id: uuid("id").defaultRandom().notNull().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  isArchived: boolean("is_archived").default(false).notNull(),
  updatedAt: timestamp("updated_at", {
    withTimezone: true
  }).$onUpdate(() => new Date()),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true })
})

export type Board = typeof board.$inferSelect

export const boardRelations = relations(board, ({ many }) => ({
  lists: many(list),
  customFields: many(customFieldDefinition)
}))
