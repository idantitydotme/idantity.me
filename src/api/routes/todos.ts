import { Hono } from "hono";
import { db } from "#db";
import { todo } from "#db/schema";
import { eq, desc, and, inArray } from "drizzle-orm";
import { env } from "cloudflare:workers";
import { ownerId } from "#api/lib/owner";
import { planNewTodo, planTodoPost } from "./todos.logic";
import { planOwnedId } from "#api/lib/owned.logic";

const app = new Hono()
  .get("/", async (c) => {
    const d1 = env?.DB;
    if (!d1) return c.json({ todos: [] });
    const userId = ownerId();
    try {
      const list = await db
        .select()
        .from(todo)
        .where(eq(todo.userId, userId))
        .orderBy(desc(todo.createdAt));
      return c.json({ todos: list });
    } catch (err: any) {
      return c.json({ error: err.message }, 500);
    }
  })
  .post("/", async (c) => {
    const d1 = env?.DB;
    if (!d1) return c.json({ error: "No D1 DB binding" }, 500);
    const userId = ownerId();
    const body = await c.req.json();

    const batch = planTodoPost(body);
    if (batch.kind === "invalid") return c.json({ error: batch.error }, 400);
    if (batch.kind === "batch") {
      try {
        const scope = and(eq(todo.userId, userId), inArray(todo.id, batch.ids));
        const rows =
          batch.action === "batchComplete"
            ? await db
                .update(todo)
                .set({ isCompleted: true, updatedAt: new Date() })
                .where(scope)
                .returning({ id: todo.id })
            : await db.delete(todo).where(scope).returning({ id: todo.id });
        return c.json({ success: true, count: rows.length });
      } catch (err: any) {
        return c.json({ error: err.message }, 500);
      }
    }

    const plan = planNewTodo(body);
    if (!plan.ok) return c.json({ error: plan.error }, 400);
    try {
      const newTodo = {
        id: crypto.randomUUID(),
        userId,
        title: plan.title,
        category: plan.category,
        priority: plan.priority as "low" | "medium" | "high" | "urgent",
        dueDate: plan.dueDate,
        isCompleted: false,
      };
      await db.insert(todo).values(newTodo);
      return c.json(newTodo, 201);
    } catch (err: any) {
      return c.json({ error: err.message }, 500);
    }
  })
  .patch("/", async (c) => {
    const d1 = env?.DB;
    if (!d1) return c.json({ error: "No D1 DB binding" }, 500);
    const body = (await c.req.json()) as any;
    const target = planOwnedId(body.id, ownerId());
    if (!target.ok) return c.json({ error: target.error }, 400);
    try {
      const rows = await db
        .update(todo)
        .set({
          ...(body.title !== undefined ? { title: body.title } : {}),
          ...(body.isCompleted !== undefined ? { isCompleted: body.isCompleted } : {}),
          ...(body.priority !== undefined ? { priority: body.priority } : {}),
          ...(body.category !== undefined ? { category: body.category } : {}),
          updatedAt: new Date(),
        })
        .where(and(eq(todo.id, target.id), eq(todo.userId, target.owner)))
        .returning({ id: todo.id });
      if (rows.length === 0) return c.json({ error: "Not found" }, 404);
      return c.json({ success: true });
    } catch (err: any) {
      return c.json({ error: err.message }, 500);
    }
  })
  .delete("/", async (c) => {
    const d1 = env?.DB;
    if (!d1) return c.json({ error: "No D1 DB binding" }, 500);
    const target = planOwnedId(c.req.query("id"), ownerId());
    if (!target.ok) return c.json({ error: target.error }, 400);
    try {
      const rows = await db
        .delete(todo)
        .where(and(eq(todo.id, target.id), eq(todo.userId, target.owner)))
        .returning({ id: todo.id });
      if (rows.length === 0) return c.json({ error: "Not found" }, 404);
      return c.json({ success: true });
    } catch (err: any) {
      return c.json({ error: err.message }, 500);
    }
  });

export default app;
