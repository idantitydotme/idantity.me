import { Hono } from "hono";
import { db } from "#db";
import { habits } from "#db/schema";
import { eq } from "drizzle-orm";
import { env } from "cloudflare:workers";
import { ownerId } from "#api/lib/owner";

const app = new Hono()
  .get("/", async (c) => {
    const d1 = env?.DB;
    if (!d1) return c.json({ years: [] });
    const userId = ownerId();
    try {
      const records = await db.select().from(habits).where(eq(habits.userId, userId)).limit(1);
      const data = records[0]?.data || { years: [] };
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
      const existing = await db.select().from(habits).where(eq(habits.userId, userId)).limit(1);
      let currentData: { years: any[] } = existing[0]?.data || { years: [] };

      if (body.action) {
        if (body.action === "addYear") {
          const yrNum = Number(body.year);
          if (!currentData.years.some((y: any) => y.year === yrNum)) {
            currentData = {
              ...currentData,
              years: [...currentData.years, { year: yrNum, categories: [] }].sort(
                (a, b) => b.year - a.year,
              ),
            };
          }
        } else if (body.action === "addCategory") {
          currentData = {
            ...currentData,
            years: currentData.years.map((y: any) => {
              if (y.year === body.year) {
                return {
                  ...y,
                  categories: [
                    ...y.categories,
                    { id: crypto.randomUUID(), name: body.name, habits: [] },
                  ],
                };
              }
              return y;
            }),
          };
        } else if (body.action === "deleteCategory") {
          currentData = {
            ...currentData,
            years: currentData.years.map((y: any) => {
              if (y.year === body.year) {
                return {
                  ...y,
                  categories: y.categories.filter((cat: any) => cat.id !== body.catId),
                };
              }
              return y;
            }),
          };
        } else if (body.action === "addHabit") {
          currentData = {
            ...currentData,
            years: currentData.years.map((y: any) => {
              if (y.year === body.year) {
                return {
                  ...y,
                  categories: y.categories.map((cat: any) => {
                    if (cat.id === body.catId) {
                      return {
                        ...cat,
                        habits: [
                          ...cat.habits,
                          { id: crypto.randomUUID(), name: body.name, completedDates: [] },
                        ],
                      };
                    }
                    return cat;
                  }),
                };
              }
              return y;
            }),
          };
        } else if (body.action === "deleteHabit") {
          currentData = {
            ...currentData,
            years: currentData.years.map((y: any) => {
              if (y.year === body.year) {
                return {
                  ...y,
                  categories: y.categories.map((cat: any) => {
                    if (cat.id === body.catId) {
                      return {
                        ...cat,
                        habits: cat.habits.filter((h: any) => h.id !== body.habitId),
                      };
                    }
                    return cat;
                  }),
                };
              }
              return y;
            }),
          };
        } else if (body.action === "toggleDate") {
          currentData = {
            ...currentData,
            years: currentData.years.map((y: any) => {
              if (y.year === body.year) {
                return {
                  ...y,
                  categories: y.categories.map((cat: any) => {
                    if (cat.id === body.catId) {
                      return {
                        ...cat,
                        habits: cat.habits.map((h: any) => {
                          if (h.id === body.habitId) {
                            const completedDates = [...(h.completedDates || [])];
                            const idx = completedDates.indexOf(body.date);
                            if (idx > -1) {
                              completedDates.splice(idx, 1);
                            } else {
                              completedDates.push(body.date);
                            }
                            return { ...h, completedDates };
                          }
                          return h;
                        }),
                      };
                    }
                    return cat;
                  }),
                };
              }
              return y;
            }),
          };
        }
      } else if (body.data) {
        currentData = body.data;
      }

      if (existing[0]) {
        await db
          .update(habits)
          .set({ data: currentData, updatedAt: new Date() })
          .where(eq(habits.id, existing[0].id));
      } else {
        const newEntry = { id: crypto.randomUUID(), userId, data: currentData };
        await db.insert(habits).values(newEntry);
      }
      return c.json(currentData);
    } catch (err: any) {
      return c.json({ error: err.message }, 500);
    }
  });

export default app;
