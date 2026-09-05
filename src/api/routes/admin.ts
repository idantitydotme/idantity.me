import { Hono } from "hono"
import { auth } from "#auth/auth"
import { db } from "#db"
import { user, session, role } from "#db/schema"
import { eq, and, count, desc, isNull, like, or, sql } from "drizzle-orm"

type Env = {
  Variables: {
    user: any
    session: any
  }
}

const adminApi = new Hono<Env>()
const authApi: Record<string, any> = auth.api

// Middleware to ensure user is authenticated as an admin/owner
adminApi.use("*", async (c, next) => {
  try {
    const sessionData = await auth.api.getSession({ headers: c.req.raw.headers })
    if (!sessionData || !sessionData.user) {
      return c.json({ error: "Unauthorized" }, 401)
    }

    const userRole = sessionData.user.role
    if (userRole !== "admin" && userRole !== "owner") {
      return c.json({ error: "Forbidden: Admin access required" }, 403)
    }

    c.set("user", sessionData.user)
    c.set("session", sessionData.session)
    return await next()
  } catch (err: any) {
    return c.json({ error: err.message || "Authorization check failed" }, 500)
  }
})

// 1. Dashboard Stats / Summary
adminApi.get("/stats", async (c) => {
  try {
    const [totalUsersRes] = await db
      .select({ count: count() })
      .from(user)
      .where(isNull(user.deletedAt))

    const [verifiedUsersRes] = await db
      .select({ count: count() })
      .from(user)
      .where(and(isNull(user.deletedAt), eq(user.emailVerified, true)))

    const [unverifiedUsersRes] = await db
      .select({ count: count() })
      .from(user)
      .where(and(isNull(user.deletedAt), eq(user.emailVerified, false)))

    const [bannedUsersRes] = await db
      .select({ count: count() })
      .from(user)
      .where(and(isNull(user.deletedAt), eq(user.banned, true)))

    let totalRolesRes = { count: 5 }
    try {
      const [res] = await db.select({ count: count() }).from(role).where(isNull(role.deletedAt))
      if (res) totalRolesRes = res
    } catch (err) {
      console.warn("role query skipped in admin.ts:", err)
    }

    const [activeSessionsRes] = await db.select({ count: count() }).from(session)

    // Recent 5 registered users
    const recentUsers = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
        banned: user.banned,
        createdAt: user.createdAt,
        image: user.image
      })
      .from(user)
      .where(isNull(user.deletedAt))
      .orderBy(desc(user.createdAt))
      .limit(5)

    // Role breakdown
    const roleCounts = await db
      .select({
        roleName: user.role,
        userCount: count()
      })
      .from(user)
      .where(isNull(user.deletedAt))
      .groupBy(user.role)

    return c.json({
      stats: {
        totalUsers: totalUsersRes?.count ?? 0,
        verifiedUsers: verifiedUsersRes?.count ?? 0,
        unverifiedUsers: unverifiedUsersRes?.count ?? 0,
        bannedUsers: bannedUsersRes?.count ?? 0,
        totalRoles: totalRolesRes?.count ?? 0,
        activeSessions: activeSessionsRes?.count ?? 0
      },
      recentUsers,
      roleCounts
    })
  } catch (error: any) {
    console.error("Admin stats error:", error)
    return c.json({ error: error.message || "Failed to fetch admin stats" }, 500)
  }
})

// 2. List Users with Search and Pagination
adminApi.get("/users", async (c) => {
  try {
    const search = c.req.query("search") || ""
    const roleFilter = c.req.query("role") || ""
    const statusFilter = c.req.query("status") || ""

    let conditions: any[] = [isNull(user.deletedAt)]

    if (search) {
      const term = `%${search.toLowerCase()}%`
      conditions.push(
        or(like(sql`LOWER(${user.name})`, term), like(sql`LOWER(${user.email})`, term))
      )
    }

    if (roleFilter && roleFilter !== "all") {
      conditions.push(eq(user.role, roleFilter))
    }

    if (statusFilter === "verified") {
      conditions.push(eq(user.emailVerified, true))
    } else if (statusFilter === "unverified") {
      conditions.push(eq(user.emailVerified, false))
    } else if (statusFilter === "banned") {
      conditions.push(eq(user.banned, true))
    }

    const whereClause = and(...conditions)

    const usersList = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
        banned: user.banned,
        banReason: user.banReason,
        firstName: user.firstName,
        lastName: user.lastName,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        image: user.image
      })
      .from(user)
      .where(whereClause)
      .orderBy(desc(user.createdAt))

    return c.json({ users: usersList })
  } catch (error: any) {
    console.error("Admin list users error:", error)
    return c.json({ error: error.message || "Failed to fetch users" }, 500)
  }
})

