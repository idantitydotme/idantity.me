import { Hono } from "hono"
import { auth } from "@/auth/auth"
import { db } from "@/db"
import {
  pages,
  pageDrafts,
  pageDraftLocks,
  pageTemplates,
  pageVersions,
  pageVersionApprovals
} from "@/db/schema"
import { eq, and, desc, isNull } from "drizzle-orm"
import {
  validateServerBlockPayload,
  getSiteSettings,
  updateSiteSettings,
  handleCmsMcpRequest,
  generatePreviewToken,
  diffPageSnapshots,
  indexPageForSearch,
  getTaxonomyTerms,
  getTerm,
  getEntryTerms,
  assignEntryTerms,
  createTerm,
  updateTerm,
  deleteTerm,
  getBylines,
  getByline,
  createByline,
  updateByline,
  deleteByline
} from "@rimelight/cms"

const cms = new Hono()

async function checkApprovalRequirements(pageId: string, userId: string, userRoles: string[]) {
  // Get the page to check its template
  const page = await db.select().from(pages).where(eq(pages.id, pageId)).limit(1)
  if (!page[0] || !page[0].templateId) {
    // No template = no approval requirements
    return { canPublish: true, reason: null }
  }

  // Get template approval rules
  const template = await db
    .select()
    .from(pageTemplates)
    .where(eq(pageTemplates.id, page[0].templateId))
    .limit(1)
  if (!template[0]) {
    return { canPublish: true, reason: null }
  }

  const approvalRules = template[0].approvalRules || { allowSelfApproval: true, minApprovals: 1 }
  const minApprovals = approvalRules.minApprovals ?? 1

  // Get existing approvals for this page's latest pending version
  const lastVersion = await db
    .select()
    .from(pageVersions)
    .where(eq(pageVersions.pageId, pageId))
    .orderBy(desc(pageVersions.versionNumber))
    .limit(1)

  let existingApprovals: any[] = []
  if (lastVersion[0]) {
    existingApprovals = await db
      .select()
      .from(pageVersionApprovals)
      .where(eq(pageVersionApprovals.versionId, lastVersion[0].id))
      .limit(10)
  }

  // Check if user has required role for approval
  const requiredRoles = template[0].rolePermissions?.whoCanReview?.length
    ? template[0].rolePermissions.whoCanReview
    : approvalRules.requiredRolesForApproval

  // System owners and admins can always review & publish
  const isOwnerOrAdmin = userRoles.some((role) => ["owner", "admin"].includes(role.toLowerCase()))

  if (isOwnerOrAdmin) {
    return { canPublish: true, reason: null }
  }

  if (requiredRoles && requiredRoles.length > 0) {
    const hasRequiredRole = userRoles.some((role) => requiredRoles.includes(role))
    if (!hasRequiredRole) {
      return { canPublish: false, reason: "User does not have required role for approval" }
    }
  }

  // Check self-approval restriction
  const userAlreadyApproved = existingApprovals.some((a) => a.userId === userId)
  if (!approvalRules.allowSelfApproval && userAlreadyApproved) {
    // Need at least one other approval
    const otherApprovals = existingApprovals.filter((a) => a.userId !== userId)
    if (otherApprovals.length < minApprovals) {
      return {
        canPublish: false,
        reason: `Self-approval not allowed. Need ${minApprovals} distinct approvers.`
      }
    }
  }

  // Check minimum approval count
  const effectiveApprovals = approvalRules.allowSelfApproval
    ? existingApprovals.length
    : existingApprovals.filter((a) => a.userId !== userId).length

  if (effectiveApprovals < minApprovals) {
    return {
      canPublish: false,
      reason: `Need ${minApprovals} approvals, currently have ${effectiveApprovals}`
    }
  }

  return { canPublish: true, reason: null }
}

// Templates
cms.get("/templates", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session) return c.json({ error: "Unauthorized" }, 401)

  const templates = await db.select().from(pageTemplates).orderBy(desc(pageTemplates.createdAt))
  return c.json({ templates })
})

