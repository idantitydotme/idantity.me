import { Hono } from "hono"
import { auth } from "@/auth/auth"
import { db } from "@/db"
import { role } from "@/db/schema"
import { eq, isNull, desc } from "drizzle-orm"

const rolesApi = new Hono()

const DEFAULT_ROLES = [
  {
    name: "owner",
    displayName: "Owner",
    description:
      "Primary system and organization owner with complete control over all assets and settings",
    permissions: ["*"]
  },
  {
    name: "admin",
    displayName: "Administrator",
    description: "Full access to manage system settings, users, CMS content, and page templates",
    permissions: [
      "cms:read",
      "cms:write",
      "cms:publish",
      "cms:delete",
      "templates:create",
      "templates:edit",
      "templates:delete",
      "roles:manage"
    ]
  },
  {
    name: "editor",
    displayName: "Editor",
    description: "Can create, edit, publish, and manage CMS pages and content drafts",
    permissions: ["cms:read", "cms:write", "cms:publish", "templates:read"]
  },
  {
    name: "author",
    displayName: "Author",
    description: "Can create and edit their own CMS content drafts",
    permissions: ["cms:read", "cms:write"]
  },
  {
    name: "reviewer",
    displayName: "Reviewer",
    description: "Can review, comment on, and approve pending CMS page versions",
    permissions: ["cms:read", "cms:approve"]
  },
  {
    name: "viewer",
    displayName: "Viewer",
    description: "Read-only access to published CMS pages and content",
    permissions: ["cms:read"]
  },
  {
    name: "user",
    displayName: "User",
    description: "Standard registered account with baseline user access",
    permissions: ["user:read"]
  }
]

// Ensure default roles are seeded in the database
async function seedDefaultRoles() {
  try {
    const existing = await db.select().from(role).limit(1)
    if (existing.length === 0) {
      await Promise.all(
        DEFAULT_ROLES.map((defaultRole) =>
          db
            .insert(role)
            .values({
              ...defaultRole,
              permissions: defaultRole.permissions,
              createdAt: new Date(),
              updatedAt: new Date()
            })
            .onConflictDoNothing()
        )
      )
    }
  } catch (err) {
    console.error("Failed to seed default roles:", err)
  }
}

rolesApi.get("/", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session) return c.json({ error: "Unauthorized" }, 401)

  await seedDefaultRoles()

  const rolesList = await db
    .select()
    .from(role)
    .where(isNull(role.deletedAt))
    .orderBy(desc(role.createdAt))

  const formattedRoles = rolesList.map((r: any) =>
    Object.assign({}, r, {
      permissions: typeof r.permissions === "string" ? JSON.parse(r.permissions) : r.permissions
    })
  )

  return c.json({ roles: formattedRoles })
})

rolesApi.post("/", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session) return c.json({ error: "Unauthorized" }, 401)

  const body = await c.req.json()
  const name = String(body.name || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
  const displayName = String(body.displayName || body.name || "").trim()

  if (!name) {
    return c.json({ error: "Role name is required" }, 400)
  }

  const newRole = await db
    .insert(role)
    .values({
      name,
      displayName,
      description: body.description || "",
      permissions: Array.isArray(body.permissions) ? body.permissions : [],
      createdAt: new Date(),
      updatedAt: new Date()
    })
    .returning()

  return c.json({ role: newRole[0] })
})

rolesApi.put("/:id", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session) return c.json({ error: "Unauthorized" }, 401)

  const id = c.req.param("id")
  const body = await c.req.json()

  const updatedRole = await db
    .update(role)
    .set({
      displayName: body.displayName,
      description: body.description,
      permissions: Array.isArray(body.permissions) ? body.permissions : undefined,
      updatedAt: new Date()
    })
    .where(eq(role.id, id))
    .returning()

  return c.json({ role: updatedRole[0] })
})

rolesApi.delete("/:id", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session) return c.json({ error: "Unauthorized" }, 401)

  const id = c.req.param("id")
  await db.update(role).set({ deletedAt: new Date() }).where(eq(role.id, id))

  return c.json({ success: true })
})

export default rolesApi
