import { type Component, Show, createMemo } from "solid-js";
import { useParams, useSearchParams } from "@solidjs/router";
import { useHead } from "@solidjs/web";
import { createSeoHead } from "@rimelight/seo/head";
import { PageRenderer, content, type PublicEntry } from "@rimelight/cms/solid";
import { RLDate } from "@rimelight/ui";
import { t, getCurrentLocale } from "@rimelight/i18n";

/**
 * A project, read from the CMS delivery API (`/api/content/collections/projects/:slug`). Mentions
 * arrive already resolved (colour + link), so PageRenderer needs no extra setup. `?preview=`
 * (from the dashboard's "Open draft preview") shows the draft instead of the published version.
 */
export const ProjectDetailPage: Component = () => {
  const params = useParams<{ locale: string; slug?: string }>();
  const [search] = useSearchParams<{ preview?: string }>();
  const activeLocale = () => getCurrentLocale();

  const post = createMemo<PublicEntry | null>(
    async () => {
      const slug = params.slug?.replace(/\/+$/, "");
      if (!slug) return null;
      return content.entry("projects", slug, search.preview);
    },
    { loadingValue: null },
  );

  const title = () => {
    const p = post();
    return p ? t.localize(p.title) || "Project" : "Project";
  };
  const description = () => {
    const p = post();
    return p ? t.localize(p.description ?? {}) || p.properties?.["excerpt"] || "" : "";
  };

  useHead(() => createSeoHead({ title: title(), description: description() }));

  return (
    <Show
      when={post()}
      fallback={<div class="p-16 text-center text-neutral-400">Loading project...</div>}
    >
      <article class="max-w-4xl mx-auto px-4 py-16">
        <header class="mb-12">
          <div class="text-sm text-primary-400 mb-2">
            <RLDate date={post()?.publishedAt || post()?.updatedAt || new Date()} />
          </div>
          <h1 class="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
            {title()}
          </h1>
          <p class="text-xl text-neutral-400 leading-relaxed">{description()}</p>
        </header>

        <PageRenderer blocks={post()?.blocks ?? []} locale={activeLocale()} />
      </article>
    </Show>
  );
};

export default ProjectDetailPage;