cms.post("/templates", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session) return c.json({ error: "Unauthorized" }, 401)

  const body = await c.req.json()
  const rolePermissions = body.rolePermissions || {
    whoCanCreate: body.allowedRoles || [],
    whoCanEdit: [],
    whoCanReview: [],
    whoCanView: []
  }
  const allowedRoles = rolePermissions.whoCanCreate || body.allowedRoles || []

  const template = await db
    .insert(pageTemplates)
    .values({
      ...body,
      allowedRoles,
      rolePermissions,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    .returning()

  return c.json({ template: template[0] })
})

cms.put("/templates/:id", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session) return c.json({ error: "Unauthorized" }, 401)

  const id = c.req.param("id")
  const body = await c.req.json()

  const updateData = { ...body, updatedAt: new Date() }
  if (body.rolePermissions?.whoCanCreate) {
    updateData.allowedRoles = body.rolePermissions.whoCanCreate
  }

  const template = await db
    .update(pageTemplates)
    .set(updateData)
    .where(eq(pageTemplates.id, id))
    .returning()

  return c.json({ template: template[0] })
})

cms.delete("/templates/:id", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session) return c.json({ error: "Unauthorized" }, 401)

  const id = c.req.param("id")
  await db.delete(pageTemplates).where(eq(pageTemplates.id, id))

  return c.json({ success: true })
})

// Versions
cms.get("/versions", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session) return c.json({ error: "Unauthorized" }, 401)

  const versionsList = await db
    .select()
    .from(pageVersions)
    .orderBy(desc(pageVersions.createdAt))
    .limit(50)

  // Join with pages to get page title/slug
  const versionsWithPage = await Promise.all(
    versionsList.map(async (version: any) => {
      const page = await db
        .select({ title: pages.title, slug: pages.slug })
        .from(pages)
        .where(eq(pages.id, version.pageId))
        .limit(1)
      return Object.assign({}, version, {
        pageTitle: page[0]?.title || "Unknown Page",
        slug: page[0]?.slug || ""
      })
    })
  )

  return c.json({ versions: versionsWithPage })
})

// Pages
cms.get("/pages", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session) return c.json({ error: "Unauthorized" }, 401)

  const pagesList = await db
    .select()
    .from(pages)
    .where(isNull(pages.deletedAt))
    .orderBy(desc(pages.createdAt))

  // Ensure content is returned as an object, not a string
  const pagesData = pagesList.map((page: any) =>
    Object.assign({}, page, {
      content: typeof page.content === "string" ? JSON.parse(page.content) : page.content
    })
  )

  return c.json({ pages: pagesData })
})

cms.get("/pages/:id", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session) return c.json({ error: "Unauthorized" }, 401)

  const id = c.req.param("id")
  const page = await db.select().from(pages).where(eq(pages.id, id)).limit(1)

  if (!page[0]) return c.json({ error: "Page not found" }, 404)

  const draft = await db.select().from(pageDrafts).where(eq(pageDrafts.pageId, id)).limit(1)

  // Ensure content is returned as an object, not a string
  const pageData = {
    ...page[0],
    content: typeof page[0].content === "string" ? JSON.parse(page[0].content) : page[0].content
  }

  const draftData = draft[0]
    ? {
        ...draft[0],
        content:
          typeof draft[0].content === "string" ? JSON.parse(draft[0].content) : draft[0].content
      }
    : null

  return c.json({ page: pageData, draft: draftData })
})

