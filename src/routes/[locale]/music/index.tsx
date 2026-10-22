import { type Component, For, createSignal } from "solid-js";
import AppLayout from "#layouts/AppLayout";
import { RLPageSection, RLTabs } from "@rimelight/ui";
import MusicPlayer from "#components/music/MusicPlayer.tsx";
import SpotifyFacade from "#components/music/SpotifyFacade.tsx";
import { t } from "@rimelight/i18n";

export const MusicPage: Component = () => {
  const [activeTab, setActiveTab] = createSignal("all");

  // Featured tracks & audio data
  const featuredTracks = () => [
    {
      id: "bishu-ikari",
      title: t("page.music.tracks.bishu.ikari.title"),
      artist: t("page.music.tracks.bishu.ikari.artist"),
      genre: t("page.music.tracks.bishu.ikari.genre"),
      categoryTag: t("page.music.tracks.bishu.ikari.category"),
      bpm: 140,
      keySignature: "F Minor",
      audioSrc: "https://cdn.idantity.me/music/Bishu%20-%20ikari.mp3",
      downloadUrl: "https://cdn.idantity.me/music/Bishu%20-%20ikari.mp3",
      cuePoints: [
        { time: 0, title: t("page.music.tracks.cue.intro") },
        { time: 30, title: t("page.music.tracks.cue.drop1") },
        { time: 65, title: t("page.music.tracks.cue.break") },
        { time: 95, title: t("page.music.tracks.cue.drop2") },
      ],
    },
  ];

  // Curated Spotify Playlists
  const spotifyPlaylists = () => [
    {
      id: "29kSyAiwnDXM59KoGEUAN9",
      title: t("page.music.playlists.pl1.title"),
      description: t("page.music.playlists.pl1.desc"),
      trackCount: "50+",
      categoryBadge: "Bass / Trap",
    },
    {
      id: "1fK0wAI02tDpmpkZ53cTmF",
      title: t("page.music.playlists.pl2.title"),
      description: t("page.music.playlists.pl2.desc"),
      trackCount: "45+",
      categoryBadge: "Melodic / Future",
    },
    {
      id: "0b7hixI5M1VQwD47KYWABj",
      title: t("page.music.playlists.pl3.title"),
      description: t("page.music.playlists.pl3.desc"),
      trackCount: "60+",
      categoryBadge: "Chill / Downtempo",
    },
    {
      id: "271UvSiUmd238ZYkNi5U57",
      title: t("page.music.playlists.pl4.title"),
      description: t("page.music.playlists.pl4.desc"),
      trackCount: "40+",
      categoryBadge: "Club / Festival",
    },
  ];

  const tabItems = () => [
    { label: t("page.music.tab.all"), value: "all" },
    { label: t("page.music.tab.productions"), value: "productions" },
    { label: t("page.music.tab.playlists"), value: "playlists" },
  ];

  const playerLabels = () => ({
    play: t("page.music.player.play"),
    pause: t("page.music.player.pause"),
    mute: t("page.music.player.mute"),
    unmute: t("page.music.player.unmute"),
    download: t("page.music.player.download"),
    cuePoints: t("page.music.player.tracklist"),
    speed: t("page.music.player.speed"),
  });

  return (
    <AppLayout title={t("page.music.title")} description={t("page.music.description")}>
      {/* Hero Section */}
      <RLPageSection
        variant="hero"
        headline={t("page.music.hero.headline")}
        title={t("page.music.hero.title")}
        description={t("page.music.hero.description")}
        orientation="horizontal"
      />

      {/* Main Tabs Section */}
      <RLPageSection
        orientation="vertical"
        body={
          <div class="max-w-6xl mx-auto w-full">
            <RLTabs
              items={tabItems()}
              variant="underline"
              value={activeTab()}
              onChange={(val: string) => setActiveTab(val)}
            />

            <div class="mt-8">
              {/* ALL TAB */}
              {activeTab() === "all" && (
                <div class="flex flex-col gap-12">
                  {/* Featured Production Section */}
                  <section class="flex flex-col gap-6">
                    <div class="flex flex-col gap-1">
                      <h2 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2.5">
                        <span class="i-lucide-sparkles size-6 text-primary-500" />
                        {t("page.music.section.featured.title")}
                      </h2>
                      <p class="text-sm text-neutral-500 dark:text-neutral-400">
                        {t("page.music.section.featured.desc")}
                      </p>
                    </div>

                    <div class="grid grid-cols-1 gap-6">
                      <For each={featuredTracks()}>
                        {(track) => (
                          <MusicPlayer
                            title={track.title}
                            artist={track.artist}
                            genre={track.genre}
                            bpm={track.bpm}
                            keySignature={track.keySignature}
                            audioSrc={track.audioSrc}
                            categoryTag={track.categoryTag}
                            downloadUrl={track.downloadUrl}
                            cuePoints={track.cuePoints}
                            labels={playerLabels()}
                          />
                        )}
                      </For>
                    </div>
                  </section>

                  {/* Curated Playlists Grid */}
                  <section class="flex flex-col gap-6">
                    <div class="flex flex-col gap-1">
                      <h2 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2.5">
                        <span class="i-lucide-disc-3 size-6 text-emerald-500" />
                        {t("page.music.section.playlists.title")}
                      </h2>
                      <p class="text-sm text-neutral-500 dark:text-neutral-400">
                        {t("page.music.section.playlists.desc")}
                      </p>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <For each={spotifyPlaylists()}>
                        {(pl) => (
                          <SpotifyFacade
                            id={pl.id}
                            title={pl.title}
                            description={pl.description}
                            categoryBadge={pl.categoryBadge}
                            trackCount={pl.trackCount}
                            loadPlayerLabel={t("page.music.spotify.load")}
                            openLabel={t("page.music.spotify.open")}
                          />
                        )}
                      </For>
                    </div>
                  </section>
                </div>
              )}

              {/* PRODUCTIONS ONLY TAB */}
              {activeTab() === "productions" && (
                <div class="flex flex-col gap-6">
                  <div class="flex flex-col gap-1">
                    <h2 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2.5">
                      <span class="i-lucide-audio-waveform size-6 text-primary-500" />
                      {t("page.music.section.featured.title")}
                    </h2>
                    <p class="text-sm text-neutral-500 dark:text-neutral-400">
                      {t("page.music.section.featured.desc")}
                    </p>
                  </div>

                  <div class="grid grid-cols-1 gap-6">
                    <For each={featuredTracks()}>
                      {(track) => (
                        <MusicPlayer
                          title={track.title}
                          artist={track.artist}
                          genre={track.genre}
                          bpm={track.bpm}
                          keySignature={track.keySignature}
                          audioSrc={track.audioSrc}
                          categoryTag={track.categoryTag}
                          downloadUrl={track.downloadUrl}
                          cuePoints={track.cuePoints}
                          labels={playerLabels()}
                        />
                      )}
                    </For>
                  </div>
                </div>
              )}

              {/* PLAYLISTS ONLY TAB */}
              {activeTab() === "playlists" && (
                <div class="flex flex-col gap-6">
                  <div class="flex flex-col gap-1">
                    <h2 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2.5">
                      <span class="i-lucide-list-music size-6 text-emerald-500" />
                      {t("page.music.section.playlists.title")}
                    </h2>
                    <p class="text-sm text-neutral-500 dark:text-neutral-400">
                      {t("page.music.section.playlists.desc")}
                    </p>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <For each={spotifyPlaylists()}>
                      {(pl) => (
                        <SpotifyFacade
                          id={pl.id}
                          title={pl.title}
                          description={pl.description}
                          categoryBadge={pl.categoryBadge}
                          trackCount={pl.trackCount}
                          loadPlayerLabel={t("page.music.spotify.load")}
                          openLabel={t("page.music.spotify.open")}
                        />
                      )}
                    </For>
                  </div>
                </div>
              )}
            </div>
          </div>
        }
      />
    </AppLayout>
  );
};

export default MusicPage;
