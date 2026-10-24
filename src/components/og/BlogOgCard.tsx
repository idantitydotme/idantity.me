import { type Component, Show } from "solid-js";

export interface BlogOgProps {
  title?: string;
  description?: string;
  category?: string;
  date?: string;
  brand?: string;
}

export const BlogOgCard: Component<BlogOgProps> = (props) => {
  const displayCategory = () =>
    props.category
      ? props.category
          .split("-")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ")
      : undefined;

  const truncatedTitle = () =>
    props.title && props.title.length > 150 ? props.title.slice(0, 149) + "…" : props.title;

  const truncatedDesc = () =>
    props.description && props.description.length > 220
      ? props.description.slice(0, 219) + "…"
      : props.description;

  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
      <defs>
        <style>{`
          .brand-text { font-family: 'Noto Sans', system-ui, sans-serif; font-size: 24px; font-weight: 700; fill: #ffffff; }
          .og-title { font-family: 'Noto Sans', system-ui, sans-serif; font-size: 52px; font-weight: 700; fill: #ffffff; letter-spacing: -0.02em; }
          .og-desc { font-family: 'Noto Sans', system-ui, sans-serif; font-size: 22px; font-weight: 400; fill: #94a3b8; }
          .badge-text { font-family: 'Noto Sans', system-ui, sans-serif; font-size: 14px; font-weight: 600; fill: #86efac; }
          .date-text { font-family: 'Noto Sans', system-ui, sans-serif; font-size: 15px; fill: #64748b; }
        `}</style>
      </defs>

      <rect width="1200" height="630" fill="#0a0a0a" />

      <Show when={props.brand}>
        <g transform="translate(80, 60)">
          <circle cx="16" cy="16" r="16" fill="#4ade80" fill-opacity="0.2" />
          <circle cx="16" cy="16" r="8" fill="#4ade80" />
          <text x="44" y="24" class="brand-text">
            {props.brand}
          </text>
        </g>
      </Show>

      <rect x="80" y="190" width="60" height="4" rx="2" fill="#4ade80" />

      <Show when={truncatedTitle()}>
        <text x="80" y="275" class="og-title">
          {truncatedTitle()}
        </text>
      </Show>

      <Show when={truncatedDesc()}>
        <text x="80" y="340" class="og-desc">
          {truncatedDesc()}
        </text>
      </Show>

      <Show when={displayCategory() || props.date}>
        <g transform="translate(80, 520)">
          <Show when={displayCategory()}>
            <rect
              width="130"
              height="38"
              rx="19"
              fill="rgba(74, 222, 128, 0.15)"
              stroke="rgba(74, 222, 128, 0.3)"
              stroke-width="1"
            />
            <text x="65" y="24" text-anchor="middle" class="badge-text">
              {displayCategory()}
            </text>
          </Show>
          <Show when={props.date}>
            <text x={displayCategory() ? "150" : "0"} y="24" class="date-text">
              {displayCategory() ? `• ${props.date}` : props.date}
            </text>
          </Show>
        </g>
      </Show>
    </svg>
  );
};

export default BlogOgCard;
