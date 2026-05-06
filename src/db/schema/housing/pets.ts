import { jsonb, pgTable, timestamp, uuid } from "drizzle-orm/pg-core"
import { user } from "../auth"

export type PetHistoryType = "vet" | "vaccine" | "medication" | "other"

export type PetHistoryEntry = {
  id: string
  date: string
  type: PetHistoryType
  title: string
  notes?: string
}

export type Pet = {
  id: string
  name: string
  species: string
  breed?: string
  dateOfBirth?: string
  adoptionDate?: string
  weight?: number
  weightUnit?: string
  microchipId?: string
  history: PetHistoryEntry[]
}

export type PetsData = {
  pets: Pet[]
}

export const pets = pgTable("pets", {
  id: uuid("id").defaultRandom().notNull().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  data: jsonb("data")
    .$type<PetsData>()
    .default({
      pets: []
    })
    .notNull(),
  updatedAt: timestamp("updated_at", {
    withTimezone: true
  }).$onUpdate(() => new Date()),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true })
})

export type PetEntry = typeof pets.$inferSelect
