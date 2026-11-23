import { Hono } from "hono";
import { db } from "#db";
import { groceries } from "#db/schema";
import { eq } from "drizzle-orm";
import { env } from "cloudflare:workers";
import { ownerId } from "#api/lib/owner";
import { clearBought, resetAllToNeedBuy } from "./groceries.logic";

const app = new Hono()
  .get("/", async (c) => {
    const d1 = env?.DB;
    if (!d1) return c.json({ stores: [], categories: [] });
    const userId = ownerId();
    try {
      const records = await db
        .select()
        .from(groceries)
        .where(eq(groceries.userId, userId))
        .limit(1);
      const data = records[0]?.data || { stores: [], categories: [] };
      return c.json(data);
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
        .from(groceries)
        .where(eq(groceries.userId, userId))
        .limit(1);
      let currentData: { stores: any[]; categories: any[] } = existing[0]?.data || {
        stores: [],
        categories: [],
      };

      if (body.action) {
        if (body.action === "addCategory") {
          currentData = {
            ...currentData,
            categories: [
              ...currentData.categories,
              { id: crypto.randomUUID(), name: body.name, items: [] },
            ],
          };
        } else if (body.action === "deleteCategory") {
          currentData = {
            ...currentData,
            categories: currentData.categories.filter((c) => c.id !== body.catId),
          };
        } else if (body.action === "addItem") {
          currentData = {
            ...currentData,
            categories: currentData.categories.map((c) => {
              if (c.id === body.catId) {
                return {
                  ...c,
                  items: [...c.items, { id: crypto.randomUUID(), ...body.item }],
                };
              }
              return c;
            }),
          };
        } else if (body.action === "updateItem") {
          currentData = {
            ...currentData,
            categories: currentData.categories.map((c) => {
              if (c.id === body.catId) {
                return {
                  ...c,
                  items: c.items.map((i: any) =>
                    i.id === body.itemId ? { ...i, ...body.item } : i,
                  ),
                };
              }
              return c;
            }),
          };
        } else if (body.action === "deleteItem") {
          currentData = {
            ...currentData,
            categories: currentData.categories.map((c) => {
              if (c.id === body.catId) {
                return {
                  ...c,
                  items: c.items.filter((i: any) => i.id !== body.itemId),
                };
              }
              return c;
            }),
          };
        } else if (body.action === "toggleBought") {
          currentData = {
            ...currentData,
            categories: currentData.categories.map((c) => {
              if (c.id === body.catId) {
                return {
                  ...c,
                  items: c.items.map((i: any) => {
                    if (i.id === body.itemId) {
                      const isBought = !i.isBought;
                      return {
                        ...i,
                        isBought,
                        stockStatus: isBought ? "in-stock" : "out-of-stock",
                      };
                    }
                    return i;
                  }),
                };
              }
              return c;
            }),
          };
        } else if (body.action === "setStockStatus") {
          currentData = {
            ...currentData,
            categories: currentData.categories.map((c) => {
              if (c.id === body.catId) {
                return {
                  ...c,
                  items: c.items.map((i: any) => {
                    if (i.id === body.itemId) {
                      return {
                        ...i,
                        stockStatus: body.status,
                        isBought: body.status === "in-stock",
                      };
                    }
                    return i;
                  }),
                };
              }
              return c;
            }),
          };
        } else if (body.action === "addStore") {
          currentData = {
            ...currentData,
            stores: [
              ...currentData.stores,
              { id: crypto.randomUUID(), name: body.name, color: body.color },
            ],
          };
        } else if (body.action === "deleteStore") {
          currentData = {
            ...currentData,
            stores: currentData.stores.filter((s) => s.id !== body.storeId),
          };
        } else if (body.action === "resetAllToNeedBuy") {
          currentData = { ...currentData, categories: resetAllToNeedBuy(currentData.categories) };
        } else if (body.action === "clearBought") {
          currentData = { ...currentData, categories: clearBought(currentData.categories) };
        }
      } else if (body.data) {
        currentData = body.data;
      }

      if (existing[0]) {
        await db
          .update(groceries)
          .set({ data: currentData, updatedAt: new Date() })
          .where(eq(groceries.id, existing[0].id));
      } else {
        const newEntry = {
          id: crypto.randomUUID(),
          userId,
          data: currentData,
        };
        await db.insert(groceries).values(newEntry);
      }
      return c.json(currentData);
    } catch (err: any) {
      return c.json({ error: err.message }, 500);
    }
  });

export default app;
