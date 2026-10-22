import { type Component, For, Show, createMemo } from "solid-js";
import AppLayout from "#layouts/AppLayout";
import { t, getLocaleUrl } from "@rimelight/i18n";
import { RLPageSection, RLLogo, RLButton, RLGrid, RLPost, type RLButtonProps } from "@rimelight/ui";

export const HomePage: Component = () => {
  const latestPosts = createMemo<any[]>(
    async () => {
      try {
        const res = await fetch("/api/cms/pages");
        if (!res.ok) return [];
        const data = (await res.json()) as any;
        const pagesList = (data.pages || []) as any[];

        return pagesList.filter((page: any) => page.type === "blog").slice(0, 3);
      } catch {
        return [];
      }
    },
    { loadingValue: [] },
  );

  const heroLinks = (): RLButtonProps[] => [
    {
      label: t("playground.hero-link"),
      href: getLocaleUrl("/blog"),
      color: "primary",
      variant: "solid",
    },
  ];

  const ctaLinks = (): RLButtonProps[] => [
    {
      label: t("playground.cta-start"),
      href: getLocaleUrl("/blog"),
      color: "primary",
      variant: "solid",
    },
    {
      label: t("playground.cta-contribute"),
      href: getLocaleUrl("/"),
      color: "primary",
      variant: "outline",
      trailingIcon: "i-lucide-arrow-right",
    },
  ];

  return (
    <AppLayout title="idantity" description="Welcome to my website!">
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
              <For each={latestPosts() || []}>
                {(post) => {
                  const content =
                    typeof post.content === "string"
                      ? JSON.parse(post.content)
                      : post.content || {};
                  const title = t.localize(post.title);
                  const description = content.properties?.description || "";
                  const heroImage = content.properties?.heroImage;
                  const postDate = post.postedAt || post.createdAt;
                  return (
                    <RLPost
                      variant="ghost"
                      image={heroImage}
                      date={postDate}
                      title={title}
                      description={description}
                      to={getLocaleUrl(`/blog/${post.slug}/`)}
                    />
                  );
                }}
              </For>
            </RLGrid>

            <Show when={(latestPosts() || []).length > 0}>
              <RLButton
                label={t("playground.view-all-posts")}
                href={getLocaleUrl("/blog")}
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
    </AppLayout>
  );
};

export default HomePage;
