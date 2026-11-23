import { Hono } from "hono";
import { db } from "#db";
import { note } from "#db/schema";
import { eq, desc, and } from "drizzle-orm";
import { env } from "cloudflare:workers";
import { ownerId } from "#api/lib/owner";
import { planOwnedId } from "#api/lib/owned.logic";

const app = new Hono()
  .get("/", async (c) => {
    const d1 = env?.DB;
    if (!d1) return c.json({ notes: [] });
    const userId = ownerId();
    try {
      const list = await db
        .select()
        .from(note)
        .where(eq(note.userId, userId))
        .orderBy(desc(note.updatedAt));
      return c.json({ notes: list });
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
      const newNote = {
        id: crypto.randomUUID(),
        userId,
        title: body.title || "Untitled",
        content: body.content || "",
        tags: body.tags || [],
        color: body.color || "default",
        isPinned: body.isPinned ?? false,
        isArchived: false,
        isTrashed: false,
      };
      await db.insert(note).values(newNote);
      return c.json(newNote, 201);
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
        .update(note)
        .set({
          ...(body.title !== undefined ? { title: body.title } : {}),
          ...(body.content !== undefined ? { content: body.content } : {}),
          ...(body.tags !== undefined ? { tags: body.tags } : {}),
          ...(body.color !== undefined ? { color: body.color } : {}),
          ...(body.isPinned !== undefined ? { isPinned: body.isPinned } : {}),
          ...(body.isArchived !== undefined ? { isArchived: body.isArchived } : {}),
          ...(body.isTrashed !== undefined ? { isTrashed: body.isTrashed } : {}),
          updatedAt: new Date(),
        })
        .where(and(eq(note.id, target.id), eq(note.userId, target.owner)))
        .returning({ id: note.id });
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
        .delete(note)
        .where(and(eq(note.id, target.id), eq(note.userId, target.owner)))
        .returning({ id: note.id });
      if (rows.length === 0) return c.json({ error: "Not found" }, 404);
      return c.json({ success: true });
    } catch (err: any) {
      return c.json({ error: err.message }, 500);
    }
  });

export default app;
