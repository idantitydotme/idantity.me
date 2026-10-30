import { For, Show, createMemo } from "solid-js";
import { useHead } from "@solidjs/web";
import { createPageHead } from "@rimelight/seo/head";
import { t, getLocaleUrl, getCurrentLocale } from "@rimelight/i18n";
import { RLPageSection, RLGrid, RLPost } from "@rimelight/ui";
import { content } from "@rimelight/cms/solid";

/** Legal documents from the CMS `legal` collection, for the current locale. */
export default function LegalIndexPage() {
  const activeLocale = () => getCurrentLocale();

  const legalPages = createMemo(
    async () => {
      try {
        const loc = activeLocale();
        const { entries } = await content.entries("legal");
        return entries.filter((e) => (e.properties["locale"] ?? "en") === loc);
      } catch {
        return [];
      }
    },
    { loadingValue: [] },
  );

  useHead(() =>
    createPageHead({
      title: t("page.legal.meta.title"),
      description: t("page.legal.meta.description"),
    }),
  );

  return (
    <RLPageSection
      title={t("page.legal.meta.title")}
      description={t("page.legal.meta.description")}
      class="py-16"
    >
      <div class="max-w-5xl mx-auto w-full px-4 mt-8">
        <RLGrid cols={2}>
          <For each={legalPages() || []}>
            {(post) => {
              const title = t.localize(post.title);
              const description = t.localize(post.description ?? undefined) || "";
              const postDate = post.publishedAt ?? undefined;
              return (
                <RLPost
                  title={title}
                  description={description}
                  {...(postDate ? { date: postDate } : {})}
                  to={getLocaleUrl(`/legal/${post.slug}/`)}
                  variant="ghost"
                />
              );
            }}
          </For>
        </RLGrid>

        <Show when={!legalPages() || legalPages()!.length === 0}>
          <p class="text-center text-neutral-500 py-12">{t("page.legal.empty")}</p>
        </Show>
      </div>
    </RLPageSection>
  );
}
