import { imageAssetsMap, type WorkItem } from '../utils/workLoader';
import measuredColours from '../assets/work/colours.json';

export function assetsFor(url: string) {
  return imageAssetsMap[url] || { smSrc: url, mdSrc: url, blurSrc: '', key: '' };
}

// Only the optimised variants exist on the site (originals stay local)
export function srcsetFor(url: string) {
  const a = assetsFor(url);
  return a.smSrc !== a.mdSrc ? `${a.smSrc} 800w, ${a.mdSrc} 1600w` : '';
}

export function displaySrc(url: string) {
  return assetsFor(url).mdSrc;
}

/*
 * Photo colours are measured once by process_images_optimized.py and stored in colours.json,
 * instead of read from a canvas here: Safari adds noise to canvas pixel reads, so every
 * browser would show slightly different dots. Photos added since the script last ran have no
 * entry yet and count as grey until it runs again.
 */
type Measured = { ratio: number; dominant: string; buckets: number[][] }; // bucket: [r, g, b, weight]
const measured = measuredColours as Record<string, Measured>;

const measuredFor = (url: string): Measured | undefined => measured[assetsFor(url).key];

/**
 * Dominant colour of an image: its pixels grouped into hue families, the strongest family
 * wins, so a red jacket on a grey street reads as red instead of averaging into mud.
 */
export function dominantColour(url: string) {
  return measuredFor(url)?.dominant ?? 'rgb(128, 128, 128)';
}

export function pad(n: number) {
  return String(n).padStart(2, '0');
}

/** Hue (0–360) and saturation (0–1) of an `rgb(r, g, b)` string. */
export function hueSat(rgb: string) {
  const [r, g, b] = (rgb.match(/\d+/g) ?? ['0', '0', '0']).map(n => Number(n) / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
  }
  return { h: (h * 60 + 360) % 360, s: max ? d / max : 0 };
}

/** Width / height of an image: measured with the colours, or read from its small blur variant. */
const ratioCache = new Map<string, Promise<number>>();

export function aspectRatio(url: string): Promise<number> {
  const known = measuredFor(url)?.ratio;
  if (known) return Promise.resolve(known);
  if (!ratioCache.has(url)) {
    ratioCache.set(url, new Promise(resolve => {
      const img = new Image();
      img.onload = () => resolve(img.naturalWidth / img.naturalHeight || 1.5);
      img.onerror = () => resolve(1.5);
      const a = assetsFor(url);
      img.src = a.blurSrc || a.smSrc;
    }));
  }
  return ratioCache.get(url)!;
}

/** Sort key that runs cool → warm (greens, blues, purples, reds, oranges); greys go first. */
export function temperature(colour: string) {
  const { h, s } = hueSat(colour);
  if (s < 0.12) return -1;
  return (h - 80 + 360) % 360;
}

const HEX = /^#[0-9a-f]{6}$/i;

