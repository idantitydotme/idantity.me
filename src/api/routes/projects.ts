import { Hono } from "hono";
import { db } from "#db";
import { board, list, card } from "#db/schema";
import { eq, desc } from "drizzle-orm";
import { env } from "cloudflare:workers";
import { ownerId } from "#api/lib/owner";
import { planCreate, targetIdOf } from "./projects.logic";
import { scopeProjects } from "./projects.scope";

const app = new Hono()
  .get("/cards", async (c) => {
    const d1 = env?.DB;
    if (!d1) return c.json({ boards: [], lists: [], cards: [] });
    const userId = ownerId();
    try {
      const boards = await db.select().from(board);
      const lists = await db.select().from(list).orderBy(desc(list.order));
      const cards = await db.select().from(card).orderBy(desc(card.order));
      return c.json(scopeProjects(userId, { boards, lists, cards }));
    } catch (err: any) {
      return c.json({ error: err.message }, 500);
    }
  })
  .post("/cards", async (c) => {
    const d1 = env?.DB;
    if (!d1) return c.json({ error: "No D1 DB binding" }, 500);
    const userId = ownerId();
    const plan = planCreate(await c.req.json(), userId, crypto.randomUUID());
    if (!plan.ok) return c.json({ error: plan.error }, 400);
    try {
      if (plan.type === "board") await db.insert(board).values(plan.row);
      else if (plan.type === "list") await db.insert(list).values(plan.row);
      else await db.insert(card).values(plan.row);
      return c.json({ type: plan.type, ...plan.row }, 201);
    } catch (err: any) {
      return c.json({ error: err.message }, 500);
    }
  })
  .patch("/cards", async (c) => {
    const d1 = env?.DB;
    if (!d1) return c.json({ error: "No D1 DB binding" }, 500);
    const body = (await c.req.json()) as any;
    const id = targetIdOf(body);
    if (!id) return c.json({ error: "Missing cardId" }, 400);
    try {
      await db
        .update(card)
        .set({
          ...(body.title !== undefined ? { title: body.title } : {}),
          ...(body.description !== undefined ? { description: body.description } : {}),
          ...(body.listId !== undefined ? { listId: body.listId } : {}),
          ...(body.order !== undefined ? { order: Number(body.order) } : {}),
          ...(body.customFields !== undefined ? { customFields: body.customFields } : {}),
          updatedAt: new Date(),
        })
        .where(eq(card.id, id));
      return c.json({ success: true });
    } catch (err: any) {
      return c.json({ error: err.message }, 500);
    }
  })
  .delete("/cards", async (c) => {
    const d1 = env?.DB;
    if (!d1) return c.json({ error: "No D1 DB binding" }, 500);
    const cardId = c.req.query("cardId");
    if (!cardId) return c.json({ error: "Missing cardId" }, 400);
    try {
      await db.delete(card).where(eq(card.id, cardId));
      return c.json({ success: true });
    } catch (err: any) {
      return c.json({ error: err.message }, 500);
    }
  });

export default app;
