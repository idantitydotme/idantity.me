import { Hono } from "hono";
import { db } from "#db";
import { fasting, measurements, workout } from "#db/schema";
import { eq, desc } from "drizzle-orm";
import { env } from "cloudflare:workers";
import { ownerId } from "#api/lib/owner";
import { documentPayload, planFastPatch, planFastPost } from "./health.logic";

const app = new Hono()
  // Fasting
  .get("/fasting", async (c) => {
    const d1 = env?.DB;
    if (!d1) return c.json({ fasting: [] });
    const userId = ownerId();
    try {
      const list = await db
        .select()
        .from(fasting)
        .where(eq(fasting.userId, userId))
        .orderBy(desc(fasting.startTime));
      return c.json({ fasts: list, fasting: list });
    } catch (err: any) {
      return c.json({ error: err.message }, 500);
    }
  })
  .post("/fasting", async (c) => {
    const d1 = env?.DB;
    if (!d1) return c.json({ error: "No D1 DB binding" }, 500);
    const userId = ownerId();
    const plan = planFastPost(await c.req.json(), new Date());
    if (!plan.ok) return c.json({ error: plan.error }, 400);
    const { ok: _ok, ...fields } = plan;
    try {
      const newFast = { id: crypto.randomUUID(), userId, ...fields };
      await db.insert(fasting).values(newFast);
      return c.json(newFast, 201);
    } catch (err: any) {
      return c.json({ error: err.message }, 500);
    }
  })
  .patch("/fasting", async (c) => {
    const d1 = env?.DB;
    if (!d1) return c.json({ error: "No D1 DB binding" }, 500);
    const body = (await c.req.json()) as any;
    if (!body?.id) return c.json({ error: "Missing id" }, 400);
    const plan = planFastPatch(body, new Date());
    if (!plan.ok) return c.json({ error: plan.error }, 400);
    try {
      await db
        .update(fasting)
        .set({ ...plan.set, updatedAt: new Date() })
        .where(eq(fasting.id, body.id));
      return c.json({ success: true });
    } catch (err: any) {
      return c.json({ error: err.message }, 500);
    }
  })
  // Measurements
  .get("/measurements", async (c) => {
    const d1 = env?.DB;
    if (!d1) return c.json({ data: { measurements: [] } });
    const userId = ownerId();
    try {
      const records = await db
        .select()
        .from(measurements)
        .where(eq(measurements.userId, userId))
        .limit(1);
      const data = records[0]?.data || { measurements: [] };
      return c.json({ data });
    } catch (err: any) {
      return c.json({ error: err.message }, 500);
    }
  })
  .post("/measurements", async (c) => {
    const d1 = env?.DB;
    if (!d1) return c.json({ error: "No D1 DB binding" }, 500);
    const userId = ownerId();
    const data = documentPayload(await c.req.json()) as any;
    try {
      const existing = await db
        .select()
        .from(measurements)
        .where(eq(measurements.userId, userId))
        .limit(1);
      if (existing[0]) {
        await db
          .update(measurements)
          .set({ data, updatedAt: new Date() })
          .where(eq(measurements.id, existing[0].id));
        return c.json({ success: true, data });
      } else {
        const newEntry = {
          id: crypto.randomUUID(),
          userId,
          data: data || { measurements: [] },
        };
        await db.insert(measurements).values(newEntry);
        return c.json({ success: true, data: newEntry.data }, 201);
      }
    } catch (err: any) {
      return c.json({ error: err.message }, 500);
    }
  })
  // Workouts
  .get("/workouts", async (c) => {
    const d1 = env?.DB;
    if (!d1) return c.json({ data: { exercises: [], stretches: [] } });
    const userId = ownerId();
    try {
      const records = await db.select().from(workout).where(eq(workout.userId, userId)).limit(1);
      const data = records[0]?.data || { exercises: [], stretches: [] };
      return c.json({ data });
    } catch (err: any) {
      return c.json({ error: err.message }, 500);
    }
  })
  .post("/workouts", async (c) => {
    const d1 = env?.DB;
    if (!d1) return c.json({ error: "No D1 DB binding" }, 500);
    const userId = ownerId();
    const data = documentPayload(await c.req.json()) as any;
    try {
      const existing = await db.select().from(workout).where(eq(workout.userId, userId)).limit(1);
      if (existing[0]) {
        await db
          .update(workout)
          .set({ data, updatedAt: new Date() })
          .where(eq(workout.id, existing[0].id));
        return c.json({ success: true, data });
      } else {
        const newEntry = {
          id: crypto.randomUUID(),
          userId,
          data: data || { exercises: [], stretches: [] },
        };
        await db.insert(workout).values(newEntry);
        return c.json({ success: true, data: newEntry.data }, 201);
      }
    } catch (err: any) {
      return c.json({ error: err.message }, 500);
    }
  });

export default app;