cms.post("/pages", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session) return c.json({ error: "Unauthorized" }, 401)

  const body = await c.req.json()

  // Clean up templateId: convert empty string / "null" / falsy to null
  const templateId =
    body.templateId && body.templateId !== "null" && String(body.templateId).trim() !== ""
      ? String(body.templateId).trim()
      : null

  // Ensure title and description are Localized objects
  const title =
    typeof body.title === "string" ? { en: body.title } : body.title || { en: "Untitled Page" }
  const description =
    typeof body.description === "string" ? { en: body.description } : body.description || null

  let initialBlocks = body.content?.blocks
  let templateVersion = body.templateVersion || 1

  // If a templateId is specified, fetch the template and initialize template blocks if needed
  if (templateId) {
    const tmpl = await db
      .select()
      .from(pageTemplates)
      .where(eq(pageTemplates.id, templateId))
      .limit(1)
    if (tmpl[0]) {
      templateVersion = tmpl[0].version
      if (!initialBlocks || initialBlocks.length === 0) {
        initialBlocks = tmpl[0].initialBlocks || []
      }
    }
  }

  if (!initialBlocks || initialBlocks.length === 0) {
    initialBlocks = [
      {
        id: crypto.randomUUID(),
        type: "ParagraphBlock",
        props: { text: { en: "Start writing your content..." } }
      }
    ]
  }

  const pageContent = {
    blocks: initialBlocks,
    properties: body.content?.properties || {}
  }

  const page = await db
    .insert(pages)
    .values({
      slug: body.slug,
      type: body.type || "blog",
      title,
      description,
      templateId,
      templateVersion,
      content: pageContent,
      authorIds: [session.user.id],
      createdAt: new Date(),
      updatedAt: new Date()
    })
    .returning()

  if (!page[0]) return c.json({ error: "Failed to create page" }, 500)

  // Create initial draft
  await db.insert(pageDrafts).values({
    pageId: page[0].id,
    content: pageContent,
    updatedBy: session.user.id,
    updatedAt: new Date()
  })

  return c.json({ page: page[0] })
})

cms.put("/pages/:id", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session) return c.json({ error: "Unauthorized" }, 401)

  const id = c.req.param("id")
  const body = await c.req.json()

  const existingPage = await db.select().from(pages).where(eq(pages.id, id)).limit(1)
  if (!existingPage[0]) return c.json({ error: "Page not found" }, 404)

  // Validate block changes
  const incomingContent = typeof body.content === "string" ? JSON.parse(body.content) : body.content
  if (incomingContent?.blocks) {
    const existingContent =
      typeof existingPage[0].content === "string"
        ? JSON.parse(existingPage[0].content)
        : existingPage[0].content

    const userSession = {
      userId: session.user.id,
      roles: session.user.role ? [session.user.role] : [],
      permissions: []
    }

    const validation = validateServerBlockPayload(
      existingContent.blocks || [],
      incomingContent.blocks || [],
      userSession
    )
    if (!validation.valid) {
      return c.json({ error: validation.reason }, 403)
    }
  }

  const page = await db
    .update(pages)
    .set({ ...body, updatedAt: new Date() })
    .where(eq(pages.id, id))
    .returning()

  return c.json({ page: page[0] })
})

cms.delete("/pages/:id", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session) return c.json({ error: "Unauthorized" }, 401)

  const id = c.req.param("id")
  await db.update(pages).set({ deletedAt: new Date() }).where(eq(pages.id, id))

  return c.json({ success: true })
})

// Drafts
cms.post("/pages/:id/draft", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session) return c.json({ error: "Unauthorized" }, 401)

  const id = c.req.param("id")
  const body = await c.req.json()

  const existingPage = await db.select().from(pages).where(eq(pages.id, id)).limit(1)
  if (!existingPage[0]) return c.json({ error: "Page not found" }, 404)

  const existingDraft = await db.select().from(pageDrafts).where(eq(pageDrafts.pageId, id)).limit(1)

  // Validate block changes against existing draft or page content
  const incomingContent = typeof body.content === "string" ? JSON.parse(body.content) : body.content
  if (incomingContent?.blocks) {
    const baseContent = existingDraft[0]?.content || existingPage[0].content
    const existingContent = typeof baseContent === "string" ? JSON.parse(baseContent) : baseContent

    const userSession = {
      userId: session.user.id,
      roles: session.user.role ? [session.user.role] : [],
      permissions: []
    }

    const validation = validateServerBlockPayload(
      existingContent?.blocks || [],
      incomingContent.blocks || [],
      userSession
    )
    if (!validation.valid) {
      console.warn(`[Draft Save Rejected] ${validation.reason}`)
      return c.json({ error: validation.reason, message: validation.reason }, 403)
    }
  }

  let draftPayload: any = incomingContent
  if (draftPayload && draftPayload.content) {
    draftPayload = draftPayload.content
  }
  if (Array.isArray(draftPayload)) {
    draftPayload = { blocks: draftPayload, properties: {} }
  }
  if (!draftPayload || !Array.isArray(draftPayload.blocks)) {
    draftPayload = {
      blocks: incomingContent?.blocks || [],
      properties: incomingContent?.properties || {}
    }
  }

  await db
    .insert(pageDrafts)
    .values({
      pageId: id,
      content: draftPayload,
      updatedBy: session.user.id,
      updatedAt: new Date()
    })
    .onConflictDoUpdate({
      target: pageDrafts.pageId,
      set: {
        content: draftPayload,
        updatedBy: session.user.id,
        updatedAt: new Date()
      }
    })

  return c.json({ success: true })
})

