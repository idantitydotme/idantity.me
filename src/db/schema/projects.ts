import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const board = sqliteTable("kanban_board", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  isArchived: integer("is_archived", { mode: "boolean" }).notNull().default(false),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
});

export type Board = typeof board.$inferSelect;
export type NewBoard = typeof board.$inferInsert;

export const list = sqliteTable("kanban_list", {
  id: text("id").primaryKey(),
  boardId: text("board_id")
    .notNull()
    .references(() => board.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  order: integer("order").notNull().default(0),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
});

export type List = typeof list.$inferSelect;
export type NewList = typeof list.$inferInsert;

export const card = sqliteTable("kanban_card", {
  id: text("id").primaryKey(),
  listId: text("list_id")
    .notNull()
    .references(() => list.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  order: integer("order").notNull().default(0),
  dueDate: integer("due_date", { mode: "timestamp" }),
  customFields: text("custom_fields", { mode: "json" })
    .$type<Record<string, unknown>>()
    .notNull()
    .$defaultFn(() => ({})),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
});

export type Card = typeof card.$inferSelect;
export type NewCard = typeof card.$inferInsert;

export const customFieldDefinition = sqliteTable("kanban_custom_field", {
  id: text("id").primaryKey(),
  boardId: text("board_id")
    .notNull()
    .references(() => board.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: text("type", { enum: ["TEXT", "NUMBER", "DATE", "SELECT", "CHECKBOX", "URL"] }).notNull(),
  options: text("options", { mode: "json" })
    .$type<{ label: string; value: string; color?: string }[]>()
    .notNull()
    .$defaultFn(() => []),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
});

export type CustomFieldDefinition = typeof customFieldDefinition.$inferSelect;
export type NewCustomFieldDefinition = typeof customFieldDefinition.$inferInsert;
