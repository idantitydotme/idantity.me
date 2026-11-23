import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export type Habit = {
  id: string;
  name: string;
  completedDates: string[]; // ISO date strings YYYY-MM-DD
};

export type HabitCategory = {
  id: string;
  name: string;
  habits: Habit[];
};

export type HabitTrackerData = {
  years: {
    year: number;
    categories: HabitCategory[];
  }[];
};

export const habits = sqliteTable("habits", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  data: text("data", { mode: "json" })
    .$type<HabitTrackerData>()
    .notNull()
    .$defaultFn(() => ({ years: [] })),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
});

export type HabitTracker = typeof habits.$inferSelect;
export type NewHabitTracker = typeof habits.$inferInsert;
