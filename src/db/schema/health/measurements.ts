import { jsonb, pgTable, timestamp, uuid } from "drizzle-orm/pg-core"
import { user } from "../auth"

export type MeasurementValue = {
  month: number // 0-11
  value: number | string
}

export type Measurement = {
  id: string
  name: string
  unit: string
  values: {
    [year: number]: MeasurementValue[]
  }
}

export type MeasurementsData = {
  measurements: Measurement[]
}

export const measurements = pgTable("measurements", {
  id: uuid("id").defaultRandom().notNull().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  data: jsonb("data").$type<MeasurementsData>().default({ measurements: [] }).notNull(),
  updatedAt: timestamp("updated_at", {
    withTimezone: true
  }).$onUpdate(() => new Date()),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true })
})

export type MeasurementsEntry = typeof measurements.$inferSelect
