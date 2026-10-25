import { defineCmsConfig, defineCollection } from "@rimelight/cms";

/**
 * idantity-specific CMS setup. Projects are their own collection (categories such as website,
 * app or other are `category` taxonomy terms managed in the dashboard).
 */
export default defineCmsConfig({
  collections: [
    defineCollection({
      slug: "projects",
      label: "Project",
      labelPlural: "Projects",
      icon: "i-lucide-folder-kanban",
      description: "Portfolio projects with a cover, excerpt and categories.",
      features: { taxonomies: ["category", "tag"], routable: "/projects/{slug}" },
      fields: {
        cover: { type: "media", label: "Cover image" },
        excerpt: { type: "textarea", label: "Excerpt", max: 300 },
        featured: { type: "boolean", label: "Featured", defaultValue: false },
      },
    }),
  ],
});