export function toHex(colour: string) {
  if (HEX.test(colour)) return colour;
  const [r, g, b] = (colour.match(/\d+/g) ?? ['128', '128', '128']).map(Number);
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

/**
 * One dot colour per project, from its own photos, tuned so the column reads as one run:
 * - each dot keeps its project's strongest hue, nudged a little (at most HUE_PULL degrees)
 *   towards its neighbours in the editor's order, so jumps between dots soften;
 * - lightness runs from light at the top of the column to dark at the bottom;
 * - a colour set in the editor (meta.json "colour") always wins.
 */
const projectColourCache = new Map<string, Promise<Record<string, string>>>();

export function projectColours(works: WorkItem[]): Promise<Record<string, string>> {
  const key = works.map(w => `${w.id}:${w.meta?.colour ?? ''}:${w.images.join(',')}`).join('|');
  if (!projectColourCache.has(key)) projectColourCache.set(key, computeProjectColours(works));
  return projectColourCache.get(key)!;
}

/**
 * The strongest hue family among a set of photo colours. Photos within 20° of hue form a
 * family, and a family weighs by how vivid its colours are rather than how many photos it
 * has: one red costume photo outweighs a few faintly orange skin tones or a dim blue stage.
 * The hue is averaged as an angle, so a set of reds stays red instead of turning brown.
 */
function strongestHue(colours: string[]) {
  const colourful = colours.map(toOklch).filter(c => c.C >= 0.02);
  if (!colourful.length) return null;
  const rad = Math.PI / 180;
  const family = (seed: { h: number }) => colourful.filter(o => hueGap(o.h, seed.h) <= 20);
  const strength = (group: { C: number }[]) => group.reduce((sum, o) => sum + o.C * o.C, 0);
  const group = colourful.map(family).sort((a, b) => strength(b) - strength(a))[0];
  const x = group.reduce((sum, o) => sum + o.C * Math.cos(o.h * rad), 0);
  const y = group.reduce((sum, o) => sum + o.C * Math.sin(o.h * rad), 0);
  return {
    h: (Math.atan2(y, x) / rad + 360) % 360,
    C: Math.sqrt(strength(group) / group.length),
    L: group.reduce((sum, o) => sum + o.L, 0) / group.length
  };
}

async function computeProjectColours(works: WorkItem[]) {
  const result: Record<string, string> = {};
  const found = works.map(w => strongestHue(w.images.slice(0, 16).map(dominantColour)));
  const own = found.map(f => (f ? settleHue(f.h, f.L) : null));

  // Soften the jumps: every hue moves towards the average of its neighbours, but never
  // further than HUE_PULL from its own, so a red project stays red
  const signed = (from: number, to: number) => ((to - from + 540) % 360) - 180;
  let hues = own;
  for (let round = 0; round < 30; round++) {
    hues = own.map((h, i) => {
      if (h === null) return null;
      const near = [hues[i - 1], hues[i + 1]].filter((n): n is number => n != null);
      if (!near.length) return h;
      const pull = near.reduce((sum, n) => sum + signed(h, n), 0) / near.length / 2;
      return (h + clamp(pull, -HUE_PULL, HUE_PULL) + 360) % 360;
    });
  }

  works.forEach((w, i) => {
    const manual = w.meta?.colour;
    if (typeof manual === 'string' && HEX.test(manual)) return (result[w.id] = manual);
    const L = DOT.L[0] + (DOT.L[1] - DOT.L[0]) * (works.length > 1 ? i / (works.length - 1) : 0.5);
    const h = hues[i];
    result[w.id] = h === null ? fromOklch(L, 0, 0) : dot(h, L);
  });

  return result;
}

// Perceptual-ish RGB distance ("redmean"), cheap and good enough to tell colours apart
function distance(a: number[], b: number[]) {
  const rm = (a[0] + b[0]) / 2;
  const [dr, dg, db] = [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  return Math.sqrt((2 + rm / 256) * dr * dr + 4 * dg * dg + (2 + (255 - rm) / 256) * db * db);
}

/**
 * A palette of distinct colours across a set of photos: their measured colour buckets are
 * pooled, then the biggest buckets are picked as long as they differ enough from the
 * ones already chosen. Colourful pixels weigh much more than neutral ones, and at most
 * one neutral (black, grey, white) makes it in, so large dark or grey areas can't crowd
 * out the actual colours. Fully black & white sets get a range of greys.
 */
type Bucket = { rgb: number[]; w: number; neutral: boolean };

export function palette(urls: string[], count = 5): string[] {
  // Buckets from different photos that fall in the same colour cell merge
  const sums = new Map<number, { r: number; g: number; b: number; w: number }>();
  for (const url of urls.slice(0, 16)) {
    for (const [r, g, b, w] of measuredFor(url)?.buckets ?? []) {
      const key = ((r >> 5) << 6) | ((g >> 5) << 3) | (b >> 5);
      const sum = sums.get(key) ?? { r: 0, g: 0, b: 0, w: 0 };
      sum.r += r * w; sum.g += g * w; sum.b += b * w; sum.w += w;
      sums.set(key, sum);
    }
  }

  const ranked: Bucket[] = [...sums.values()]
    .map(s => {
      const rgb = [s.r / s.w, s.g / s.w, s.b / s.w];
      const max = Math.max(...rgb);
      const min = Math.min(...rgb);
      const light = (max + min) / 510;
      const neutral = (max ? (max - min) / max : 0) < 0.18 || light < 0.1 || light > 0.92;
      return { rgb, w: s.w, neutral };
    })
    .sort((a, b) => b.w - a.w);

  const colourful = ranked.filter(b => !b.neutral);
  const maxNeutrals = colourful.length ? 1 : count;

  // Greedy pick; relax the "different enough" threshold if the photos are very uniform
  for (const minDistance of [120, 90, 65, 40, 0]) {
    const picked: Bucket[] = [];
    let neutrals = 0;
    for (const c of ranked) {
      if (c.neutral && neutrals >= maxNeutrals) continue;
      if (!picked.every(p => distance(p.rgb, c.rgb) >= minDistance)) continue;
      picked.push(c);
      if (c.neutral) neutrals++;
      if (picked.length === count) break;
    }
    if (picked.length === count || minDistance === 0) {
      return picked.map(({ rgb: [r, g, b] }) => `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`);
    }
  }
  return [];
}

const hueGap = (a: number, b: number) => {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
};

/**
 * One dot colour per photo of a project, chosen for the project as a whole: each photo
 * offers its palette, and a colour scores mostly on how far its hue is from every dot
 * already chosen, plus a bit for being vivid. When a hue still repeats (a series that
 * really is all red) the repeat gets a lighter or darker shade so neighbours stay apart.
 * Black & white photos get greys of different lightness.
 */
export async function photoDotColours(urls: string[]): Promise<string[]> {
  const palettes = urls.map(u => palette([u], 8));
  const SHADES = [0, 0.08, -0.08, 0.04, -0.04];
  const GREYS = [0.5, 0.2, 0.8, 0.35, 0.65];
  const chosen: number[] = [];
  let greys = 0;

  return palettes.map(pal => {
    const candidates = pal.map(toOklch).filter(c => c.C >= 0.04 && c.L > 0.2 && c.L < 0.95);

    if (!candidates.length) return grey(GREYS[greys++ % GREYS.length]);

    const best = candidates
      .map(c => {
        const h = settleHue(c.h, c.L);
        const novelty = chosen.length ? Math.min(1, Math.min(...chosen.map(o => hueGap(o, h))) / 70) : 1;
        return { h, score: novelty + 0.5 * Math.min(1, c.C / 0.15) };
      })
      .sort((a, b) => b.score - a.score)[0];

    // Same hue family as earlier dots: step through lighter and darker shades
    const repeats = chosen.filter(o => hueGap(o, best.h) < 22).length;
    chosen.push(best.h);
    return dot(best.h, 0.58 + SHADES[repeats % SHADES.length]);
  });
}

/*
 * Every colour the site hands out goes through OKLCH, where equal lightness also looks equal
 * (in HSL a yellow and a blue of the same "lightness" are worlds apart). Dots share one
 * strong chroma; the project column runs from DOT.L[0] at the top to DOT.L[1] at the bottom.
 */
const DOT = { C: 0.19, L: [0.6, 0.46] as const };
const HUE_PULL = 15;
const GREY_L = [0.5, 0.8] as const;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** OKLCH lightness (0–1), chroma (0–~0.37) and hue (degrees) of an `rgb(r, g, b)` string. */
export function toOklch(rgb: string) {
  const [r, g, b] = (rgb.match(/\d+/g) ?? ['0', '0', '0']).map(n => {
    const c = Number(n) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return { L, C: Math.hypot(A, B), h: (Math.atan2(B, A) * 180 / Math.PI + 360) % 360 };
}

/** OKLCH → rgb() string; chroma is lowered until the colour fits in sRGB. */
function fromOklch(L: number, C: number, h: number) {
  const rad = h * Math.PI / 180;
  for (let c = C; ; c = Math.max(0, c - 0.005)) {
    const A = c * Math.cos(rad);
    const B = c * Math.sin(rad);
    const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
    const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
    const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
    const lin = [
      4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
      -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
      -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s
    ];
    if (c > 0 && lin.some(v => v < -0.001 || v > 1.001)) continue;
    const [R, G, Bl] = lin.map(v => {
      const x = clamp(v, 0, 1);
      return Math.round(255 * (x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055));
    });
    return `rgb(${R}, ${G}, ${Bl})`;
  }
}

/** A dot colour: hue `h` at lightness `L` and the shared chroma. */
function dot(h: number, L: number) {
  // Real yellows only read as yellow when lighter; at dot lightness they turn olive
  return fromOklch(L + 0.15 * Math.max(0, 1 - hueGap(h, 95) / 25), DOT.C, h);
}

/**
 * A photo hue as people would name it. Shaded foliage measures as a dark yellow-green but
 * reads as green, while real yellows are light; so dark hues from yellow to green move to
 * green. `sourceL` is how light the colour was in the photo.
 */
function settleHue(h: number, sourceL: number) {
  if (sourceL < 0.65 && h > 85 && h < 160) h += (148 - h) * 0.85 * Math.min(1, (h - 85) / 15);
  return h;
}

/** A grey from the one ladder all black & white work shares, `t` 0 (dark) to 1 (light). */
function grey(t: number) {
  return fromOklch(GREY_L[0] + t * (GREY_L[1] - GREY_L[0]), 0, 0);
}

/** A swatch: keeps the photo's own hue and lightness, but within the site's palette. */
export function swatch(colour: string) {
  const { L, C, h } = toOklch(colour);
  const light = clamp(L, 0.4, 0.75);
  return C < 0.03 ? fromOklch(light, 0, 0) : fromOklch(light, clamp(C, 0.08, 0.17), h);
}
