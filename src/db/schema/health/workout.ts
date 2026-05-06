import { jsonb, pgTable, timestamp, uuid } from "drizzle-orm/pg-core"
import { user } from "../auth"

export type WorkoutSet = {
  id: string
  kg: number | string // Allow string for flexible input or empty state
  reps: number | string
  restTimer: number // in seconds
}

export type WorkoutExercise = {
  id: string
  name: string
  notes: string
  sets: WorkoutSet[]
}

export type WorkoutStretch = {
  id: string
  name: string
  duration: number // in seconds
}

export type WorkoutExerciseCategory = {
  id: string
  name: string
  items: WorkoutExercise[]
}

export type WorkoutStretchCategory = {
  id: string
  name: string
  items: WorkoutStretch[]
}

export type WorkoutData = {
  exercises: WorkoutExerciseCategory[]
  stretches: WorkoutStretchCategory[]
}

export const workout = pgTable("workout", {
  id: uuid("id").defaultRandom().notNull().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  data: jsonb("data").$type<WorkoutData>().default({ exercises: [], stretches: [] }).notNull(),
  updatedAt: timestamp("updated_at", {
    withTimezone: true
  }).$onUpdate(() => new Date()),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true })
})

export type WorkoutEntry = typeof workout.$inferSelect
