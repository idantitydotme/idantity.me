import { type Component, For } from "solid-js";
import { createAsyncData } from "#utils/async";
import AppLayout from "#layouts/AppLayout";
import { t, getRelativeLocaleUrl, getLocale } from "@rimelight/i18n";
import { RLContainer } from "@rimelight/ui";

function getLocalizedText(val: unknown, locale: string): string {
  if (typeof val === "string") return val;
  if (typeof val === "object" && val !== null) {
    const record = val as Record<string, string>;
    return record[locale] || record["en"] || "";
  }
  return typeof val === "number" || typeof val === "boolean" ? String(val) : "";
}

export const LegalIndexPage: Component = () => {
  const activeLocale = () => getLocale();

  const legalPages = createAsyncData(
    () => true,
    async () => {
      try {
        const res = await fetch("/api/cms/pages");
        if (!res.ok) return [];
        const data = (await res.json()) as any;
        const pagesList = (data.pages || []) as any[];
        return pagesList.filter((page) => page.type === "legal");
      } catch {
        return [];
      }
    },
    [],
  );

  return (
    <AppLayout title={t("legal.title")} description="Legal documents and policies">
      <RLContainer class="py-16 max-w-3xl">
        <section class="legal-section">
          <h1 class="text-3xl font-extrabold text-white mb-8">{t("legal.heading")}</h1>
          <ul class="legal-list flex flex-col gap-6">
            <For each={legalPages()}>
              {(doc) => {
                const title = getLocalizedText(doc.title, activeLocale());
                const description = getLocalizedText(doc.description, activeLocale());
                const pubDate = doc.postedAt || doc.createdAt;
                return (
                  <li class="legal-item border-b border-neutral-800 pb-6 last:border-b-0">
                    <h3 class="text-xl font-bold text-white mb-2">
                      <a
                        class="text-primary-400 hover:text-primary-300 transition-colors"
                        href={getRelativeLocaleUrl(`/legal/${doc.slug}/`)}
                      >
                        {title}
                      </a>
                    </h3>
                    <p class="text-neutral-400 mb-2 text-sm">{description}</p>
                    <span class="date text-xs text-neutral-500">
                      {t("legal.lastUpdated")} {new Date(pubDate).toLocaleDateString()}
                    </span>
                  </li>
                );
              }}
            </For>
          </ul>
        </section>
      </RLContainer>
    </AppLayout>
  );
};

export default LegalIndexPage;
