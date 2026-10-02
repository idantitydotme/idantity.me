import { type Component, Show, createMemo } from "solid-js";
import { useParams } from "@solidjs/router";
import AppLayout from "#layouts/AppLayout";
import PageRenderer from "#components/cms/PageRenderer";
import { RLContainer, RLDate } from "@rimelight/ui";
import { t, getLocale } from "@rimelight/i18n";

function getLocalizedText(val: unknown, locale: string): string {
  if (typeof val === "string") return val;
  if (typeof val === "object" && val !== null) {
    const record = val as Record<string, string>;
    return record[locale] || record["en"] || "";
  }
  return typeof val === "number" || typeof val === "boolean" ? String(val) : "";
}

export const LegalDocumentPage: Component = () => {
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
        const found = pagesList.find((p) => p.slug === slug && p.type === "legal");
        return found || null;
      } catch {
        return null;
      }
    },
    { loadingValue: null },
  );

  const title = () =>
    pageData()
      ? getLocalizedText(pageData()!.title, activeLocale()) || "Legal Document"
      : "Legal Document";
  const description = () => {
    const p = pageData();
    if (!p) return "";
    return getLocalizedText(p.description, activeLocale());
  };

  const content = () => {
    const p = pageData();
    if (!p) return {};
    return typeof p.content === "string" ? JSON.parse(p.content) : p.content || {};
  };

  const pubDate = () => pageData()?.postedAt || pageData()?.createdAt;
  const updatedDate = () => pageData()?.updatedAt;

  return (
    <AppLayout title={title()} description={description()}>
      <RLContainer class="py-16 max-w-3xl">
        <Show when={pageData()} fallback={<div class="p-8 text-center text-muted">Loading...</div>}>
          <article>
            <div class="prose max-w-none">
              <div class="title mb-8">
                <div class="date text-neutral-400 mb-2 text-sm">
                  <Show when={pubDate()}>
                    <RLDate date={pubDate()!} />
                  </Show>
                  <Show when={updatedDate()}>
                    <div class="last-updated-on text-xs text-neutral-500 mt-1">
                      {t("legal.lastUpdatedOn")} <RLDate date={updatedDate()!} />
                    </div>
                  </Show>
                </div>
                <h1 class="text-4xl font-extrabold text-white mb-4">{title()}</h1>
                <hr class="border-neutral-800" />
              </div>
              <PageRenderer blocks={content().blocks || []} locale={activeLocale()} />
            </div>
          </article>
        </Show>
      </RLContainer>
    </AppLayout>
  );
};

export default LegalDocumentPage;
