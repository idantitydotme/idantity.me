import { jsonb, pgTable, timestamp, uuid } from "drizzle-orm/pg-core"
import { user } from "../auth"

export type GroceryStore = {
  id: string
  name: string
  color?: string
}

export type GroceryItem = {
  id: string
  name: string
  lastPrice?: number
  amount: number
  unit?: string // e.g. "kg", "units", "packs"
  brand?: string
  storeId?: string // references a store.id
  isBought: boolean
  stockStatus: "in-stock" | "low" | "out-of-stock"
}

export type GroceryCategory = {
  id: string
  name: string
  items: GroceryItem[]
}

export type GroceriesData = {
  stores: GroceryStore[]
  categories: GroceryCategory[]
}

export const groceries = pgTable("groceries", {
  id: uuid("id").defaultRandom().notNull().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  data: jsonb("data")
    .$type<GroceriesData>()
    .default({
      stores: [],
      categories: []
    })
    .notNull(),
  updatedAt: timestamp("updated_at", {
    withTimezone: true
  }).$onUpdate(() => new Date()),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true })
})

export type GroceryEntry = typeof groceries.$inferSelect
