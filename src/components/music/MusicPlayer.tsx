import { createSignal, onCleanup, For, Show } from "solid-js";

export interface CuePoint {
  time: number; // in seconds
  title: string;
  artist?: string;
}

export interface MusicPlayerProps {
  title: string;
  artist: string;
  genre?: string;
  bpm?: number | string;
  keySignature?: string;
  audioSrc: string;
  coverImage?: string;
  categoryTag?: string;
  cuePoints?: CuePoint[];
  downloadUrl?: string;
  labels?: {
    play?: string;
    pause?: string;
    mute?: string;
    unmute?: string;
    download?: string;
    cuePoints?: string;
    speed?: string;
  };
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

export default function MusicPlayer(props: MusicPlayerProps) {
  let audioElement!: HTMLAudioElement;

  const [isPlaying, setIsPlaying] = createSignal(false);
  const [currentTime, setCurrentTime] = createSignal(0);
  const [duration, setDuration] = createSignal(0);
  const [volume, setVolume] = createSignal(0.85);
  const [isMuted, setIsMuted] = createSignal(false);
  const [playbackRate, setPlaybackRate] = createSignal(1);
  const [showSpeedMenu, setShowSpeedMenu] = createSignal(false);
  const [showCuePoints, setShowCuePoints] = createSignal(false);

  const togglePlay = () => {
    if (!audioElement) return;
    if (isPlaying()) {
      audioElement.pause();
    } else {
      audioElement.play().catch((err) => {
        console.warn("Audio playback interrupted or blocked:", err);
      });
    }
  };

  const onTimeUpdate = () => {
    if (audioElement) {
      setCurrentTime(audioElement.currentTime);
    }
  };

  const onLoadedMetadata = () => {
    if (audioElement) {
      setDuration(audioElement.duration || 0);
      audioElement.volume = isMuted() ? 0 : volume();
      audioElement.playbackRate = playbackRate();
    }
  };

  const onSeek = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const seekTime = parseFloat(target.value);
    setCurrentTime(seekTime);
    if (audioElement) {
      audioElement.currentTime = seekTime;
    }
  };

