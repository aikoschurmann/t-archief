<script lang="ts">
  import { untrack } from 'svelte';
  import { cubicInOut } from 'svelte/easing';
  import type { WorkItem } from '../utils/workLoader';
  import { aspectRatio } from './media';
  import Frame from './Frame.svelte';
  import Strip from './Strip.svelte';
  import { wheelStepper } from './gestures';

  let {
    works,
    current = $bindable(0),
    work = $bindable(),
    colours = {}
  }: { works: WorkItem[]; current?: number; work?: WorkItem; colours?: Record<string, string> } = $props();

  // Index of the visible project. It starts at `current`, so coming back from a project lands
  // on that project.
  let step = $state(untrack(() => current));
  let viewH = $state(800);
  let viewW = $state(1200);
  // Phones: a vertical photo strip and a short dot column (measured from the reference site)
  let mobile = $derived(viewW <= 768);
  const firstRow = 12;
  let row = $derived(mobile ? 32 : 44);
  let roll = $derived(mobile ? 6 : 15);
  let hoveredKey: number | null = $state(null);
  let ratios: Record<string, number> = $state({});
  let blockW = $state(0);
  let blockH = $state(0);

  $effect(() => {
    for (const w of works) {
      if (!w.url) continue;
      for (const img of w.images) aspectRatio(img).then(r => (ratios[img] = r));
    }
  });

  // Projects follow the order set in the editor (#/edit), stored as `order` in meta.json
  let ordered = $derived(works);

  $effect(() => {
    if (!ordered.length) return;
    current = Math.min(step, ordered.length - 1);
    work = ordered[current];
  });

  // The block height never changes. Photos keep their own shape at that height and as many
  // as fit are shown (max 3). When photos are too wide together, every tile gets equally
  // narrower and crops a little at the sides instead of the whole block shrinking.
  const GAP = 12;
  let layout = $derived.by(() => {
    const w = work;
    if (!w || !blockW) return [] as { src: string; width: number }[];
    const ratio = (src: string) => ratios[src] ?? 1.5;
    const all = [w.url, ...w.images.filter(i => i !== w.url)];

    let frames: string[];
    if (w.home?.length) {
      // Photos picked in the editor are always shown
      frames = w.home.slice(0, 3);
    } else {
      frames = [];
      let used = 0;
      for (const src of all) {
        const width = blockH * ratio(src) + (frames.length ? GAP : 0);
        if (frames.length && used + width > blockW) break;
        frames.push(src);
        used += width;
        if (frames.length === 3) break;
      }
      // Rather two slightly cropped photos than one on its own
      if (frames.length === 1 && all.length > 1) frames = all.slice(0, 2);
    }
    if (frames.some(src => ratios[src] === undefined)) return [];

    const natural = frames.map(src => blockH * ratio(src));
    const room = blockW - GAP * (frames.length - 1);
    const total = natural.reduce((a, b) => a + b, 0);
    const shrink = Math.min(1, room / total);
    return frames.map((src, i) => ({ src, width: natural[i] * shrink }));
  });

  // One dot per project. The current one becomes the square in the top-left corner; the ones
  // before it slide up out of view.
  let rows = $derived(ordered.map((w, key) => ({ key, w })));

  // Title text rolls: the old line rises out, the new one rises in from below
  function rollIn(_node: Element) {
    const d = roll;
    return { duration: 400, easing: cubicInOut, css: (t: number) => `opacity: ${t}; transform: translateY(${(1 - t) * d}px);` };
  }
  function rollOut(_node: Element) {
    const d = roll;
    return { duration: 400, easing: cubicInOut, css: (t: number) => `opacity: ${t}; transform: translateY(${-(1 - t) * d}px);` };
  }

  function go(delta: number) {
    step = Math.max(0, Math.min(ordered.length - 1, step + delta));
  }

  // Desktop: one wheel/trackpad swipe = one project (phones: the strip handles input itself)
  const onWheel = wheelStepper(direction => {
    if (!mobile) go(direction);
  });

  // Tablets: a swipe in either direction moves one project
  let touchStart: { x: number; y: number } | null = null;

  function onTouchStart(e: TouchEvent) {
    if (mobile) return;
    touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }

  function onTouchEnd(e: TouchEvent) {
    if (!touchStart) return;
    const dx = touchStart.x - e.changedTouches[0].clientX;
    const dy = touchStart.y - e.changedTouches[0].clientY;
    touchStart = null;
    const delta = Math.abs(dy) > Math.abs(dx) ? dy : dx;
    if (Math.abs(delta) > 40) go(delta > 0 ? 1 : -1);
  }

  function onKey(e: KeyboardEvent) {
    if (mobile) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') go(1);
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') go(-1);
  }
