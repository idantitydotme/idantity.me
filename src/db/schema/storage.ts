import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const items = sqliteTable("items", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  content: text("content"),
  category: text("category").default("general"),
  status: text("status").default("active"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const storageFiles = sqliteTable("storage_files", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  key: text("key").notNull().unique(),
  filename: text("filename").notNull(),
  url: text("url"),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  uploadedAt: integer("uploaded_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export { storageFiles as files };