// 3. Create User
adminApi.post("/users", async (c) => {
  try {
    const body = await c.req.json()
    const { name, email, password, role: targetRole, firstName, lastName } = body

    if (!email || !password || !name) {
      return c.json({ error: "Name, email, and password are required" }, 400)
    }

    // Check if email already exists
    const existing = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.email, email.toLowerCase()))
      .limit(1)

    if (existing.length > 0) {
      return c.json({ error: "User with this email already exists" }, 400)
    }

    // Call Better Auth createUser or signUpEmail
    let newUser: any = null
    try {
      if (authApi.createUser) {
        newUser = await authApi.createUser({
          body: {
            email: email.toLowerCase(),
            password,
            name,
            role: targetRole || "user",
            firstName: firstName || name.split(" ")[0] || "",
            lastName: lastName || name.split(" ").slice(1).join(" ") || ""
          },
          headers: c.req.raw.headers
        })
      }
    } catch (createErr: any) {
      console.warn("auth.api.createUser failed, falling back to signUpEmail:", createErr?.message)
    }

    if (!newUser) {
      // Fallback: Use signUpEmail then update role
      newUser = await auth.api.signUpEmail({
        body: {
          email: email.toLowerCase(),
          password,
          name,
          firstName: firstName || name.split(" ")[0] || "",
          lastName: lastName || name.split(" ").slice(1).join(" ") || ""
        },
        headers: c.req.raw.headers
      })

      if (targetRole && targetRole !== "user" && newUser?.user?.id) {
        await db.update(user).set({ role: targetRole }).where(eq(user.id, newUser.user.id))
      }
    }

    return c.json({ success: true, user: newUser })
  } catch (error: any) {
    console.error("Admin create user error:", error)
    return c.json({ error: error.message || "Failed to create user" }, 500)
  }
})

// 4. Delete User
adminApi.delete("/users/:id", async (c) => {
  try {
    const userId = c.req.param("id")
    const currentUser = c.get("user")

    if (userId === currentUser.id) {
      return c.json({ error: "Cannot delete your own admin account" }, 400)
    }

    // Check if target user exists
    const targetUser = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1)

    if (targetUser.length === 0) {
      return c.json({ error: "User not found" }, 404)
    }

    // Try Better Auth admin removeUser endpoint first
    try {
      if (authApi.removeUser) {
        await authApi.removeUser({
          body: { userId },
          headers: c.req.raw.headers
        })
      } else {
        await db.update(user).set({ deletedAt: new Date() }).where(eq(user.id, userId))
      }
    } catch {
      // Soft delete in database
      await db.update(user).set({ deletedAt: new Date() }).where(eq(user.id, userId))
    }

    // Delete active sessions for the deleted user
    await db.delete(session).where(eq(session.userId, userId))

    return c.json({ success: true })
  } catch (error: any) {
    console.error("Admin delete user error:", error)
    return c.json({ error: error.message || "Failed to delete user" }, 500)
  }
})

// 5. Resend Confirmation Email
adminApi.post("/users/:id/resend-verification", async (c) => {
  try {
    const userId = c.req.param("id")

    const targetUser = await db
      .select({ id: user.id, email: user.email, emailVerified: user.emailVerified })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1)

    const target = targetUser[0]

    if (!target) {
      return c.json({ error: "User not found" }, 404)
    }

    if (target.emailVerified) {
      return c.json({ error: "User email is already verified" }, 400)
    }

    // Trigger Better Auth verification email
    await auth.api.sendVerificationEmail({
      body: {
        email: target.email
      },
      headers: c.req.raw.headers
    })

    return c.json({ success: true, message: `Verification email sent to ${target.email}` })
  } catch (error: any) {
    console.error("Admin resend verification error:", error)
    return c.json({ error: error.message || "Failed to resend verification email" }, 500)
  }
})

// 6. Set User Role
adminApi.post("/users/:id/role", async (c) => {
  try {
    const userId = c.req.param("id")
    const body = await c.req.json()
    const { role: newRole } = body

    if (!newRole) {
      return c.json({ error: "Role is required" }, 400)
    }

    const targetUser = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1)

    if (targetUser.length === 0) {
      return c.json({ error: "User not found" }, 404)
    }

    // Attempt Better Auth setRole plugin call or DB update
    try {
      if (authApi.setRole) {
        await authApi.setRole({
          body: { userId, role: newRole },
          headers: c.req.raw.headers
        })
      } else {
        await db.update(user).set({ role: newRole }).where(eq(user.id, userId))
      }
    } catch {
      await db.update(user).set({ role: newRole }).where(eq(user.id, userId))
    }

    return c.json({ success: true, role: newRole })
  } catch (error: any) {
    console.error("Admin set role error:", error)
    return c.json({ error: error.message || "Failed to set user role" }, 500)
  }
})

