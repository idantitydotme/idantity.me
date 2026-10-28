import { type Component, For, Show, createMemo } from "solid-js";
import { useSearchParams } from "@solidjs/router";
import { useHead } from "@solidjs/web";
import { createSeoHead } from "@rimelight/seo/head";
import { t, getCurrentLocale } from "@rimelight/i18n";
import { RLPageSection, RLGrid } from "@rimelight/ui";
import { content, type PublicEntry, type PublicTerm } from "@rimelight/cms/solid";
import { ProjectCard } from "#components/projects/ProjectCard";

/**
 * Published projects, newest first, filterable by category. Categories are CMS taxonomy
 * terms (managed in the dashboard under Taxonomies → category, or via MCP) — nothing is
 * hardcoded here. The active filter lives in the URL (`?category=website`) so it's linkable.
 */
export const ProjectsIndexPage: Component = () => {
  const [search, setSearch] = useSearchParams<{ category?: string }>();
  const active = () => search.category || "";
  const locale = () => getCurrentLocale();
  const label = (l: PublicTerm["label"]) => (typeof l === "string" ? l : t.localize(l));

  /** Only categories that have published posts. */
  const categories = createMemo<PublicTerm[]>(
    async () => (await content.terms("category")).filter((c) => c.count > 0),
    { loadingValue: [] },
  );

  const posts = createMemo<PublicEntry[]>(
    async () =>
      (
        await content.entries("projects", {
          limit: 50,
          locale: locale(),
          ...(active() ? { taxonomy: "category", term: active() } : {}),
        })
      ).entries,
    { loadingValue: [] },
  );

  useHead(() =>
    createSeoHead({
      title: t("page.projects.meta.title"),
      description: t("page.projects.meta.description"),
    }),
  );

  const chip = (slug: string, text: string, count?: number) => (
    <button
      type="button"
      aria-pressed={active() === slug ? "true" : "false"}
      class={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
        active() === slug
          ? "border-primary-500 bg-primary-500/15 text-primary-300"
          : "border-neutral-800 text-neutral-400 hover:border-neutral-600 hover:text-neutral-200"
      }`}
      onClick={() => setSearch({ category: slug || undefined })}
    >
      {text}
      <Show when={count !== undefined}>
        <span class="ml-1.5 text-xs opacity-60">{count}</span>
      </Show>
    </button>
  );

  return (
    <RLPageSection
      title={t("page.projects.meta.title")}
      description={t("page.projects.meta.description")}
      class="py-16"
    >
      <div class="max-w-7xl mx-auto w-full px-4 mt-8">
        <Show when={categories().length > 0}>
          <nav
            aria-label={t("page.projects.categories.aria-label")}
            class="mb-10 flex flex-wrap justify-center gap-2"
          >
            {chip("", "All")}
            <For each={categories()}>{(c) => chip(c.slug, label(c.label), c.count)}</For>
          </nav>
        </Show>

        <RLGrid cols={3}>
          <For each={posts() || []}>{(post) => <ProjectCard post={post} />}</For>
        </RLGrid>

        <Show when={!posts() || posts()!.length === 0}>
          <p class="text-center text-neutral-500 py-12">{t("page.projects.empty")}</p>
        </Show>
      </div>
    </RLPageSection>
  );
};

export default ProjectsIndexPage;
