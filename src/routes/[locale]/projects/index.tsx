import { type Component, For, createSignal } from "solid-js";
import { createAsyncData } from "#utils/async";
import AppLayout from "#layouts/AppLayout";
import { t, getRelativeLocaleUrl, getLocale } from "@rimelight/i18n";
import { RLPageSection, RLTabs, RLGrid, RLPost } from "@rimelight/ui";

function getPageTitle(title: unknown, locale: string): string {
  if (typeof title === "object" && title !== null) {
    const titleRecord = title as Record<string, string>;
    return titleRecord[locale] || titleRecord["en"] || "";
  }
  return typeof title === "string" ? title : "";
}

export const ProjectsIndexPage: Component = () => {
  const activeLocale = () => getLocale();
  const [activeTab, setActiveTab] = createSignal("all");

  const projectPages = createAsyncData(
    () => true,
    async () => {
      try {
        const res = await fetch("/api/cms/pages");
        if (!res.ok) return [];
        const data = (await res.json()) as any;
        const pagesList = (data.pages || []) as any[];
        return pagesList.filter((page) => page.type === "projects");
      } catch {
        return [];
      }
    },
    [],
  );

  const categoryMessages = () => ({
    website: t("projects.categories_website"),
    app: t("projects.categories_app"),
    other: t("projects.categories_other"),
  });

  const badgeColorMap: Record<string, string> = {
    website: "info",
    app: "primary",
    other: "success",
  };

  const tabsItems = () => [
    { label: "All", value: "all" },
    { label: categoryMessages().website || "Website", value: "website" },
    { label: categoryMessages().app || "App", value: "app" },
    { label: categoryMessages().other || "Other", value: "other" },
  ];

  const filteredProjects = () => {
    const all = projectPages() || [];
    if (activeTab() === "all") return all;
    return all.filter((page) => {
      const content = typeof page.content === "string" ? JSON.parse(page.content) : page.content;
      return (content?.properties?.category || "other") === activeTab();
    });
  };

  return (
    <AppLayout title={t("projects.title")} description={t("projects.description")}>
      <RLPageSection title={t("projects.title")} description={t("projects.description")}>
        <RLTabs
          items={tabsItems()}
          variant="underline"
          value={activeTab()}
          onChange={(val: string) => setActiveTab(val)}
        />

        <div class="mt-6">
          <RLGrid cols={4}>
            <For each={filteredProjects()}>
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
                    to={getRelativeLocaleUrl(`/projects/${page.slug}/`)}
                    badge={
                      categoryMessages()[category as keyof ReturnType<typeof categoryMessages>] ??
                      category
                    }
                    badgeColor={badgeColorMap[category] || "primary"}
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

export default ProjectsIndexPage;
