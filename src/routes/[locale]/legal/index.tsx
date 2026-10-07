import { type Component, For, createMemo } from "solid-js";
import AppLayout from "#layouts/AppLayout";
import { t, getRelativeLocaleUrl, getCurrentLocale, getLocalizedText } from "@rimelight/i18n";
import { RLContainer } from "@rimelight/ui";

export const LegalIndexPage: Component = () => {
  const activeLocale = () => getCurrentLocale();

  const legalPages = createMemo<any[]>(
    async () => {
      try {
        const res = await fetch("/api/cms/pages");
        if (!res.ok) return [];
        const data = (await res.json()) as any;
        const pagesList = (data.pages || []) as any[];
        return pagesList.filter((page: any) => page.type === "legal");
      } catch {
        return [];
      }
    },
    { loadingValue: [] },
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
