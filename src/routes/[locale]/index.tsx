import { type Component, For, Show, createMemo } from "solid-js";
import AppLayout from "#layouts/AppLayout";
import { t, getCurrentLocale, getRelativeLocaleUrl, getLocalizedText } from "@rimelight/i18n";
import { RLPageSection, RLLogo, RLButton, RLGrid, RLPost, type RLButtonProps } from "@rimelight/ui";

export const HomePage: Component = () => {
  const activeLocale = () => getCurrentLocale();

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
      label: t("playground.heroLink"),
      href: getRelativeLocaleUrl("/blog"),
      color: "primary",
      variant: "solid",
    },
  ];

  const ctaLinks = (): RLButtonProps[] => [
    {
      label: t("playground.ctaStart"),
      href: getRelativeLocaleUrl("/blog"),
      color: "primary",
      variant: "solid",
    },
    {
      label: t("playground.ctaContribute"),
      href: getRelativeLocaleUrl("/"),
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
        title={t("playground.heroTitle")}
        description={t("playground.heroDesc")}
        links={heroLinks()}
      >
        <RLLogo class="pointer-events-none h-64 w-auto" variant="logomark" />
      </RLPageSection>

      <RLPageSection
        orientation="vertical"
        title={t("playground.postsTitle")}
        description={t("playground.postsDesc")}
        body={
          <div class="flex flex-col gap-xl">
            <RLGrid>
              <For each={latestPosts() || []}>
                {(post) => {
                  const content =
                    typeof post.content === "string"
                      ? JSON.parse(post.content)
                      : post.content || {};
                  const title = getLocalizedText(post.title, activeLocale());
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
                      to={getRelativeLocaleUrl(`/blog/${post.slug}/`)}
                    />
                  );
                }}
              </For>
            </RLGrid>

            <Show when={(latestPosts() || []).length > 0}>
              <RLButton
                label={t("playground.viewAllPosts")}
                href={getRelativeLocaleUrl("/blog")}
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
        title={t("playground.ctaTitle")}
        description={t("playground.ctaDesc")}
        links={ctaLinks()}
      />
    </AppLayout>
  );
};

export default HomePage;
