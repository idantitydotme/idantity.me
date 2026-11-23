import { Hono } from "hono";
import { db } from "#db";
import { music } from "#db/schema";
import { eq } from "drizzle-orm";
import { env } from "cloudflare:workers";
import { ownerId } from "#api/lib/owner";

const app = new Hono()
  .get("/", async (c) => {
    const d1 = env?.DB;
    if (!d1)
      return c.json({
        data: {
          piano: {
            routine: [],
            exercises: [],
            repertoire: [],
            repertoireStates: [],
            repertoireComposers: [],
          },
          guitar: {
            routine: [],
            exercises: [],
            repertoire: [],
            repertoireStates: [],
            repertoireComposers: [],
          },
          dj: { routine: [], exercises: [], mixes: [], djGenres: [] },
        },
      });
    const userId = ownerId();
    try {
      const records = await db.select().from(music).where(eq(music.userId, userId)).limit(1);
      const data = records[0]?.data || {
        piano: {
          routine: [],
          exercises: [],
          repertoire: [],
          repertoireStates: [],
          repertoireComposers: [],
        },
        guitar: {
          routine: [],
          exercises: [],
          repertoire: [],
          repertoireStates: [],
          repertoireComposers: [],
        },
        dj: { routine: [], exercises: [], mixes: [], djGenres: [] },
      };
      return c.json({ data });
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
      const existing = await db.select().from(music).where(eq(music.userId, userId)).limit(1);
      if (existing[0]) {
        await db
          .update(music)
          .set({ data: body.data, updatedAt: new Date() })
          .where(eq(music.id, existing[0].id));
        return c.json({ success: true, data: body.data });
      } else {
        const newEntry = { id: crypto.randomUUID(), userId, data: body.data };
        await db.insert(music).values(newEntry);
        return c.json({ success: true, data: newEntry.data }, 201);
      }
    } catch (err: any) {
      return c.json({ error: err.message }, 500);
    }
  });

export default app;
