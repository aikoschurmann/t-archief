import { imageAssetsMap, type WorkItem } from '../utils/workLoader';

export function assetsFor(url: string) {
  return imageAssetsMap[url] || { smSrc: url, mdSrc: url, blurSrc: '' };
}

// Only the optimised variants exist on the site (originals stay local)
export function srcsetFor(url: string) {
  const a = assetsFor(url);
  return a.smSrc !== a.mdSrc ? `${a.smSrc} 800w, ${a.mdSrc} 1600w` : '';
}

export function displaySrc(url: string) {
  return assetsFor(url).mdSrc;
}

/**
 * Dominant colour of an image, sampled from its tiny blur variant.
 * Pixels are grouped into hue families and the strongest family wins, so a red
 * jacket on a grey street reads as red instead of averaging into mud.
 */
const colourCache = new Map<string, Promise<string>>();

export function dominantColour(url: string): Promise<string> {
  if (!colourCache.has(url)) {
    colourCache.set(url, new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        const size = 24;
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = size;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return resolve('#808080');
        ctx.drawImage(img, 0, 0, size, size);
        const d = ctx.getImageData(0, 0, size, size).data;

        const BINS = 24;
        const bins = Array.from({ length: BINS }, () => ({ r: 0, g: 0, b: 0, w: 0 }));
        let greyR = 0, greyG = 0, greyB = 0, greyN = 0;

        for (let i = 0; i < d.length; i += 4) {
          const [r, g, b] = [d[i], d[i + 1], d[i + 2]];
          const { h, s } = hueSat(`rgb(${r}, ${g}, ${b})`);
          const l = (Math.max(r, g, b) + Math.min(r, g, b)) / 510;
          greyR += r; greyG += g; greyB += b; greyN++;
          if (s < 0.18 || l < 0.06 || l > 0.92) continue;
          const bin = bins[Math.floor(h / (360 / BINS)) % BINS];
          bin.r += r * s; bin.g += g * s; bin.b += b * s; bin.w += s;
        }

        // Weigh each bin together with its neighbours so a hue split across two bins still wins
        let best = -1, bestW = 0;
        bins.forEach((_, i) => {
          const w = bins[i].w + 0.5 * (bins[(i + 1) % BINS].w + bins[(i + BINS - 1) % BINS].w);
          if (w > bestW) { bestW = w; best = i; }
        });

        // Colourless photos (black & white) get a neutral grey. The bar is low on purpose:
        // a red costume on a dark stage is only a small part of the picture but is its colour.
        if (best < 0 || bestW < greyN * 0.012) {
          const v = Math.round(Math.min(150, Math.max(90, (greyR + greyG + greyB) / (3 * greyN))));
          return resolve(`rgb(${v}, ${v}, ${v})`);
        }

        const bin = bins[best];
        resolve(normalise(bin.r / bin.w, bin.g / bin.w, bin.b / bin.w));
      };
      img.onerror = () => resolve('#444');
      const a = assetsFor(url);
      img.src = a.smSrc; // sharper than the blur variant, which smears small colourful areas away
    }));
  }
  return colourCache.get(url)!;
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

/** Width / height of an image, read from its small blur variant. */
const ratioCache = new Map<string, Promise<number>>();

export function aspectRatio(url: string): Promise<number> {
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

type Range = { sat: [number, number]; light: [number, number] };
const CALM: Range = { sat: [0.25, 0.6], light: [0.28, 0.62] };
const LIVELY: Range = { sat: [0.4, 0.85], light: [0.36, 0.6] };

/** Keep a colour's hue but pull its lightness and saturation into a readable range. */
function normalise(r: number, g: number, b: number, range: Range = CALM) {
  const { h, s } = hueSat(`rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`);
  const l = (Math.max(r, g, b) + Math.min(r, g, b)) / 510;
  const clamp = (v: number, [lo, hi]: [number, number]) => Math.min(hi, Math.max(lo, v));
  const light = clamp(l, range.light);
  const sat = clamp(range === CALM ? s : s * 1.25, range.sat);

  // HSL → RGB, so every colour this module hands out is an rgb() string hueSat can read
  const a = sat * Math.min(light, 1 - light);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    return Math.round(255 * (light - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))));
  };
  return `rgb(${f(0)}, ${f(8)}, ${f(4)})`;
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
 * One dot colour per project.
 * - A colour set in the editor (meta.json "colour") always wins.
 * - Otherwise the most common hue across all visible photos is used, so one black & white
 *   cover doesn't turn a colourful project grey.
 * - Fully black & white projects get evenly spread greys, so no two look the same.
 */
const projectColourCache = new Map<string, Promise<Record<string, string>>>();

export function projectColours(works: WorkItem[]): Promise<Record<string, string>> {
  const key = works.map(w => `${w.id}:${w.meta?.colour ?? ''}:${w.images.join(',')}`).join('|');
  if (!projectColourCache.has(key)) projectColourCache.set(key, computeProjectColours(works));
  return projectColourCache.get(key)!;
}

