import { type Component, Show, createMemo } from "solid-js";
import { useParams } from "@solidjs/router";
import AppLayout from "#layouts/AppLayout";
import PageRenderer from "#components/cms/PageRenderer";
import { getLocale, getLocalizedText } from "@rimelight/i18n";

export const ProjectDetailPage: Component = () => {
  const params = useParams<{ locale: string; slug: string }>();
  const activeLocale = () => getLocale();

  const pageData = createMemo<any>(
    async () => {
      const slug = params["slug"];
      if (!slug) return null;
      try {
        const res = await fetch("/api/cms/pages");
        if (!res.ok) return null;
        const data = (await res.json()) as any;
        const pagesList = (data.pages || []) as any[];
        const found = pagesList.find((p) => p.slug === slug && p.type === "projects");
        return found || null;
      } catch {
        return null;
      }
    },
    { loadingValue: null },
  );

  const title = () =>
    pageData() ? getLocalizedText(pageData()!.title, activeLocale()) || "Project" : "Project";
  const description = () => {
    const p = pageData();
    if (!p) return "";
    const content = typeof p.content === "string" ? JSON.parse(p.content) : p.content || {};
    return getLocalizedText(p.description, activeLocale()) || content.properties?.description || "";
  };

  const content = () => {
    const p = pageData();
    if (!p) return {};
    return typeof p.content === "string" ? JSON.parse(p.content) : p.content || {};
  };

  const heroImage = () => content().properties?.heroImage || (pageData() as any)?.banner?.src;
  const category = () => content().properties?.category;
  const postDate = () => pageData()?.postedAt || pageData()?.createdAt;

  return (
    <AppLayout title={title()} description={description()}>
      <div class="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <Show when={pageData()} fallback={<div class="p-8 text-center text-muted">Loading...</div>}>
          <Show when={heroImage()}>
            <div class="mb-8 rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 shadow-sm aspect-[21/9]">
              <img src={heroImage()} alt={title()} class="w-full h-full object-cover" />
            </div>
          </Show>

          <header class="border-b border-neutral-200 dark:border-neutral-800 pb-8 mb-8">
            <Show when={category()}>
              <span class="inline-block px-2.5 py-1 text-xs font-semibold rounded-full bg-primary-500/10 text-primary-500 mb-3 uppercase tracking-wider">
                {category()}
              </span>
            </Show>
            <h1 class="text-3xl sm:text-5xl font-extrabold text-neutral-900 dark:text-white tracking-tight leading-tight">
              {title()}
            </h1>
            <Show when={description()}>
              <p class="text-lg sm:text-xl text-neutral-500 dark:text-neutral-400 mt-4 leading-relaxed">
                {description()}
              </p>
            </Show>
            <Show when={postDate()}>
              <div class="flex items-center gap-4 text-xs text-neutral-500 mt-6">
                <time datetime={new Date(postDate()!).toISOString()}>
                  {new Date(postDate()!).toLocaleDateString(activeLocale(), {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
              </div>
            </Show>
          </header>

          <article class="cms-article">
            <PageRenderer blocks={content().blocks || []} locale={activeLocale()} />
          </article>
        </Show>
      </div>
    </AppLayout>
  );
};

export default ProjectDetailPage;
