import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const note = sqliteTable("note", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull().default(""),
  tags: text("tags", { mode: "json" })
    .$type<string[]>()
    .notNull()
    .$defaultFn(() => []),
  color: text("color").notNull().default("default"),
  isPinned: integer("is_pinned", { mode: "boolean" }).notNull().default(false),
  isArchived: integer("is_archived", { mode: "boolean" }).notNull().default(false),
  isTrashed: integer("is_trashed", { mode: "boolean" }).notNull().default(false),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
});

export type Note = typeof note.$inferSelect;
export type NewNote = typeof note.$inferInsert;

export const todo = sqliteTable("todo", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull().default("General"),
  priority: text("priority", { enum: ["low", "medium", "high", "urgent"] })
    .notNull()
    .default("medium"),
  isCompleted: integer("is_completed", { mode: "boolean" }).notNull().default(false),
  dueDate: integer("due_date", { mode: "timestamp" }),
  isRecurring: integer("is_recurring", { mode: "boolean" }).notNull().default(false),
  recurringInterval: text("recurring_interval", { enum: ["daily", "weekly", "monthly"] }),
  order: integer("order").notNull().default(0),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
});

export type Todo = typeof todo.$inferSelect;
export type NewTodo = typeof todo.$inferInsert;
