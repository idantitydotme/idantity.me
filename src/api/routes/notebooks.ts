import { Hono } from "hono";
import { db } from "#db";
import { notebook, notebookEntry } from "#db/schema";
import { eq, desc, asc, count, and } from "drizzle-orm";
import { env } from "cloudflare:workers";
import { ownerId } from "#api/lib/owner";

function getUserId() {
  return ownerId();
}

const app = new Hono()
  .get("/", async (c) => {
    const d1 = env?.DB;
    if (!d1) return c.json({ notebooks: [] });
    const userId = getUserId();
    try {
      const list = await db
        .select()
        .from(notebook)
        .where(eq(notebook.userId, userId))
        .orderBy(desc(notebook.updatedAt));
      const counts = await db
        .select({ notebookId: notebookEntry.notebookId, total: count() })
        .from(notebookEntry)
        .where(eq(notebookEntry.userId, userId))
        .groupBy(notebookEntry.notebookId);
      const countMap = new Map(counts.map((r) => [r.notebookId, r.total]));
      return c.json({
        notebooks: list.map((n) => ({ ...n, entryCount: countMap.get(n.id) ?? 0 })),
      });
    } catch (err: any) {
      return c.json({ error: err.message }, 500);
    }
  })
  .get("/entries", async (c) => {
    const d1 = env?.DB;
    if (!d1) return c.json({ entries: [] });
    const id = c.req.query("id");
    if (!id) return c.json({ error: "Missing id" }, 400);
    const userId = getUserId();
    try {
      const entries = await db
        .select()
        .from(notebookEntry)
        .where(and(eq(notebookEntry.notebookId, id), eq(notebookEntry.userId, userId)))
        .orderBy(asc(notebookEntry.createdAt));
      return c.json({ entries });
    } catch (err: any) {
      return c.json({ error: err.message }, 500);
    }
  })
  .post("/", async (c) => {
    const d1 = env?.DB;
    if (!d1) return c.json({ error: "No D1 DB binding" }, 500);
    const userId = getUserId();
    const body = (await c.req.json()) as any;
    try {
      const now = new Date();
      const created = {
        id: crypto.randomUUID(),
        userId,
        title: body.title || "Untitled",
        color: body.color || "neutral",
        isPinned: body.isPinned ?? false,
        isArchived: false,
        isTrashed: false,
        createdAt: now,
        updatedAt: now,
      };
      await db.insert(notebook).values(created);

      let entry = null;
      const content = typeof body.content === "string" ? body.content.trim() : "";
      if (content) {
        entry = {
          id: crypto.randomUUID(),
          notebookId: created.id,
          userId,
          content,
          createdAt: now,
          updatedAt: now,
        };
        await db.insert(notebookEntry).values(entry);
      }

      return c.json({ ...created, entryCount: entry ? 1 : 0 }, 201);
    } catch (err: any) {
      return c.json({ error: err.message }, 500);
    }
  })
  .patch("/", async (c) => {
    const d1 = env?.DB;
    if (!d1) return c.json({ error: "No D1 DB binding" }, 500);
    const body = (await c.req.json()) as any;
    try {
      if (!body.id) return c.json({ error: "Missing id" }, 400);
      await db
        .update(notebook)
        .set({
          ...(body.title !== undefined ? { title: body.title } : {}),
          ...(body.color !== undefined ? { color: body.color } : {}),
          ...(body.isPinned !== undefined ? { isPinned: body.isPinned } : {}),
          ...(body.isArchived !== undefined ? { isArchived: body.isArchived } : {}),
          ...(body.isTrashed !== undefined ? { isTrashed: body.isTrashed } : {}),
          updatedAt: new Date(),
        })
        .where(eq(notebook.id, body.id));
      return c.json({ success: true });
    } catch (err: any) {
      return c.json({ error: err.message }, 500);
    }
  })
  .delete("/", async (c) => {
    const d1 = env?.DB;
    if (!d1) return c.json({ error: "No D1 DB binding" }, 500);
    const id = c.req.query("id");
    if (!id) return c.json({ error: "Missing id" }, 400);
    try {
      await db.delete(notebookEntry).where(eq(notebookEntry.notebookId, id));
      await db.delete(notebook).where(eq(notebook.id, id));
      return c.json({ success: true });
    } catch (err: any) {
      return c.json({ error: err.message }, 500);
    }
  })
  .post("/entries", async (c) => {
    const d1 = env?.DB;
    if (!d1) return c.json({ error: "No D1 DB binding" }, 500);
    const userId = getUserId();
    const body = (await c.req.json()) as any;
    try {
      if (!body.notebookId) return c.json({ error: "Missing notebookId" }, 400);
      const content = typeof body.content === "string" ? body.content.trim() : "";
      if (!content) return c.json({ error: "Missing content" }, 400);
      const now = new Date();
      const created = {
        id: crypto.randomUUID(),
        notebookId: body.notebookId,
        userId,
        content,
        createdAt: now,
        updatedAt: now,
      };
      await db.insert(notebookEntry).values(created);
      await db.update(notebook).set({ updatedAt: now }).where(eq(notebook.id, created.notebookId));
      return c.json(created, 201);
    } catch (err: any) {
      return c.json({ error: err.message }, 500);
    }
  })
  .patch("/entries", async (c) => {
    const d1 = env?.DB;
    if (!d1) return c.json({ error: "No D1 DB binding" }, 500);
    const body = (await c.req.json()) as any;
    try {
      if (!body.id) return c.json({ error: "Missing id" }, 400);
      await db
        .update(notebookEntry)
        .set({
          ...(body.content !== undefined ? { content: body.content } : {}),
          updatedAt: new Date(),
        })
        .where(eq(notebookEntry.id, body.id));
      if (body.notebookId) {
        await db
          .update(notebook)
          .set({ updatedAt: new Date() })
          .where(eq(notebook.id, body.notebookId));
      }
      return c.json({ success: true });
    } catch (err: any) {
      return c.json({ error: err.message }, 500);
    }
  })
  .delete("/entries", async (c) => {
    const d1 = env?.DB;
    if (!d1) return c.json({ error: "No D1 DB binding" }, 500);
    const id = c.req.query("id");
    const notebookId = c.req.query("notebookId");
    if (!id) return c.json({ error: "Missing id" }, 400);
    try {
      await db.delete(notebookEntry).where(eq(notebookEntry.id, id));
      if (notebookId) {
        await db.update(notebook).set({ updatedAt: new Date() }).where(eq(notebook.id, notebookId));
      }
      return c.json({ success: true });
    } catch (err: any) {
      return c.json({ error: err.message }, 500);
    }
  });

export default app;