// 7. Ban / Unban User
adminApi.post("/users/:id/ban", async (c) => {
  try {
    const userId = c.req.param("id")
    const body = await c.req.json()
    const { ban, banReason } = body

    const targetUser = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1)

    if (targetUser.length === 0) {
      return c.json({ error: "User not found" }, 404)
    }

    const isBan = Boolean(ban)

    if (isBan) {
      try {
        if (authApi.banUser) {
          await authApi.banUser({
            body: { userId, banReason: banReason || "Banned by administrator" },
            headers: c.req.raw.headers
          })
        } else {
          await db
            .update(user)
            .set({ banned: true, banReason: banReason || "Banned by administrator" })
            .where(eq(user.id, userId))
        }
      } catch {
        await db
          .update(user)
          .set({ banned: true, banReason: banReason || "Banned by administrator" })
          .where(eq(user.id, userId))
      }

      // Revoke user sessions when banned
      await db.delete(session).where(eq(session.userId, userId))
    } else {
      try {
        if (authApi.unbanUser) {
          await authApi.unbanUser({
            body: { userId },
            headers: c.req.raw.headers
          })
        } else {
          await db
            .update(user)
            .set({ banned: false, banReason: null, banExpires: null })
            .where(eq(user.id, userId))
        }
      } catch {
        await db
          .update(user)
          .set({ banned: false, banReason: null, banExpires: null })
          .where(eq(user.id, userId))
      }
    }

    return c.json({ success: true, banned: isBan })
  } catch (error: any) {
    console.error("Admin ban/unban error:", error)
    return c.json({ error: error.message || "Failed to update ban status" }, 500)
  }
})

// 8. Active Sessions Management
adminApi.get("/sessions", async (c) => {
  try {
    const activeSessions = await db
      .select({
        id: session.id,
        userId: session.userId,
        userName: user.name,
        userEmail: user.email,
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
        expiresAt: session.expiresAt,
        createdAt: session.createdAt
      })
      .from(session)
      .innerJoin(user, eq(session.userId, user.id))
      .orderBy(desc(session.createdAt))

    return c.json({ sessions: activeSessions })
  } catch (error: any) {
    console.error("Admin list sessions error:", error)
    return c.json({ error: error.message || "Failed to fetch sessions" }, 500)
  }
})

// 9. Get User Sessions
adminApi.get("/users/:userId/sessions", async (c) => {
  try {
    const userId = c.req.param("userId")
    const userSessions = await db
      .select({
        id: session.id,
        userId: session.userId,
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
        expiresAt: session.expiresAt,
        createdAt: session.createdAt
      })
      .from(session)
      .where(eq(session.userId, userId))
      .orderBy(desc(session.createdAt))

    return c.json({ sessions: userSessions })
  } catch (error: any) {
    console.error("Admin list user sessions error:", error)
    return c.json({ error: error.message || "Failed to fetch user sessions" }, 500)
  }
})

// 10. Revoke Session
adminApi.delete("/sessions/:id", async (c) => {
  try {
    const sessionId = c.req.param("id")

    await db.delete(session).where(eq(session.id, sessionId))

    return c.json({ success: true })
  } catch (error: any) {
    console.error("Admin revoke session error:", error)
    return c.json({ error: error.message || "Failed to revoke session" }, 500)
  }
})

// 11. Organization Management Endpoints
adminApi.post("/organizations", async (c) => {
  try {
    const body = await c.req.json()
    const name = String(body.name || "").trim()
    const slug = String(body.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-")).trim()

    if (!name || !slug) {
      return c.json({ error: "Organization name and slug are required" }, 400)
    }

    const { organization } = await import("#db/schema")
    const newOrg = await db
      .insert(organization)
      .values({
        name,
        slug,
        logo: body.logo || null,
        metadata: body.metadata || null,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning()

    return c.json({ organization: newOrg[0] })
  } catch (error: any) {
    console.error("Admin create organization error:", error)
    return c.json({ error: error.message || "Failed to create organization" }, 500)
  }
})

adminApi.delete("/organizations/:id", async (c) => {
  try {
    const id = c.req.param("id")
    const { organization } = await import("#db/schema")

    await db.update(organization).set({ deletedAt: new Date() }).where(eq(organization.id, id))

    return c.json({ success: true })
  } catch (error: any) {
    console.error("Admin delete organization error:", error)
    return c.json({ error: error.message || "Failed to delete organization" }, 500)
  }
})

export default adminApi
