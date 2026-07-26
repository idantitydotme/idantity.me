import { Hono } from "hono"

const api = new Hono()

api.get("/changelog", async (c) => {
  const component = c.req.query("component")
  if (!component) {
    return c.json({ error: "Component name is required" }, 400)
  }

  const pascalName = component
    .split("-")
    .map((seg) => seg.charAt(0).toUpperCase() + seg.slice(1))
    .join("")

  const token = import.meta.env.GITHUB_TOKEN || process.env.GITHUB_TOKEN
  const headers: Record<string, string> = {
    "User-Agent": "Rimelight-Docs-Changelog",
    "Accept": "application/vnd.github.v3+json"
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const paths = [
    `packages/ui/src/components/${component}/RLV${pascalName}.vue`,
    `packages/ui/src/components/${component}/RLA${pascalName}.astro`,
    `packages/ui/src/components/${component}/${component}.theme.ts`
  ]
  try {
    const allCommitsPromises = paths.map(async (p) => {
      const apiUrl = `https://api.github.com/repos/Rimelight-Entertainment/rimelight/commits?path=${encodeURIComponent(p)}&per_page=50`
      const res = await fetch(apiUrl, { headers })
      if (!res.ok) return []
      const data = await res.json()
      if (!Array.isArray(data)) return []
      return data.map((commit: any) => ({
        sha: commit.sha,
        date: commit.commit.author?.date || commit.commit.committer?.date || "",
        message: commit.commit.message.split("\n")[0] || ""
      }))
    })

    const commitsLists = await Promise.all(allCommitsPromises)
    const uniqueCommits = new Map<string, { sha: string; date: string; message: string }>()
    for (const list of commitsLists) {
      for (const commit of list) {
        if (!uniqueCommits.has(commit.sha)) {
          uniqueCommits.set(commit.sha, commit)
        }
      }
    }
    const commits = Array.from(uniqueCommits.values()).toSorted(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )

    if (commits.length === 0) {
      return c.json([])
    }

    const releasesRes = await fetch(
      "https://api.github.com/repos/Rimelight-Entertainment/rimelight/releases?per_page=50",
      { headers }
    )
    let releases = []
    if (releasesRes.ok) {
      const data = await releasesRes.json()
      if (Array.isArray(data)) {
        releases = data.filter((r: any) => r.published_at)
      }
    }

    const sortedReleases = [...releases].toSorted(
      (a: any, b: any) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
    )
    const releasesOldestFirst = [...sortedReleases].toReversed()

    const groups: any[] = []
    const unreleased: any[] = []

    for (const commit of commits) {
      const commitTime = new Date(commit.date).getTime()
      const release = releasesOldestFirst.find(
        (r: any) => new Date(r.published_at).getTime() >= commitTime
      )

      if (release) {
        let group = groups.find((g) => g.tag === release.tag_name)
        if (!group) {
          group = {
            tag: release.tag_name,
            title: release.name || release.tag_name,
            published_at: release.published_at,
            url: release.html_url,
            commits: []
          }
          groups.push(group)
        }
        group.commits.push(commit)
      } else {
        unreleased.push(commit)
      }
    }

    const result: any[] = []
    if (unreleased.length > 0) {
      result.push({
        tag: "unreleased",
        title: "Soon",
        commits: unreleased
      })
    }

    groups.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
    result.push(...groups)

    c.header("Cache-Control", "public, max-age=3600, s-maxage=3600, stale-while-revalidate=600")
    return c.json(result)
  } catch (err) {
    return c.json({ error: String(err) }, 500)
  }
})

export default api
