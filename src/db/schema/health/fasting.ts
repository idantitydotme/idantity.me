import { boolean, pgTable, timestamp, uuid } from "drizzle-orm/pg-core"
import { user } from "../auth"

export const fasting = pgTable("fasting", {
  id: uuid("id").defaultRandom().notNull().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  originalEndTime: timestamp("original_end_time"),
  isActive: boolean("is_active").default(true).notNull(),
  updatedAt: timestamp("updated_at", {
    withTimezone: true
  }).$onUpdate(() => new Date()),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true })
})

export type FastingEntry = typeof fasting.$inferSelect
export type NewFastingEntry = typeof fasting.$inferInsert
