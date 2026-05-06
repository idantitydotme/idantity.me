import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"
import { user } from "../auth"

export const wishlistItems = pgTable("wishlist_items", {
  id: uuid("id").defaultRandom().notNull().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  isPurchased: boolean("is_purchased").default(false).notNull(),
  purchasedAt: timestamp("purchased_at"),
  isArchived: boolean("is_archived").default(false).notNull(),
  updatedAt: timestamp("updated_at", {
    withTimezone: true
  }).$onUpdate(() => new Date()),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true })
})

export type WishlistItem = typeof wishlistItems.$inferSelect
export type NewWishlistItem = typeof wishlistItems.$inferInsert
