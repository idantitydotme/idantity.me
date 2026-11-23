import { Hono } from "hono";
import { db } from "#db";
import { watchlist, type WatchlistData } from "#db/schema";
import { eq } from "drizzle-orm";
import { env } from "cloudflare:workers";
import { ownerId } from "#api/lib/owner";

const SECTIONS: (keyof WatchlistData)[] = ["movies", "series", "books"];
const EMPTY: WatchlistData = { movies: [], series: [], books: [] };

function normalizeWatchlistData(raw: unknown): WatchlistData {
  const obj = raw && typeof raw === "object" ? (raw as any) : {};
  const payload = obj && typeof obj.data === "object" && obj.data !== null ? obj.data : obj;
  const out: WatchlistData = { movies: [], series: [], books: [] };
  for (const section of SECTIONS) {
    const cats = Array.isArray(payload[section]) ? payload[section] : [];
    out[section] = cats.map((category: any) => {
      const items = Array.isArray(category?.items) ? category.items : [];
      return {
        id: typeof category?.id === "string" ? category.id : crypto.randomUUID(),
        name: typeof category?.name === "string" ? category.name : "",
        items: items.map((item: any) => {
          const base = item && typeof item === "object" ? item : {};
          return { ...base, id: typeof item?.id === "string" ? item.id : crypto.randomUUID() };
        }),
      };
    });
  }
  return out;
}

const app = new Hono()
  .get("/", async (c) => {
    const d1 = env?.DB;
    if (!d1) return c.json(EMPTY);
    const userId = ownerId();
    try {
      const records = await db
        .select()
        .from(watchlist)
        .where(eq(watchlist.userId, userId))
        .limit(1);
      return c.json(normalizeWatchlistData(records[0]?.data));
    } catch (err: any) {
      return c.json({ error: err.message }, 500);
    }
  })
  .post("/", async (c) => {
    const d1 = env?.DB;
    if (!d1) return c.json({ error: "No D1 DB binding" }, 500);
    const userId = ownerId();
    const body = (await c.req.json()) as any;
    try {
      const existing = await db
        .select()
        .from(watchlist)
        .where(eq(watchlist.userId, userId))
        .limit(1);
      let currentData = normalizeWatchlistData(existing[0]?.data);

      if (body.action) {
        const section = body.section as keyof WatchlistData;
        if (body.action === "addCategory") {
          currentData = {
            ...currentData,
            [section]: [
              ...currentData[section],
              { id: crypto.randomUUID(), name: String(body.name || ""), items: [] },
            ],
          };
        } else if (body.action === "deleteCategory") {
          currentData = {
            ...currentData,
            [section]: currentData[section].filter((c: any) => c.id !== body.catId),
          };
        } else if (body.action === "addItem") {
          const itemBase = body.item && typeof body.item === "object" ? body.item : {};
          currentData = {
            ...currentData,
            [section]: currentData[section].map((c: any) => {
              if (c.id === body.catId) {
                return {
                  ...c,
                  items: [...c.items, { id: crypto.randomUUID(), ...itemBase }],
                };
              }
              return c;
            }),
          };
        } else if (body.action === "updateItem") {
          const itemBase = body.item && typeof body.item === "object" ? body.item : {};
          currentData = {
            ...currentData,
            [section]: currentData[section].map((c: any) => {
              if (c.id === body.catId) {
                return {
                  ...c,
                  items: c.items.map((i: any) =>
                    i.id === body.itemId ? { ...i, ...itemBase } : i,
                  ),
                };
              }
              return c;
            }),
          };
        } else if (body.action === "deleteItem") {
          currentData = {
            ...currentData,
            [section]: currentData[section].map((c: any) => {
              if (c.id === body.catId) {
                return {
                  ...c,
                  items: c.items.filter((i: any) => i.id !== body.itemId),
                };
              }
              return c;
            }),
          };
        } else if (body.action === "toggleCompleted") {
          currentData = {
            ...currentData,
            [section]: currentData[section].map((c: any) => {
              if (c.id === body.catId) {
                return {
                  ...c,
                  items: c.items.map((i: any) => {
                    if (i.id === body.itemId) {
                      const completed = !i.completed;
                      return {
                        ...i,
                        completed,
                        status: completed ? "completed" : "planned",
                      };
                    }
                    return i;
                  }),
                };
              }
              return c;
            }),
          };
        }
      } else if (body.data) {
        currentData = normalizeWatchlistData(body.data);
      }

      if (existing[0]) {
        await db
          .update(watchlist)
          .set({ data: currentData, updatedAt: new Date() })
          .where(eq(watchlist.id, existing[0].id));
      } else {
        const newEntry = {
          id: crypto.randomUUID(),
          userId,
          data: currentData,
        };
        await db.insert(watchlist).values(newEntry);
      }
      return c.json(currentData);
    } catch (err: any) {
      return c.json({ error: err.message }, 500);
    }
  });

export default app;
