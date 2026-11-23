import { Hono } from "hono";
import { db } from "#db";
import { pets, wishlistItems } from "#db/schema";
import { eq, desc } from "drizzle-orm";
import { env } from "cloudflare:workers";
import { ownerId } from "#api/lib/owner";
import { wishlistResponse } from "./housing.logic";

const app = new Hono()
  // Pets
  .get("/pets", async (c) => {
    const d1 = env?.DB;
    if (!d1) return c.json({ pets: [] });
    const userId = ownerId();
    try {
      const records = await db.select().from(pets).where(eq(pets.userId, userId)).limit(1);
      const data = records[0]?.data || { pets: [] };
      return c.json(data);
    } catch (err: any) {
      return c.json({ error: err.message }, 500);
    }
  })
  .post("/pets", async (c) => {
    const d1 = env?.DB;
    if (!d1) return c.json({ error: "No D1 DB binding" }, 500);
    const userId = ownerId();
    const body = (await c.req.json()) as any;
    try {
      const existing = await db.select().from(pets).where(eq(pets.userId, userId)).limit(1);
      let currentData: { pets: any[] } = existing[0]?.data || { pets: [] };

      if (body.action) {
        if (body.action === "addPet") {
          currentData = {
            pets: [
              ...currentData.pets,
              {
                id: crypto.randomUUID(),
                ...body.pet,
                history: body.pet.history || [],
                weightHistory: body.pet.weightHistory || [],
              },
            ],
          };
        } else if (body.action === "updatePet") {
          currentData = {
            pets: currentData.pets.map((p) => (p.id === body.petId ? { ...p, ...body.pet } : p)),
          };
        } else if (body.action === "deletePet") {
          currentData = {
            pets: currentData.pets.filter((p) => p.id !== body.petId),
          };
        } else if (body.action === "addHistoryEntry") {
          currentData = {
            pets: currentData.pets.map((p) => {
              if (p.id === body.petId) {
                return {
                  ...p,
                  history: [{ id: crypto.randomUUID(), ...body.entry }, ...(p.history || [])],
                };
              }
              return p;
            }),
          };
        } else if (body.action === "deleteHistoryEntry") {
          currentData = {
            pets: currentData.pets.map((p) => {
              if (p.id === body.petId) {
                return {
                  ...p,
                  history: (p.history || []).filter((h: any) => h.id !== body.entryId),
                };
              }
              return p;
            }),
          };
        } else if (body.action === "addWeightEntry") {
          currentData = {
            pets: currentData.pets.map((p) => {
              if (p.id === body.petId) {
                return {
                  ...p,
                  weight: body.entry.weight,
                  weightUnit: body.entry.unit,
                  weightHistory: [
                    { id: crypto.randomUUID(), ...body.entry },
                    ...(p.weightHistory || []),
                  ],
                };
              }
              return p;
            }),
          };
        } else if (body.action === "deleteWeightEntry") {
          currentData = {
            pets: currentData.pets.map((p) => {
              if (p.id === body.petId) {
                return {
                  ...p,
                  weightHistory: (p.weightHistory || []).filter((w: any) => w.id !== body.entryId),
                };
              }
              return p;
            }),
          };
        }
      } else if (body.data) {
        currentData = body.data;
      }

      if (existing[0]) {
        await db
          .update(pets)
          .set({ data: currentData, updatedAt: new Date() })
          .where(eq(pets.id, existing[0].id));
      } else {
        const newEntry = { id: crypto.randomUUID(), userId, data: currentData };
        await db.insert(pets).values(newEntry);
      }
      return c.json(currentData);
    } catch (err: any) {
      return c.json({ error: err.message }, 500);
    }
  })
  // Wishlist
  .get("/wishlist", async (c) => {
    const d1 = env?.DB;
    if (!d1) return c.json({ wishlist: [] });
    const userId = ownerId();
    try {
      const list = await db
        .select()
        .from(wishlistItems)
        .where(eq(wishlistItems.userId, userId))
        .orderBy(desc(wishlistItems.createdAt));
      return c.json(wishlistResponse(list));
    } catch (err: any) {
      return c.json({ error: err.message }, 500);
    }
  })
  .post("/wishlist", async (c) => {
    const d1 = env?.DB;
    if (!d1) return c.json({ error: "No D1 DB binding" }, 500);
    const userId = ownerId();
    const body = (await c.req.json()) as any;
    try {
      const newItem = {
        id: crypto.randomUUID(),
        userId,
        name: body.name,
        price: body.price || null,
        url: body.url || null,
        priority: body.priority || "medium",
        category: body.category || "General",
        isPurchased: false,
      };
      await db.insert(wishlistItems).values(newItem);
      return c.json(newItem, 201);
    } catch (err: any) {
      return c.json({ error: err.message }, 500);
    }
  })
  .patch("/wishlist", async (c) => {
    const d1 = env?.DB;
    if (!d1) return c.json({ error: "No D1 DB binding" }, 500);
    const body = (await c.req.json()) as any;
    try {
      if (!body.id) return c.json({ error: "Missing id" }, 400);
      await db
        .update(wishlistItems)
        .set({
          ...(body.name !== undefined ? { name: body.name } : {}),
          ...(body.price !== undefined ? { price: body.price } : {}),
          ...(body.url !== undefined ? { url: body.url } : {}),
          ...(body.priority !== undefined ? { priority: body.priority } : {}),
          ...(body.category !== undefined ? { category: body.category } : {}),
          ...(body.isPurchased !== undefined ? { isPurchased: body.isPurchased } : {}),
          updatedAt: new Date(),
        })
        .where(eq(wishlistItems.id, body.id));
      return c.json({ success: true });
    } catch (err: any) {
      return c.json({ error: err.message }, 500);
    }
  })
  .delete("/wishlist", async (c) => {
    const d1 = env?.DB;
    if (!d1) return c.json({ error: "No D1 DB binding" }, 500);
    const id = c.req.query("id");
    if (!id) return c.json({ error: "Missing id" }, 400);
    try {
      await db.delete(wishlistItems).where(eq(wishlistItems.id, id));
      return c.json({ success: true });
    } catch (err: any) {
      return c.json({ error: err.message }, 500);
    }
  });

export default app;
