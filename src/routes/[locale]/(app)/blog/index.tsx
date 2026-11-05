import { For, Show, createMemo } from "solid-js";
import { useSearchParams } from "@solidjs/router";
import { useHead } from "@solidjs/web";
import { createPageHead } from "@rimelight/seo/head";
import { t, getCurrentLocale } from "@rimelight/i18n";
import { RLPageSection } from "@rimelight/ui/components/page-section/RLPageSection.tsx";
import { RLGrid } from "@rimelight/ui/components/grid/RLGrid.tsx";
import { RLPost } from "@rimelight/ui/components/post/RLPost.tsx";
import { content, type PublicEntry, type PublicTerm } from "@rimelight/cms/solid";
import { MosaicBackdrop } from "#components/app/MosaicBackdrop";

/**
 * Published blog posts, newest first, filterable by category. Categories are CMS taxonomy
 * terms (managed in the dashboard under Taxonomies → category, or via MCP) — nothing is
 * hardcoded here. The active filter lives in the URL (`?category=engineering`) so it's linkable.
 */
export default function BlogIndexPage() {
  const [search, setSearch] = useSearchParams<{ category?: string }>();
  const active = () => search.category || "";
  const locale = () => getCurrentLocale();
  const label = (l: PublicTerm["label"]) => (typeof l === "string" ? l : t.localize(l));

  /**
   * Categories used by this collection's posts only. Taxonomy term counts are global across
   * collections (projects share the `category` taxonomy), so the tabs are built from the posts.
   */
  const categories = createMemo<PublicTerm[]>(
    async () => {
      const { entries } = await content.entries("blog", { limit: 50, locale: locale() });
      const counts = new Map<string, PublicTerm & { count: number }>();
      for (const entry of entries) {
        for (const term of entry.terms ?? []) {
          if (term.taxonomy !== "category") continue;
          const prev = counts.get(term.slug);
          counts.set(term.slug, {
            taxonomy: term.taxonomy,
            slug: term.slug,
            label: term.label as PublicTerm["label"],
            count: (prev?.count ?? 0) + 1,
          } as PublicTerm & { count: number });
        }
      }
      return [...counts.values()];
    },
    { loadingValue: [] },
  );

  const posts = createMemo<PublicEntry[]>(
    async () =>
      (
        await content.entries("blog", {
          limit: 50,
          locale: locale(),
          ...(active() ? { taxonomy: "category", term: active() } : {}),
        })
      ).entries,
    { loadingValue: [] },
  );

  useHead(() =>
    createPageHead({
      title: t("page.blog.meta.title"),
      description: t("page.blog.meta.description"),
    }),
  );

  const chip = (slug: string, text: string, count?: number) => (
    <button
      type="button"
      aria-pressed={active() === slug ? "true" : "false"}
      class={`relative pb-2 text-sm text-neutral-950 transition-opacity ${active() === slug ? "font-semibold" : "opacity-60 hover:opacity-100"}`}
      onClick={() => setSearch({ category: slug || undefined })}
    >
      {text}
      <Show when={count !== undefined}>
        <span class="ml-1.5 text-xs">{count}</span>
      </Show>
      <span
        class={`absolute inset-x-0 -bottom-px h-0.5 bg-secondary-400 origin-left transition-transform ${active() === slug ? "scale-x-100" : "scale-x-0"}`}
      />
    </button>
  );

  return (
    <RLPageSection
      layout="hero"
      data-theme="light"
      titleSlot={
        <>
          {t("page.blog.heading").split(".")[0]}
          <span class="text-primary">.</span>
          {t("page.blog.heading").split(".")[1]}
        </>
      }
      description={t("page.blog.meta.description")}
      backgroundSlot={<MosaicBackdrop tone="mixed" seed={13} class="opacity-100" />}
      ui={{
        title: (base: string) => base.replace("text-center", "text-left"),
        description: (base: string) => base.replace("text-center", "text-left"),
        root: (base: string) => `${base} text-neutral-950`,
      }}
      bodySlot={
        <div class="max-w-7xl w-full">
          <Show when={categories().length > 0}>
            <nav
              aria-label={t("page.blog.categories.aria-label")}
              class="mb-10 flex flex-wrap justify-start gap-x-6 gap-y-2"
            >
              {chip("", "All")}
              <For each={categories()}>{(c) => chip(c.slug, label(c.label), c.count)}</For>
            </nav>
          </Show>

          <RLGrid cols={3}>
            <For each={posts() || []}>
              {(post) => {
                const category = () => post.terms?.find((x) => x.taxonomy === "category");
                return (
                  <RLPost
                    title={t.localize(post.title)}
                    description={t.localize(post.description ?? {})}
                    date={post.publishedAt ?? undefined}
                    image={post.properties?.["cover"]}
                    href={`/blog/${post.slug}/`}
                    variant="ghost"
                    footerSlot={
                      <Show when={category()}>
                        {(c) => (
                          <span class="font-mono text-xs font-bold text-neutral-950">
                            {typeof c().label === "string"
                              ? (c().label as string)
                              : t.localize(c().label as any)}
                          </span>
                        )}
                      </Show>
                    }
                  >
                    <span class="mt-2 inline-block text-sm font-bold text-neutral-950 underline decoration-secondary-400 decoration-2 underline-offset-8">
                      View post →
                    </span>
                  </RLPost>
                );
              }}
            </For>
          </RLGrid>

          <Show when={!posts() || posts()!.length === 0}>
            <p class="text-left text-neutral-500 py-12">{t("page.blog.empty")}</p>
          </Show>
        </div>
      }
    />
  );
}
