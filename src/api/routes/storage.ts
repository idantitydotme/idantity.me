import { Hono } from "hono";
import { db } from "#db";
import { storageFiles } from "#db/schema";
import { eq, desc, inArray, and } from "drizzle-orm";
import { env } from "cloudflare:workers";
import { ownerId } from "#api/lib/owner";
import { PUBLIC_BASE, planMove } from "./storage.logic";
import { parseIds } from "#api/lib/owned.logic";

/** The personal R2 bucket. Object keys and public URLs are unchanged by the move. */
const bucket = (): R2Bucket | undefined => (env as any)?.PERSONAL_BLOB;

const app = new Hono()
  .get("/files", async (c) => {
    const d1 = env?.DB;
    if (!d1) return c.json({ files: [] });
    const userId = ownerId();
    try {
      const list = await db
        .select()
        .from(storageFiles)
        .where(eq(storageFiles.userId, userId))
        .orderBy(desc(storageFiles.uploadedAt));
      const formatted = list.map((f: any) => ({
        ...f,
        name: f.name || f.filename,
      }));
      return c.json({ files: formatted });
    } catch (err: any) {
      return c.json({ error: err.message }, 500);
    }
  })
  .patch("/files", async (c) => {
    const d1 = env?.DB;
    if (!d1) return c.json({ error: "No D1 DB binding" }, 500);
    const userId = ownerId();
    const body = (await c.req.json()) as any;
    if (!body?.id && !body?.key) return c.json({ error: "Missing id or key" }, 400);
    try {
      const [row] = await db
        .select()
        .from(storageFiles)
        .where(
          and(
            eq(storageFiles.userId, userId),
            body.id ? eq(storageFiles.id, body.id) : eq(storageFiles.key, body.key),
          ),
        )
        .limit(1);
      if (!row) return c.json({ error: "Not found" }, 404);

      const plan = planMove({
        currentKey: row.key,
        currentFilename: row.filename,
        basename: body.basename,
        folder: body.folder,
      });
      if (!plan.ok) return c.json({ error: plan.error }, 400);
      const file = {
        id: row.id,
        name: plan.filename,
        key: plan.key,
        url: plan.url,
        size: row.size,
        mimeType: row.mimeType,
      };
      if (!plan.changed) return c.json({ success: true, file });

      const [clash] = await db
        .select({ id: storageFiles.id })
        .from(storageFiles)
        .where(eq(storageFiles.key, plan.key))
        .limit(1);
      if (clash) return c.json({ error: "A file already exists at that path" }, 409);

      // R2 has no rename: copy the object to the new key, then delete the old one.
      const r2 = bucket();
      if (r2) {
        const object = await r2.get(row.key);
        if (object) {
          await r2.put(plan.key, await object.arrayBuffer(), {
            httpMetadata: { contentType: row.mimeType },
          });
          await r2.delete(row.key);
        }
      }
      await db
        .update(storageFiles)
        .set({ key: plan.key, filename: plan.filename, url: plan.url })
        .where(eq(storageFiles.id, row.id));
      return c.json({ success: true, file });
    } catch (err: any) {
      return c.json({ error: err.message }, 500);
    }
  })
  .delete("/files", async (c) => {
    const d1 = env?.DB;
    if (!d1) return c.json({ error: "No D1 DB binding" }, 500);
    const userId = ownerId();
    const idList = parseIds(c.req.query("id"), c.req.query("ids"));
    if (idList.length === 0) return c.json({ error: "Missing id or ids" }, 400);
    try {
      // Owner-scoped: only this owner's rows, and only their R2 objects, are removed.
      const scope = and(eq(storageFiles.userId, userId), inArray(storageFiles.id, idList));
      const rows = await db.select({ key: storageFiles.key }).from(storageFiles).where(scope);
      const r2 = bucket();
      if (r2) {
        for (const row of rows) await r2.delete(row.key);
      }
      await db.delete(storageFiles).where(scope);
      return c.json({ success: true, deleted: rows.length });
    } catch (err: any) {
      return c.json({ error: err.message }, 500);
    }
  })
  .post("/upload", async (c) => {
    const d1 = env?.DB;
    if (!d1) return c.json({ error: "No D1 DB binding" }, 500);
    const userId = ownerId();
    try {
      const formData = await c.req.formData();
      const folder = ((formData.get("folder") as string) || "").replace(/^\/+|\/+$/g, "");
      const customBasename = formData.get("basename") as string;
      // The web sent `file`; the native client sends `files`. Accept both.
      const filesList = [...formData.getAll("file"), ...formData.getAll("files")].filter(
        (f): f is File => f instanceof File,
      );
      if (filesList.length === 0) return c.json({ error: "No files provided" }, 400);

      const r2 = bucket();
      if (!r2) return c.json({ error: "No R2 binding" }, 500);
      const uploadedResults = [];
      for (const file of filesList) {
        const ext = file.name.split(".").pop() || "";
        const base =
          customBasename && filesList.length === 1
            ? customBasename.trim()
            : file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
        const sanitizedBase = base.replace(/[^a-zA-Z0-9._-]/g, "-");
        const finalFileName = ext ? `${sanitizedBase}.${ext}` : sanitizedBase;
        const key = folder ? `${folder}/${finalFileName}` : finalFileName;
        await r2.put(key, await file.arrayBuffer(), { httpMetadata: { contentType: file.type } });
        const newFile = {
          id: crypto.randomUUID(),
          userId,
          filename: finalFileName,
          key,
          url: `${PUBLIC_BASE}/${key}`,
          size: file.size,
          mimeType: file.type,
        };
        await db.insert(storageFiles).values(newFile);
        uploadedResults.push({
          id: newFile.id,
          name: newFile.filename,
          key: newFile.key,
          url: newFile.url,
          size: newFile.size,
          mimeType: newFile.mimeType,
        });
      }
      return c.json({ success: true, files: uploadedResults, file: uploadedResults[0] }, 201);
    } catch (err: any) {
      return c.json({ error: err.message }, 500);
    }
  });

export default app;