  const onVolumeChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const newVol = parseFloat(target.value);
    setVolume(newVol);
    if (audioElement) {
      audioElement.volume = newVol;
      if (newVol > 0 && isMuted()) {
        setIsMuted(false);
      }
    }
  };

  const toggleMute = () => {
    if (!audioElement) return;
    if (isMuted()) {
      setIsMuted(false);
      audioElement.volume = volume();
    } else {
      setIsMuted(true);
      audioElement.volume = 0;
    }
  };

  const setSpeed = (rate: number) => {
    setPlaybackRate(rate);
    if (audioElement) {
      audioElement.playbackRate = rate;
    }
    setShowSpeedMenu(false);
  };

  const seekToCuePoint = (seconds: number) => {
    if (audioElement) {
      audioElement.currentTime = seconds;
      setCurrentTime(seconds);
      if (!isPlaying()) {
        audioElement.play().catch(() => {});
      }
    }
  };

  const progressPercent = () => {
    if (duration() === 0) return 0;
    return (currentTime() / duration()) * 100;
  };

  onCleanup(() => {
    if (audioElement) {
      audioElement.pause();
    }
  });

  const speedOptions = [0.75, 1, 1.25, 1.5, 2];

  return (
    <div class="relative w-full rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/80 backdrop-blur-md p-5 md:p-6 shadow-md transition-all hover:shadow-lg">
      <audio
        ref={audioElement}
        src={props.audioSrc}
        preload="metadata"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
      />

      {/* Main Track Info & Cover Row */}
      <div class="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-5">
        {/* Vinyl / Cover Art Box */}
        <div class="relative size-24 sm:size-28 shrink-0 rounded-2xl overflow-hidden bg-gradient-to-tr from-primary-600/30 via-primary-500/15 to-neutral-800 border border-primary-500/30 flex items-center justify-center shadow-inner group">
          <div
            class="size-16 sm:size-20 rounded-full border-2 border-primary-500/40 flex items-center justify-center bg-black/60 shadow-lg transition-transform duration-700"
            classList={{ "animate-spin-slow": isPlaying() }}
          >
            <div class="size-6 rounded-full bg-primary-500/60 border-2 border-white/20 flex items-center justify-center">
              <span class="size-2 rounded-full bg-white" />
            </div>
          </div>
          <button
            type="button"
            onClick={togglePlay}
            class="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/50 transition-colors cursor-pointer"
            aria-label={isPlaying() ? (props.labels?.pause ?? "Pause") : (props.labels?.play ?? "Play")}
          >
            <span
              class={`text-3xl text-white transition-transform duration-200 ${
                isPlaying() ? "i-lucide-pause" : "i-lucide-play translate-x-0.5"
              }`}
            />
          </button>
        </div>

        {/* Track Title, Artist, Tags */}
        <div class="flex-1 min-w-0 flex flex-col justify-center">
          <div class="flex flex-wrap items-center gap-2 mb-1.5">
            <Show when={props.categoryTag}>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-500/10 text-primary-500 border border-primary-500/20">
                {props.categoryTag}
              </span>
            </Show>
            <Show when={props.bpm}>
              <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono bg-neutral-200/60 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                {props.bpm} BPM
              </span>
            </Show>
            <Show when={props.keySignature}>
              <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono bg-neutral-200/60 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                Key: {props.keySignature}
              </span>
            </Show>
          </div>

          <h3 class="text-xl font-bold text-neutral-900 dark:text-neutral-100 truncate">
            {props.title}
          </h3>
          <p class="text-sm font-medium text-neutral-600 dark:text-neutral-400">
            {props.artist} {props.genre ? `· ${props.genre}` : ""}
          </p>

          {/* Animated Equalizer Wave Bars */}
          <div class="flex items-end gap-1 mt-3 h-4">
            <For each={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]}>
              {(barIndex) => (
                <span
                  class="w-1 rounded-full bg-primary-500 transition-all duration-150"
                  style={{
                    height: isPlaying()
                      ? `${Math.max(20, Math.sin((currentTime() * 4 + barIndex) * 0.8) * 100)}%`
                      : "20%",
                    opacity: isPlaying() ? 0.9 : 0.35,
                  }}
                />
              )}
            </For>
          </div>
        </div>

        {/* Action icons: Download, Speed, Cue points */}
        <div class="flex items-center gap-2 self-end sm:self-center">
          <Show when={props.cuePoints && props.cuePoints.length > 0}>
            <button
              type="button"
              onClick={() => setShowCuePoints(!showCuePoints())}
              class="p-2 rounded-xl text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition flex items-center gap-1 text-xs font-semibold"
              title={props.labels?.cuePoints ?? "Cue Points & Tracklist"}
            >
              <span class="i-lucide-list-music text-base" />
              <span class="hidden md:inline">{props.cuePoints?.length}</span>
            </button>
          </Show>

          {/* Playback speed selector */}
          <div class="relative">
            <button
              type="button"
              onClick={() => setShowSpeedMenu(!showSpeedMenu())}
              class="p-2 rounded-xl text-xs font-mono font-bold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition"
              title={props.labels?.speed ?? "Playback Speed"}
            >
              {playbackRate()}x
            </button>
            <Show when={showSpeedMenu()}>
              <div class="absolute right-0 bottom-full mb-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl py-1 z-30 flex flex-col min-w-[70px]">
                <For each={speedOptions}>
                  {(rate) => (
                    <button
                      type="button"
                      onClick={() => setSpeed(rate)}
                      class="px-3 py-1.5 text-xs text-left hover:bg-primary-500 hover:text-white transition-colors"
                      classList={{
                        "font-bold text-primary-500": playbackRate() === rate,
                      }}
                    >
                      {rate}x
                    </button>
                  )}
                </For>
              </div>
            </Show>
          </div>

          <Show when={props.downloadUrl}>
            <a
              href={props.downloadUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              class="p-2 rounded-xl text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition flex items-center"
              title={props.labels?.download ?? "Download"}
            >
              <span class="i-lucide-download text-base" />
            </a>
          </Show>
        </div>
      </div>

      {/* Progress / Scrubber Bar */}
      <div class="flex flex-col gap-1.5">
        <div class="relative flex items-center group">
          <input
            type="range"
            min="0"
            max={duration() || 100}
            step="0.1"
            value={currentTime()}
            onInput={onSeek}
            class="w-full h-2 rounded-lg appearance-none cursor-pointer bg-neutral-200 dark:bg-neutral-800 accent-primary-500 focus:outline-none"
            style={{
              background: `linear-gradient(to right, rgb(var(--color-primary-500, 234 88 12)) ${progressPercent()}%, rgba(150, 150, 150, 0.25) ${progressPercent()}%)`,
            }}
          />
        </div>

        {/* Time and Volume Controls */}
        <div class="flex items-center justify-between text-xs font-mono text-neutral-500 dark:text-neutral-400">
          <div class="flex items-center gap-1.5">
            <span>{formatTime(currentTime())}</span>
            <span>/</span>
            <span>{formatTime(duration())}</span>
          </div>

          <div class="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleMute}
              class="hover:text-primary-500 transition-colors"
              aria-label={isMuted() ? (props.labels?.unmute ?? "Unmute") : (props.labels?.mute ?? "Mute")}
            >
              <span
                class={`text-sm ${
                  isMuted() || volume() === 0
                    ? "i-lucide-volume-x"
                    : volume() < 0.5
                    ? "i-lucide-volume-1"
                    : "i-lucide-volume-2"
                }`}
              />
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted() ? 0 : volume()}
              onInput={onVolumeChange}
              class="w-16 sm:w-20 h-1.5 rounded-lg appearance-none cursor-pointer bg-neutral-200 dark:bg-neutral-800 accent-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Cue Points / Tracklist Dropdown */}
      <Show when={showCuePoints() && props.cuePoints && props.cuePoints.length > 0}>
        <div class="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
          <h4 class="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2.5 flex items-center gap-1.5">
            <span class="i-lucide-list-ordered text-sm" />
            {props.labels?.cuePoints ?? "Tracklist & Chapters"}
          </h4>
          <ul class="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
            <For each={props.cuePoints}>
              {(cue) => (
                <li>
                  <button
                    type="button"
                    onClick={() => seekToCuePoint(cue.time)}
                    class="w-full flex items-center justify-between p-2 rounded-lg text-left text-xs hover:bg-primary-500/10 hover:text-primary-500 dark:hover:text-primary-400 transition"
                    classList={{
                      "bg-primary-500/15 font-semibold text-primary-500":
                        currentTime() >= cue.time &&
                        (!props.cuePoints![props.cuePoints!.indexOf(cue) + 1] ||
                          currentTime() < props.cuePoints![props.cuePoints!.indexOf(cue) + 1].time),
                    }}
                  >
                    <span class="truncate">
                      {cue.artist ? `${cue.artist} - ` : ""}
                      {cue.title}
                    </span>
                    <span class="font-mono text-neutral-500 ml-2 shrink-0">
                      {formatTime(cue.time)}
                    </span>
                  </button>
                </li>
              )}
            </For>
          </ul>
        </div>
      </Show>
    </div>
  );
}
