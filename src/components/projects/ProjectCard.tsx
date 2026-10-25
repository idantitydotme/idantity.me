import { type Component, Show } from "solid-js";
import { t, getLocaleUrl } from "@rimelight/i18n";
import { RLPost } from "@rimelight/ui";
import type { PublicEntry } from "@rimelight/cms/solid";

/** One project as a card. Used by the projects index. */
export const ProjectCard: Component<{ post: PublicEntry }> = (props) => {
  const cover = () => props.post.properties?.["cover"];
  const category = () => props.post.terms?.find((x) => x.taxonomy === "category");
  return (
    <div class="flex flex-col gap-2">
      <Show when={category()}>
        {(c) => (
          <a
            href={getLocaleUrl(`/projects/?category=${c().slug}`)}
            class="self-start text-xs font-bold uppercase tracking-wider text-primary-400 hover:text-primary-300"
          >
            {typeof c().label === "string" ? (c().label as string) : t.localize(c().label as any)}
          </a>
        )}
      </Show>
      <RLPost
        title={t.localize(props.post.title)}
        description={
          t.localize(props.post.description ?? {}) || props.post.properties?.["excerpt"] || ""
        }
        date={(() => {
          const d = props.post.publishedAt || props.post.updatedAt;
          return d ? new Date(d) : undefined;
        })()}
        image={typeof cover() === "string" ? cover() : (cover()?.src ?? cover()?.url)}
        to={getLocaleUrl(`/projects/${props.post.slug}/`)}
        variant="ghost"
      />
    </div>
  );
};
