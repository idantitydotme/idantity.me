import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export type GroceryStore = {
  id: string;
  name: string;
  color?: string | undefined;
};

export type GroceryItem = {
  id: string;
  name: string;
  lastPrice?: number | undefined;
  amount: number;
  unit?: string | undefined;
  brand?: string | undefined;
  storeId?: string | undefined;
  isBought: boolean;
  stockStatus: "in-stock" | "low" | "out-of-stock";
};

export type GroceryCategory = {
  id: string;
  name: string;
  items: GroceryItem[];
};

export type GroceriesData = {
  stores: GroceryStore[];
  categories: GroceryCategory[];
};

export const groceries = sqliteTable("groceries", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  data: text("data", { mode: "json" })
    .$type<GroceriesData>()
    .notNull()
    .$defaultFn(() => ({
      stores: [],
      categories: [],
    })),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
});

export type GroceryEntry = typeof groceries.$inferSelect;
export type NewGroceryEntry = typeof groceries.$inferInsert;