async function computeProjectColours(works: WorkItem[]) {
  const result: Record<string, string> = {};
  const greys: { id: string; light: number }[] = [];

  await Promise.all(works.map(async w => {
    const manual = w.meta?.colour;
    if (typeof manual === 'string' && HEX.test(manual)) return (result[w.id] = manual);

    const colours = await Promise.all(w.images.slice(0, 16).map(dominantColour));
    const colourful = colours.map(c => ({ c, ...hueSat(c) })).filter(c => c.s >= 0.12);

    if (!colourful.length) {
      const light = colours.reduce((sum, c) => sum + Number(c.match(/\d+/)?.[0] ?? 128), 0) / (colours.length || 1);
      greys.push({ id: w.id, light });
      return;
    }

    // Pick the hue shared by the most photos (ties go to the more saturated one), then average that group
    const near = (a: number, b: number) => Math.min(Math.abs(a - b), 360 - Math.abs(a - b)) <= 30;
    const best = colourful
      .map(c => ({ c, votes: colourful.filter(o => near(o.h, c.h)).length + c.s * 0.1 }))
      .sort((a, b) => b.votes - a.votes)[0].c;
    const group = colourful.filter(o => near(o.h, best.h)).map(o => (o.c.match(/\d+/g) ?? []).map(Number));
    const avg = [0, 1, 2].map(i => Math.round(group.reduce((sum, rgb) => sum + rgb[i], 0) / group.length));
    result[w.id] = `rgb(${avg[0]}, ${avg[1]}, ${avg[2]})`;
  }));

  // Spread black & white projects over a grey ladder, darkest photos get the darkest grey
  greys.sort((a, b) => a.light - b.light);
  greys.forEach((g, i) => {
    const v = greys.length === 1 ? 128 : Math.round(60 + (i * 120) / (greys.length - 1));
    result[g.id] = `rgb(${v}, ${v}, ${v})`;
  });

  return result;
}

/** RGB pixels of an image's small (800px) variant, scaled down to `size` × `size`. */
const pixelCache = new Map<string, Promise<Uint8ClampedArray | null>>();

function pixels(url: string, size = 48): Promise<Uint8ClampedArray | null> {
  if (!pixelCache.has(url)) {
    pixelCache.set(url, new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = size;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return resolve(null);
        ctx.drawImage(img, 0, 0, size, size);
        resolve(ctx.getImageData(0, 0, size, size).data);
      };
      img.onerror = () => resolve(null);
      // The blur variant smears neighbouring colours together; the small variant keeps them apart
      img.src = assetsFor(url).smSrc;
    }));
  }
  return pixelCache.get(url)!;
}

// Perceptual-ish RGB distance ("redmean"), cheap and good enough to tell colours apart
function distance(a: number[], b: number[]) {
  const rm = (a[0] + b[0]) / 2;
  const [dr, dg, db] = [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  return Math.sqrt((2 + rm / 256) * dr * dr + 4 * dg * dg + (2 + (255 - rm) / 256) * db * db);
}

/**
 * A palette of distinct colours across a set of photos: pixels are pooled into colour
 * buckets, then the biggest buckets are picked as long as they differ enough from the
 * ones already chosen. Colourful pixels weigh much more than neutral ones, and at most
 * one neutral (black, grey, white) makes it in, so large dark or grey areas can't crowd
 * out the actual colours. Fully black & white sets get a range of greys.
 */
const paletteCache = new Map<string, Promise<string[]>>();

type Bucket = { rgb: number[]; w: number; neutral: boolean };

export function palette(urls: string[], count = 5): Promise<string[]> {
  const key = `${count}:${urls.join(',')}`;
  if (!paletteCache.has(key)) {
    paletteCache.set(key, Promise.all(urls.slice(0, 16).map(u => pixels(u))).then(all => {
      const sums = new Map<number, { r: number; g: number; b: number; w: number }>();
      for (const d of all) {
        if (!d) continue;
        for (let i = 0; i < d.length; i += 4) {
          const [r, g, b] = [d[i], d[i + 1], d[i + 2]];
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const sat = max ? (max - min) / max : 0;
          const light = (max + min) / 510;
          // Very dark and very light pixels carry little colour information
          const w = (0.2 + 4 * sat * sat) * (light < 0.08 || light > 0.95 ? 0.3 : 1);
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
    }));
  }
  return paletteCache.get(key)!;
}

/** HSL (h in degrees, s and l 0–1) → rgb() string. */
function fromHsl(h: number, sat: number, light: number) {
  const a = sat * Math.min(light, 1 - light);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    return Math.round(255 * (light - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))));
  };
  return `rgb(${f(0)}, ${f(8)}, ${f(4)})`;
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
  const palettes = await Promise.all(urls.map(u => palette([u], 8)));
  const rgbOf = (c: string) => (c.match(/\d+/g) ?? ['128', '128', '128']).map(Number);
  const SHADES = [0.48, 0.66, 0.32, 0.58, 0.4];
  const GREYS = [130, 95, 165, 75, 150];
  const chosen: { h: number; light: number }[] = [];
  let greys = 0;

  return palettes.map(pal => {
    const candidates = pal
      .map(c => {
        const rgb = rgbOf(c);
        const { h, s } = hueSat(c);
        const light = (Math.max(...rgb) + Math.min(...rgb)) / 510;
        return { h, s, light };
      })
      .filter(c => c.s >= 0.15 && c.light > 0.08 && c.light < 0.92);

    if (!candidates.length) {
      const v = GREYS[greys++ % GREYS.length];
      return `rgb(${v}, ${v}, ${v})`;
    }

    const scored = candidates.map(c => {
      const vivid = c.s * (1 - Math.min(1, Math.abs(c.light - 0.5) * 1.6));
      const novelty = chosen.length ? Math.min(1, Math.min(...chosen.map(o => hueGap(o.h, c.h))) / 70) : 1;
      return { ...c, score: novelty + 0.5 * vivid };
    });
    const best = scored.sort((a, b) => b.score - a.score)[0];

    // Same hue family as earlier dots: step through lighter and darker shades
    const repeats = chosen.filter(o => hueGap(o.h, best.h) < 22).length;
    const light = repeats ? SHADES[repeats % SHADES.length] : Math.min(0.6, Math.max(0.38, best.light));
    const sat = Math.min(0.85, Math.max(0.45, best.s * 1.25));

    chosen.push({ h: best.h, light });
    return fromHsl(best.h, sat, light);
  });
}
