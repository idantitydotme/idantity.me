import { jsonb, pgTable, timestamp, uuid } from "drizzle-orm/pg-core"
import { user } from "../auth"

export type Habit = {
  id: string // uuid
  name: string
  completedDates: string[] // ISO date strings YYYY-MM-DD
}

export type HabitCategory = {
  id: string
  name: string
  habits: Habit[]
}

export type HabitTrackerData = {
  years: {
    year: number
    categories: HabitCategory[]
  }[]
}

export const habits = pgTable("habits", {
  id: uuid("id").defaultRandom().notNull().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  data: jsonb("data").$type<HabitTrackerData>().default({ years: [] }).notNull(),
  updatedAt: timestamp("updated_at", {
    withTimezone: true
  }).$onUpdate(() => new Date()),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true })
})

export type HabitTracker = typeof habits.$inferSelect
