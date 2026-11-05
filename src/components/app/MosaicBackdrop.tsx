import { For, type Component } from "solid-js";

const W = 1440;
const H = 480;
/** Grout width: the base shows through the gap between tiles. */
const GROUT = 6;
/** Horizontal band (fraction of width) where content sits. Only pale tiles are drawn there. */
const TEXT_BAND: readonly [number, number] = [0.3, 0.72];

/**
 * The svg sets `data-theme="light"`, so every `--rl-*` token below resolves to its light value
 * regardless of the page's color mode.
 */
const FILLS = {
  blue: ["var(--rl-primary-200)", "var(--rl-primary-300)", "var(--rl-primary-400)"],
  tan: ["var(--rl-secondary-200)", "var(--rl-secondary-300)", "var(--rl-secondary-400)"],
  pale: ["var(--rl-primary-100)", "var(--rl-secondary-100)", "var(--rl-secondary-200)"],
} as const;

export type MosaicTone = "blue" | "tan" | "mixed";
type Side = "blue" | "tan" | "pale";

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Cell extends Rect {
  fill: string;
}

/** Seeded PRNG (mulberry32) so the layout is identical on server and client. */
function createRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Color zones flow left to right: blue, pale through the text band, then tan/orange. */
function sideFor(u: number, tone: MosaicTone): Side {
  if (u >= TEXT_BAND[0] && u < TEXT_BAND[1]) return "pale";
  if (tone !== "mixed") return tone;
  return u < TEXT_BAND[0] ? "blue" : "tan";
}

function fillFor(side: Side, rand: () => number): string {
  const options = FILLS[side];
  return options[Math.floor(rand() * options.length)] ?? "";
}

/**
 * Recursively splits the canvas at uneven fractions, so tiles vary in size and no rows or
 * columns line up across the whole wall. Coarse splits keep large tiles and open space.
 */
function layout(rand: () => number): Rect[] {
  const out: Rect[] = [];
  const split = (r: Rect, depth: number): void => {
    if (depth < 4 && Math.max(r.w, r.h) > 260 && rand() < 0.75) {
      const f = 0.2 + rand() * 0.6;
      if (r.w >= r.h) {
        const cw = r.w * f;
        split({ x: r.x, y: r.y, w: cw, h: r.h }, depth + 1);
        split({ x: r.x + cw, y: r.y, w: r.w - cw, h: r.h }, depth + 1);
      } else {
        const ch = r.h * f;
        split({ x: r.x, y: r.y, w: r.w, h: ch }, depth + 1);
        split({ x: r.x, y: r.y + ch, w: r.w, h: r.h - ch }, depth + 1);
      }
      return;
    }
    out.push(r);
  };
  split({ x: 0, y: 0, w: W, h: H }, 0);
  return out;
}

function buildCells(seed: number, tone: MosaicTone): Cell[] {
  const rand = createRandom(seed);
  return layout(rand).flatMap((r) => {
    // Only a few cells stay empty, so the wall reads as one composition, not sparse dots.
    if (rand() < 0.06) return [];
    const u = (r.x + r.w / 2) / W;
    return [
      {
        x: r.x + GROUT,
        y: r.y + GROUT,
        w: r.w - GROUT * 2,
        h: r.h - GROUT * 2,
        fill: fillFor(sideFor(u, tone), rand),
      },
    ];
  });
}

export interface MosaicBackdropProps {
  /** Color flow: blue, tan, or blue into tan through a pale text band. */
  tone?: MosaicTone;
  /** Fixed seed for a stable layout per section. */
  seed?: number;
  class?: string;
}

/** Light tile-wall panel used as a section background. Purely visual. */
export const MosaicBackdrop: Component<MosaicBackdropProps> = (props) => {
  const cells = buildCells(props.seed ?? 1, props.tone ?? "blue");

  return (
    <svg
      aria-hidden="true"
      data-theme="light"
      class={`pointer-events-none absolute inset-0 size-full ${props.class ?? ""}`}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
    >
      <rect width={W} height={H} style={{ fill: "var(--rl-neutral-50)" }} />
      <For each={cells}>
        {(c) => <rect x={c.x} y={c.y} width={c.w} height={c.h} style={{ fill: c.fill }} />}
      </For>
    </svg>
  );
};
