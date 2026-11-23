import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// Pets
export type PetHistoryType = "vet" | "vaccine" | "medication" | "other";

export type PetHistoryEntry = {
  id: string;
  date: string;
  type: PetHistoryType;
  title: string;
  notes?: string | undefined;
};

export type PetWeightEntry = {
  id: string;
  date: string;
  weight: number;
  unit: string;
  notes?: string | undefined;
};

export type Pet = {
  id: string;
  name: string;
  species: string;
  breed?: string | undefined;
  dateOfBirth?: string | undefined;
  adoptionDate?: string | undefined;
  weight?: number | undefined;
  weightUnit?: string | undefined;
  microchipId?: string | undefined;
  history: PetHistoryEntry[];
  weightHistory?: PetWeightEntry[] | undefined;
};

export type PetsData = {
  pets: Pet[];
};

export const pets = sqliteTable("pets", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  data: text("data", { mode: "json" })
    .$type<PetsData>()
    .notNull()
    .$defaultFn(() => ({ pets: [] })),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
});

export type PetEntry = typeof pets.$inferSelect;
export type NewPetEntry = typeof pets.$inferInsert;

// Wishlist
export const wishlistItems = sqliteTable("wishlist_items", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  price: text("price"),
  url: text("url"),
  priority: text("priority").notNull().default("medium"),
  category: text("category").notNull().default("General"),
  isPurchased: integer("is_purchased", { mode: "boolean" }).notNull().default(false),
  purchasedAt: integer("purchased_at", { mode: "timestamp" }),
  isArchived: integer("is_archived", { mode: "boolean" }).notNull().default(false),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
});

export type WishlistItem = typeof wishlistItems.$inferSelect;
export type NewWishlistItem = typeof wishlistItems.$inferInsert;
