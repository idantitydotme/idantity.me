import { For, Show, createMemo } from "solid-js";
import { useHead } from "@solidjs/web";
import { createPageHead } from "@rimelight/seo/head";
import { t, getCurrentLocale } from "@rimelight/i18n";
import { RLPageSection } from "@rimelight/ui/components/page-section/RLPageSection.tsx";
import { RLLogo } from "@rimelight/ui/components/logo/RLLogo.tsx";
import { RLButton } from "@rimelight/ui/components/button/RLButton.tsx";
import { RLGrid } from "@rimelight/ui/components/grid/RLGrid.tsx";
import { RLPost } from "@rimelight/ui/components/post/RLPost.tsx";
import type { RLButtonProps } from "@rimelight/ui/components/button/button.types.ts";
import { content, type PublicEntry } from "@rimelight/cms/solid";
import { MosaicBackdrop } from "#components/app/MosaicBackdrop";

export default function HomePage() {
  useHead(() =>
    createPageHead({
      title: "idantity",
      description: t("app.text.welcome-to-my-website"),
    }),
  );

  const latestPosts = createMemo<PublicEntry[]>(
    async () => (await content.entries("blog", { limit: 3, locale: getCurrentLocale() })).entries,
    { loadingValue: [] },
  );

  const heroLinks = (): RLButtonProps[] => [
    {
      label: t("page.home.hero-link"),
      href: "/blog",
      color: "primary",
      variant: "solid",
    },
  ];

  const ctaLinks = (): RLButtonProps[] => [
    {
      label: t("page.home.cta-start"),
      href: "/blog",
      color: "primary",
      variant: "solid",
      trailingIcon: "i-lucide-arrow-right",
    },
    {
      label: t("page.home.cta-contribute"),
      href: "/",
      color: "primary",
      variant: "outline",
      trailingIcon: "i-lucide-arrow-right",
    },
  ];

  return (
    <>
      <RLPageSection
        layout="hero"
        data-theme="light"
        reverse={true}
        title={t("page.home.hero-title")}
        description={t("page.home.hero-desc")}
        links={heroLinks()}
        backgroundSlot={<MosaicBackdrop tone="mixed" seed={3} class="opacity-100" />}
      >
        <RLLogo class="pointer-events-none h-64 w-auto" variant="logomark" />
      </RLPageSection>

      <RLPageSection
        orientation="vertical"
        data-theme="light"
        title={t("page.home.posts-title")}
        description={t("page.home.posts-desc")}
        backgroundSlot={<MosaicBackdrop tone="tan" seed={7} class="opacity-100" />}
        bodySlot={
          <div class="flex flex-col gap-xl">
            <RLGrid>
              <For each={latestPosts() || []}>
                {(post) => (
                  <RLPost
                    title={t.localize(post.title)}
                    description={t.localize(post.description ?? {})}
                    date={post.publishedAt ?? undefined}
                    image={post.properties?.["cover"]}
                    href={`/blog/${post.slug}/`}
                    variant="ghost"
                  />
                )}
              </For>
            </RLGrid>

            <Show when={(latestPosts() || []).length > 0}>
              <RLButton
                label={t("page.home.view-all-posts")}
                href="/blog"
                color="primary"
                variant="link"
                trailingIcon="i-lucide-arrow-right"
              />
            </Show>
          </div>
        }
      />

      <RLPageSection
        data-theme="light"
        title={t("page.home.cta-title")}
        description={t("page.home.cta-desc")}
        links={ctaLinks()}
      />
    </>
  );
}
