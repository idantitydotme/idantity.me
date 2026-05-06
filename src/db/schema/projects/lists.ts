import { pgTable, text, integer, timestamp, uuid } from "drizzle-orm/pg-core"
import { board } from "./boards"
import { relations } from "drizzle-orm"
import { card } from "./cards"

export const list = pgTable("kanban_list", {
  id: uuid("id").defaultRandom().notNull().primaryKey(),
  boardId: uuid("board_id")
    .notNull()
    .references(() => board.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  order: integer("order").notNull().default(0),
  updatedAt: timestamp("updated_at", {
    withTimezone: true
  }).$onUpdate(() => new Date()),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true })
})

export type List = typeof list.$inferSelect

export const listRelations = relations(list, ({ one, many }) => ({
  board: one(board, {
    fields: [list.boardId],
    references: [board.id]
  }),
  cards: many(card)
}))
