import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const notebook = sqliteTable("notebook", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  color: text("color").notNull().default("neutral"),
  isPinned: integer("is_pinned", { mode: "boolean" }).notNull().default(false),
  isArchived: integer("is_archived", { mode: "boolean" }).notNull().default(false),
  isTrashed: integer("is_trashed", { mode: "boolean" }).notNull().default(false),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
});

export type Notebook = typeof notebook.$inferSelect;
export type NewNotebook = typeof notebook.$inferInsert;

export const notebookEntry = sqliteTable("notebook_entry", {
  id: text("id").primaryKey(),
  notebookId: text("notebook_id").notNull(),
  userId: text("user_id").notNull(),
  content: text("content").notNull().default(""),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export type NotebookEntry = typeof notebookEntry.$inferSelect;
export type NewNotebookEntry = typeof notebookEntry.$inferInsert;