// Draft Locks
cms.post("/pages/:id/lock/checkout", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session) return c.json({ error: "Unauthorized" }, 401)

  const id = c.req.param("id")

  const existingLock = await db
    .select()
    .from(pageDraftLocks)
    .where(eq(pageDraftLocks.pageId, id))
    .limit(1)

  if (existingLock[0]) {
    const isExpired = new Date(existingLock[0].expiresAt) < new Date()
    if (!isExpired) {
      return c.json({
        success: false,
        lockedByUserId: existingLock[0].lockedByUserId,
        lockedByUserName: existingLock[0].lockedByUserName,
        expiresAt: existingLock[0].expiresAt
      })
    }
  }

  const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

  await db
    .insert(pageDraftLocks)
    .values({
      pageId: id,
      lockedByUserId: session.user.id,
      lockedByUserName: session.user.name,
      acquiredAt: new Date(),
      expiresAt
    })
    .onConflictDoUpdate({
      target: pageDraftLocks.pageId,
      set: {
        lockedByUserId: session.user.id,
        lockedByUserName: session.user.name,
        acquiredAt: new Date(),
        expiresAt
      }
    })

  return c.json({ success: true })
})

cms.post("/pages/:id/lock/heartbeat", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session) return c.json({ error: "Unauthorized" }, 401)

  const id = c.req.param("id")

  const existingLock = await db
    .select()
    .from(pageDraftLocks)
    .where(eq(pageDraftLocks.pageId, id))
    .limit(1)

  if (existingLock[0] && existingLock[0].lockedByUserId !== session.user.id) {
    const isExpired = new Date(existingLock[0].expiresAt) < new Date()
    if (!isExpired) {
      return c.json({ error: "Forbidden: Lock held by another user" }, 403)
    }
  }

  const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

  await db
    .update(pageDraftLocks)
    .set({
      lockedByUserId: session.user.id,
      lockedByUserName: session.user.name,
      expiresAt
    })
    .where(eq(pageDraftLocks.pageId, id))

  return c.json({ success: true })
})

cms.post("/pages/:id/lock/release", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session) return c.json({ error: "Unauthorized" }, 401)

  const id = c.req.param("id")
  await db
    .delete(pageDraftLocks)
    .where(and(eq(pageDraftLocks.pageId, id), eq(pageDraftLocks.lockedByUserId, session.user.id)))

  return c.json({ success: true })
})

// Versions
cms.post("/pages/:id/publish", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session) return c.json({ error: "Unauthorized" }, 401)

  const id = c.req.param("id")
  const body = await c.req.json()

  const page = await db.select().from(pages).where(eq(pages.id, id)).limit(1)
  if (!page[0]) return c.json({ error: "Page not found" }, 404)

  // Check approval requirements
  const userRoles = session.user.role ? [session.user.role] : []
  const approvalCheck = await checkApprovalRequirements(id, session.user.id, userRoles)
  if (!approvalCheck.canPublish) {
    return c.json({ error: approvalCheck.reason }, 403)
  }

  // Get current version number
  const lastVersion = await db
    .select()
    .from(pageVersions)
    .where(eq(pageVersions.pageId, id))
    .orderBy(desc(pageVersions.versionNumber))
    .limit(1)

  const nextVersionNumber = (lastVersion[0]?.versionNumber || 0) + 1

  // Create new version
  const version = await db
    .insert(pageVersions)
    .values({
      pageId: id,
      versionNumber: nextVersionNumber,
      status: "published",
      slug: page[0].slug,
      type: page[0].type,
      title: page[0].title,
      description: page[0].description,
      tags: page[0].tags,
      authorIds: page[0].authorIds,
      content: body.content,
      createdBy: session.user.id,
      approvedBy: [session.user.id],
      approvedAt: new Date(),
      changeSummary: body.changeSummary,
      createdAt: new Date()
    })
    .returning()

  if (!version[0]) return c.json({ error: "Failed to create version" }, 500)

  // Record this approval
  await db.insert(pageVersionApprovals).values({
    versionId: version[0].id,
    userId: session.user.id,
    userRole: session.user.role || "member",
    approvedAt: new Date()
  })

  // Update page with published version
  await db
    .update(pages)
    .set({
      content: body.content,
      publishedVersionId: version[0].id,
      postedAt: new Date(),
      updatedAt: new Date()
    })
    .where(eq(pages.id, id))

  // Trigger automated search indexer
  await indexPageForSearch(db, { id, title: page[0].title, content: body.content }, ["en", "pt"])

  return c.json({ version: version[0] })
})

