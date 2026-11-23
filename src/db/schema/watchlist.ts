import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export type WatchlistItem = {
  id: string;
  title: string;
  description?: string | undefined;
  director?: string | undefined;
  author?: string | undefined;
  genre?: string | undefined;
  duration?: string | undefined;
  year?: number | undefined;
  rating?: number | undefined;
  status: "planned" | "in-progress" | "completed" | "dropped";
  notes?: string | undefined;
  recommendedBy?: string | undefined;
  completed?: boolean | undefined;
  seasons?: number | undefined;
  episodes?: number | undefined;
  pages?: number | undefined;
};

export type WatchlistCategory = {
  id: string;
  name: string;
  items: WatchlistItem[];
};

export type WatchlistData = {
  movies: WatchlistCategory[];
  series: WatchlistCategory[];
  books: WatchlistCategory[];
};

export const watchlist = sqliteTable("watchlist", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  data: text("data", { mode: "json" })
    .$type<WatchlistData>()
    .notNull()
    .$defaultFn(() => ({
      movies: [],
      series: [],
      books: [],
    })),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
});

export type WatchlistEntry = typeof watchlist.$inferSelect;
export type NewWatchlistEntry = typeof watchlist.$inferInsert;