</script>

<svelte:window
  onwheel={onWheel}
  onkeydown={onKey}
  ontouchstart={onTouchStart}
  ontouchend={onTouchEnd}
  bind:innerHeight={viewH}
  bind:innerWidth={viewW}
/>

<div class="dots" aria-label="Projecten">
  {#each rows as { key, w } (key)}
    <button
      class="row"
      class:active={key === step}
      class:faded={mobile && key - step > 2}
      style:transform="translateY({(key - step) * row + firstRow}px)"
      onclick={() => (step = key)}
      onmouseenter={() => (hoveredKey = key)}
      onmouseleave={() => (hoveredKey = null)}
      aria-label={w.title}
      tabindex={key === step ? -1 : 0}
    >
      <span class="dot" style:background={colours[w.id]}></span>
      <span class="label" class:show={hoveredKey === key && key !== step}>{w.title}</span>
    </button>
  {/each}
</div>

{#if work}
  <div class="title-bar grid">
    <a href={work.href} class="title cell">
      {#key work.id}
        <span class="line" in:rollIn out:rollOut>{work.title}<span class="go">&nbsp;→</span></span>
      {/key}
    </a>
    <span class="cell counter">{String(current + 1).padStart(2, '0')} / {String(ordered.length).padStart(2, '0')}</span>
  </div>
{/if}

{#if mobile}
  <Strip
    bind:step
    count={ordered.length}
    itemAt={i => {
      const src = ordered[i].home?.[0] ?? ordered[i].url;
      return { src, alt: ordered[i].title, href: ordered[i].href, ratio: ratios[src] };
    }}
    {viewH}
  />
{:else}
<div class="stage grid">
  {#if work}
    <a href={work.href} class="block" bind:clientWidth={blockW} bind:clientHeight={blockH}>
      {#each layout as { src, width } (src)}
        <span class="tile" style:width="{width}px">
          <Frame {src} alt={work.title} sizes="50vw" />
        </span>
      {/each}
    </a>
  {/if}
</div>
{/if}

<style>
  .dots {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    width: 40vw;
    overflow: hidden;
    z-index: 40;
    pointer-events: none;
  }

  .row {
    position: absolute;
    top: 0;
    left: var(--gap);
    display: flex;
    align-items: center;
    padding: 0;
    cursor: pointer;
    pointer-events: auto;
    transition: transform 700ms cubic-bezier(0.33, 1, 0.68, 1), opacity var(--speed) var(--ease), filter var(--speed) var(--ease);
  }
  .row.faded { opacity: 0; filter: blur(1px); pointer-events: none; }

  .dot {
    width: var(--bar);
    height: var(--bar);
    border-radius: 50%;
    transition: border-radius var(--speed) var(--ease);
  }
  .row:hover .dot, .row.active .dot { border-radius: 0; }

  .label {
    position: absolute;
    left: calc(100% + 18px);
    font-size: var(--label);
    font-weight: 700;
    white-space: nowrap;
    opacity: 0;
    transform: translateX(-4px);
    pointer-events: none;
    transition: opacity var(--speed) var(--ease), transform var(--speed) var(--ease);
  }
  .label.show { opacity: 0.3; transform: none; }

  .title-bar {
    position: fixed;
    top: var(--gap);
    left: 0;
    right: 0;
    z-index: 50;
    pointer-events: none;
  }

  .title {
    grid-column: 1 / 5;
    grid-row: 1;
    margin-left: calc(var(--bar) + var(--gap));
    position: relative;
    pointer-events: auto;
  }

  /* The counter lives in the top bar on desktop */
  .counter { display: none; }

  .line {
    position: absolute;
    left: 6px;
    right: 6px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .stage {
    height: 100vh;
    align-items: center;
  }

  .block {
    grid-column: 2 / 12;
    height: 64vh;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: var(--gap);
  }

  .tile {
    height: 100%;
    max-width: 100%;
    flex: none;
  }


  @media (max-width: 768px) {
    .label { display: none; }
    .title { grid-column: 1 / 6; }
    .counter { display: flex; grid-column: 6 / 7; grid-row: 1; justify-content: center; font-variant-numeric: tabular-nums; }
  }
</style>