// Guest Preview Tokens
cms.post("/pages/:id/preview-token", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session) return c.json({ error: "Unauthorized" }, 401)

  const id = c.req.param("id")
  const page = await db.select().from(pages).where(eq(pages.id, id)).limit(1)
  if (!page[0]) return c.json({ error: "Page not found" }, 404)

  const secret = process.env.BETTER_AUTH_SECRET || "rimelight-preview-secret-key"
  const { token, expiresAt } = await generatePreviewToken(id, secret, 86400 * 7) // 7 days

  return c.json({
    token,
    expiresAt,
    previewUrl: `/en/cms/pages/${id}/preview?token=${encodeURIComponent(token)}`
  })
})

// Visual Revision Diffs
cms.get("/pages/:id/diff", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session) return c.json({ error: "Unauthorized" }, 401)

  const id = c.req.param("id")
  const fromVersionNum = c.req.query("from")
  const toVersionNum = c.req.query("to")

  const page = await db.select().from(pages).where(eq(pages.id, id)).limit(1)
  if (!page[0]) return c.json({ error: "Page not found" }, 404)

  let fromSnapshot: any = page[0]
  if (fromVersionNum) {
    const v = await db
      .select()
      .from(pageVersions)
      .where(
        and(
          eq(pageVersions.pageId, id),
          eq(pageVersions.versionNumber, parseInt(fromVersionNum, 10))
        )
      )
      .limit(1)
    if (v[0]) fromSnapshot = v[0]
  }

  let toSnapshot: any = null
  if (toVersionNum) {
    const v = await db
      .select()
      .from(pageVersions)
      .where(
        and(eq(pageVersions.pageId, id), eq(pageVersions.versionNumber, parseInt(toVersionNum, 10)))
      )
      .limit(1)
    if (v[0]) toSnapshot = v[0]
  } else {
    // Default to active draft
    const draft = await db.select().from(pageDrafts).where(eq(pageDrafts.pageId, id)).limit(1)
    toSnapshot = draft[0] ? { ...page[0], content: draft[0].content } : page[0]
  }

  const parseJson = (val: any) => (typeof val === "string" ? JSON.parse(val) : val)
  fromSnapshot = { ...fromSnapshot, content: parseJson(fromSnapshot.content) }
  toSnapshot = { ...toSnapshot, content: parseJson(toSnapshot.content) }

  const diffResult = diffPageSnapshots(fromSnapshot, toSnapshot)
  return c.json({ diff: diffResult })
})

// Approvals
cms.post("/versions/:versionId/approve", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session) return c.json({ error: "Unauthorized" }, 401)

  const versionId = c.req.param("versionId")

  // Check if version exists
  const version = await db
    .select()
    .from(pageVersions)
    .where(eq(pageVersions.id, versionId))
    .limit(1)
  if (!version[0]) return c.json({ error: "Version not found" }, 404)

  // Check if user already approved
  const existingApproval = await db
    .select()
    .from(pageVersionApprovals)
    .where(
      and(
        eq(pageVersionApprovals.versionId, versionId),
        eq(pageVersionApprovals.userId, session.user.id)
      )
    )
    .limit(1)

  if (existingApproval[0]) {
    return c.json({ error: "Already approved" }, 400)
  }

  // Add approval
  await db.insert(pageVersionApprovals).values({
    versionId,
    userId: session.user.id,
    userRole: session.user.role || "member",
    approvedAt: new Date()
  })

  // Update version's approvedBy array
  const allApprovals = await db
    .select()
    .from(pageVersionApprovals)
    .where(eq(pageVersionApprovals.versionId, versionId))

  await db
    .update(pageVersions)
    .set({
      approvedBy: allApprovals.map((a: any) => a.userId),
      approvedAt: new Date()
    })
    .where(eq(pageVersions.id, versionId))

  return c.json({ success: true })
})

