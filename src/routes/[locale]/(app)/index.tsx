import { For, Show, createMemo } from "solid-js";
import { useHead } from "@solidjs/web";
import { createPageHead } from "@rimelight/seo/head";
import { t, getCurrentLocale } from "@rimelight/i18n";
import { RLPageSection, RLLogo, RLButton, RLGrid, type RLButtonProps } from "@rimelight/ui";
import { content, type PublicEntry } from "@rimelight/cms/solid";
import { BlogPostCard } from "#components/blog/BlogPostCard";

export default function HomePage() {
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
    },
    {
      label: t("page.home.cta-contribute"),
      href: "/",
      color: "primary",
      variant: "outline",
      trailingIcon: "i-lucide-arrow-right",
    },
  ];

  useHead(() =>
    createPageHead({
      title: "idantity",
      description: t("app.text.welcome-to-my-website"),
    }),
  );

  return (
    <>
      <RLPageSection
        variant="hero"
        reverse={true}
        title={t("page.home.hero-title")}
        description={t("page.home.hero-desc")}
        links={heroLinks()}
      >
        <RLLogo class="pointer-events-none h-64 w-auto" variant="logomark" />
      </RLPageSection>

      <RLPageSection
        orientation="vertical"
        title={t("page.home.posts-title")}
        description={t("page.home.posts-desc")}
        body={
          <div class="flex flex-col gap-xl">
            <RLGrid>
              <For each={latestPosts() || []}>{(post) => <BlogPostCard post={post} />}</For>
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
        variant="cta"
        ctaVariant="solid"
        title={t("page.home.cta-title")}
        description={t("page.home.cta-desc")}
        links={ctaLinks()}
      />
    </>
  );
}
