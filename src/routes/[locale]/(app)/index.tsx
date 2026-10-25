import { type Component, For, Show, createMemo } from "solid-js";
import { useHead } from "@solidjs/web";
import { createSeoHead } from "@rimelight/seo/head";
import { t, getCurrentLocale } from "@rimelight/i18n";
import { RLPageSection, RLLogo, RLButton, RLGrid, type RLButtonProps } from "@rimelight/ui";
import { content, type PublicEntry } from "@rimelight/cms/solid";
import { BlogPostCard } from "#components/blog/BlogPostCard";

export const HomePage: Component = () => {
  const latestPosts = createMemo<PublicEntry[]>(
    async () => (await content.entries("blog", { limit: 3, locale: getCurrentLocale() })).entries,
    { loadingValue: [] },
  );

  const heroLinks = (): RLButtonProps[] => [
    {
      label: t("playground.hero-link"),
      href: "/blog",
      color: "primary",
      variant: "solid",
    },
  ];

  const ctaLinks = (): RLButtonProps[] => [
    {
      label: t("playground.cta-start"),
      href: "/blog",
      color: "primary",
      variant: "solid",
    },
    {
      label: t("playground.cta-contribute"),
      href: "/",
      color: "primary",
      variant: "outline",
      trailingIcon: "i-lucide-arrow-right",
    },
  ];

  useHead(() =>
    createSeoHead({
      title: "idantity",
      description: "Welcome to my website!",
    }),
  );

  return (
    <>
      <RLPageSection
        variant="hero"
        reverse={true}
        title={t("playground.hero-title")}
        description={t("playground.hero-desc")}
        links={heroLinks()}
      >
        <RLLogo class="pointer-events-none h-64 w-auto" variant="logomark" />
      </RLPageSection>

      <RLPageSection
        orientation="vertical"
        title={t("playground.posts-title")}
        description={t("playground.posts-desc")}
        body={
          <div class="flex flex-col gap-xl">
            <RLGrid>
              <For each={latestPosts() || []}>{(post) => <BlogPostCard post={post} />}</For>
            </RLGrid>

            <Show when={(latestPosts() || []).length > 0}>
              <RLButton
                label={t("playground.view-all-posts")}
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
        title={t("playground.cta-title")}
        description={t("playground.cta-desc")}
        links={ctaLinks()}
      />
    </>
  );
};

export default HomePage;