// Site Settings
cms.get("/settings", async (c) => {
  const settings = await getSiteSettings(db)
  return c.json({ settings })
})

cms.put("/settings", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session) return c.json({ error: "Unauthorized" }, 401)
  const isOwnerOrAdmin = ["owner", "admin"].includes(session.user.role?.toLowerCase() || "")
  if (!isOwnerOrAdmin) return c.json({ error: "Forbidden" }, 403)

  const body = await c.req.json()
  const updated = await updateSiteSettings(db, body)
  return c.json({ settings: updated })
})

// Taxonomies
cms.get("/taxonomies/:taxonomy/terms", async (c) => {
  const taxonomy = c.req.param("taxonomy")
  const includeCounts = c.req.query("includeCounts") !== "false"
  const terms = await getTaxonomyTerms(db, taxonomy, { includeCounts })
  return c.json(terms)
})

cms.post("/taxonomies/:taxonomy/terms", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session) return c.json({ error: "Unauthorized" }, 401)

  const taxonomy = c.req.param("taxonomy")
  const body = await c.req.json()
  const term = await createTerm(db, { ...body, taxonomy })
  return c.json(term, 201)
})

cms.get("/taxonomies/:taxonomy/terms/:slug", async (c) => {
  const taxonomy = c.req.param("taxonomy")
  const slug = c.req.param("slug")
  const term = await getTerm(db, taxonomy, slug)
  if (!term) return c.json({ error: "Term not found" }, 404)
  return c.json(term)
})

cms.put("/taxonomies/:taxonomy/terms/:id", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session) return c.json({ error: "Unauthorized" }, 401)

  const id = c.req.param("id")
  const body = await c.req.json()
  const updated = await updateTerm(db, id, body)
  return c.json(updated)
})

cms.delete("/taxonomies/:taxonomy/terms/:id", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session) return c.json({ error: "Unauthorized" }, 401)

  const id = c.req.param("id")
  await deleteTerm(db, id)
  return c.json({ success: true })
})

cms.get("/pages/:id/terms", async (c) => {
  const id = c.req.param("id")
  const taxonomy = c.req.query("taxonomy")
  const terms = await getEntryTerms(db, id, taxonomy)
  return c.json({ terms })
})

cms.post("/pages/:id/terms/:taxonomy", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session) return c.json({ error: "Unauthorized" }, 401)

  const id = c.req.param("id")
  const taxonomy = c.req.param("taxonomy")
  const body = await c.req.json()
  const termIds = Array.isArray(body.termIds) ? body.termIds : []

  await assignEntryTerms(db, id, taxonomy, termIds)
  return c.json({ success: true })
})

// Bylines Management
cms.get("/bylines", async (c) => {
  const allBylines = await getBylines(db)
  return c.json(allBylines)
})

cms.post("/bylines", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session) return c.json({ error: "Unauthorized" }, 401)

  const body = await c.req.json()
  const byline = await createByline(db, body)
  return c.json(byline, 201)
})

cms.get("/bylines/:id", async (c) => {
  const id = c.req.param("id")
  const byline = await getByline(db, id)
  if (!byline) return c.json({ error: "Byline not found" }, 404)
  return c.json(byline)
})

cms.put("/bylines/:id", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session) return c.json({ error: "Unauthorized" }, 401)

  const id = c.req.param("id")
  const body = await c.req.json()
  const updated = await updateByline(db, id, body)
  if (!updated) return c.json({ error: "Byline not found" }, 404)
  return c.json(updated)
})

cms.delete("/bylines/:id", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session) return c.json({ error: "Unauthorized" }, 401)

  const id = c.req.param("id")
  await deleteByline(db, id)
  return c.json({ success: true })
})

// MCP JSON-RPC Endpoint
cms.post("/mcp", async (c) => {
  const body = await c.req.json()
  const result = await handleCmsMcpRequest(body, db)
  return c.json(result)
})

export default cms
