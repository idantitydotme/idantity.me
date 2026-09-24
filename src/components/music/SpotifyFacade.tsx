import { createSignal, Show } from "solid-js";

export interface SpotifyFacadeProps {
  id: string;
  title: string;
  description?: string;
  categoryBadge?: string;
  trackCount?: string | number;
  openLabel?: string;
  loadPlayerLabel?: string;
}

export default function SpotifyFacade(props: SpotifyFacadeProps) {
  const [isLoaded, setIsLoaded] = createSignal(false);

  const playlistUrl = `https://open.spotify.com/playlist/${props.id}`;
  const embedUrl = `https://open.spotify.com/embed/playlist/${props.id}?utm_source=generator&theme=0`;

  return (
    <div class="relative w-full rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/80 backdrop-blur-md overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
      <Show
        when={isLoaded()}
        fallback={
          <div class="p-6 md:p-7 flex flex-col justify-between h-[352px]">
            {/* Top row */}
            <div>
              <div class="flex items-center justify-between mb-4">
                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <span class="i-logos-spotify-icon text-sm" />
                  {props.categoryBadge || "Spotify Playlist"}
                </span>
                <Show when={props.trackCount}>
                  <span class="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
                    {props.trackCount} tracks
                  </span>
                </Show>
              </div>

              <h3 class="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                {props.title}
              </h3>
              <Show when={props.description}>
                <p class="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed line-clamp-3 mb-4">
                  {props.description}
                </p>
              </Show>
            </div>

            {/* Bottom action buttons */}
            <div class="pt-4 border-t border-neutral-200/80 dark:border-neutral-800/80 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={() => setIsLoaded(true)}
                class="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <span class="i-lucide-play text-base" />
                <span>{props.loadPlayerLabel || "Load Spotify Player"}</span>
              </button>

              <a
                href={playlistUrl}
                target="_blank"
                rel="noopener noreferrer"
                class="w-full sm:w-auto py-2.5 px-4 rounded-xl border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200 text-sm font-medium transition-all flex items-center justify-center gap-1.5"
              >
                <span class="i-lucide-external-link text-sm" />
                <span>{props.openLabel || "Open"}</span>
              </a>
            </div>
          </div>
        }
      >
        <iframe
          src={embedUrl}
          width="100%"
          height="352"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          class="w-full h-[352px] border-0 rounded-2xl"
        />
      </Show>
    </div>
  );
}
