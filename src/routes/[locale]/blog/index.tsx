import { type Component, For, createSignal, createMemo } from "solid-js";
import AppLayout from "#layouts/AppLayout";
import { t, getRelativeLocaleUrl, getCurrentLocale } from "@rimelight/i18n";
import { RLPageSection, RLTabs, RLGrid, RLPost } from "@rimelight/ui";

function getPageTitle(title: unknown, locale: string): string {
  if (typeof title === "object" && title !== null) {
    const titleRecord = title as Record<string, string>;
    return titleRecord[locale] || titleRecord["en"] || "";
  }
  return typeof title === "string" ? title : "";
}

export const BlogIndexPage: Component = () => {
  const activeLocale = () => getCurrentLocale();
  const [activeTab, setActiveTab] = createSignal("all");

  const blogPages = createMemo<any[]>(
    async () => {
      try {
        const res = await fetch("/api/cms/pages");
        if (!res.ok) return [];
        const data = (await res.json()) as any;
        const pagesList = (data.pages || []) as any[];
        return pagesList.filter((page: any) => page.type === "blog");
      } catch {
        return [];
      }
    },
    { loadingValue: [] },
  );

  const categoryMessages = () => ({
    "development-log": t("blog.categories_development-log"),
    other: t("blog.categories_other"),
  });

  const tabsItems = () => [
    { label: "All", value: "all" },
    { label: categoryMessages()["development-log"] || "Dev Log", value: "development-log" },
    { label: categoryMessages()["other"] || "Other", value: "other" },
  ];

  const filteredPosts = () => {
    const all = blogPages() || [];
    if (activeTab() === "all") return all;
    return all.filter((page: any) => {
      const content = typeof page.content === "string" ? JSON.parse(page.content) : page.content;
      return (content?.properties?.category || "other") === activeTab();
    });
  };

  return (
    <AppLayout title={t("blog.title")} description={t("blog.description")}>
      <RLPageSection title={t("blog.title")} description={t("blog.description")}>
        <RLTabs
          items={tabsItems()}
          variant="underline"
          value={activeTab()}
          onChange={(val: string) => setActiveTab(val)}
        />

        <div class="mt-6">
          <RLGrid cols={4}>
            <For each={filteredPosts()}>
              {(page, index) => {
                const content =
                  typeof page.content === "string" ? JSON.parse(page.content) : page.content;
                const titleVal = getPageTitle(page.title, activeLocale());
                const category = content?.properties?.category || "other";
                const postDate = page.postedAt || page.createdAt;
                return (
                  <RLPost
                    variant="ghost"
                    orientation={index() === 0 ? "horizontal" : "vertical"}
                    class={index() === 0 ? "col-span-full mb-6" : ""}
                    image={content?.properties?.heroImage}
                    date={postDate}
                    title={titleVal}
                    description={content?.properties?.description}
                    to={getRelativeLocaleUrl(`/blog/${page.slug}/`)}
                    badge={
                      categoryMessages()[category as keyof ReturnType<typeof categoryMessages>] ??
                      category
                    }
                    badgeColor={category === "development-log" ? "info" : "primary"}
                  />
                );
              }}
            </For>
          </RLGrid>
        </div>
      </RLPageSection>
    </AppLayout>
  );
};

export default BlogIndexPage;
