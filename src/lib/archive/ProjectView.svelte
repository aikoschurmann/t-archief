<script lang="ts">
  import { onMount } from 'svelte';
  import type { WorkItem } from '../utils/workLoader';
  import { palette, displaySrc, srcsetFor, pad, photoDotColours, swatch, aspectRatio } from './media';
  import Strip from './Strip.svelte';
  import { navigate } from './router.svelte';
  import { altFor } from '../site';

  let { item, colour = 'var(--cell)', onIndex }: { item: WorkItem; colour?: string; onIndex: (i: number) => void } = $props();

  let track: HTMLDivElement;
  let current = $state(0);
  let swatches: string[] = $state([]);

  // Smoothed horizontal scrolling: wheel input moves a target, the track eases towards it
  let pos = 0;
  let target = 0;
  let raf = 0;

  $effect(() => {
    swatches = palette(item.images, 5).map(swatch);
  });

  $effect(() => onIndex(current));

  // Phones: one photo at a time in a vertical strip, with a dot per photo (in its colour once you're on it)
  let viewW = $state(1200);
  let viewH = $state(800);
  let mobile = $derived(viewW <= 768);
  let mStep = $state(0);
  let photoColours: Record<string, string> = $state({});
  let ratios: Record<string, number> = $state({});

  $effect(() => {
    for (const img of item.images) aspectRatio(img).then(r => (ratios[img] = r));
  });
  const ROW = 32;
  const alt = (i: number) => altFor(item.title, item.meta?.category, i, item.images.length);
  // The same as the desktop bar: category and year
  let details = $derived([item.meta?.category, item.meta?.year ?? item.meta?.date].filter(Boolean));

  $effect(() => {
    photoDotColours(item.images).then(list => {
      photoColours = Object.fromEntries(item.images.map((img, i) => [img, list[i]]));
    });
  });

  $effect(() => {
    if (mobile) current = mStep;
  });

  let rows = $derived(
    Array.from({ length: Math.ceil(viewH / ROW) + 2 }, (_, i) => mStep - 1 + i).filter(k => k >= 0 && k < item.images.length)
  );

  function slides() {
    return Array.from(track.children) as HTMLElement[];
  }

  function glide() {
    const diff = target - pos;
    if (Math.abs(diff) < 0.5) {
      pos = target;
      track.scrollLeft = pos;
      raf = 0;
      return;
    }
    pos += diff * 0.1;
    track.scrollLeft = pos;
    raf = requestAnimationFrame(glide);
  }

  function scrollToX(x: number) {
    if (!raf) pos = track.scrollLeft;
    target = Math.max(0, Math.min(track.scrollWidth - track.clientWidth, x));
    if (!raf) raf = requestAnimationFrame(glide);
  }

  function goTo(i: number) {
    const all = slides();
    const index = Math.max(0, Math.min(all.length - 1, i));
    scrollToX(all[index].offsetLeft - track.offsetLeft - parseFloat(getComputedStyle(track).paddingLeft));
  }

  // Desktop: a thin bar under the track shows how much of the project is in view, and where
  let bar = $state({ size: 1, at: 0 });

  function measure() {
    if (!track?.scrollWidth) return;
    bar = { size: track.clientWidth / track.scrollWidth, at: track.scrollLeft / track.scrollWidth };
  }

  function onScroll() {
    measure();
    const all = slides();
    const x = track.scrollLeft;
    let best = 0;
    all.forEach((el, i) => {
      if (Math.abs(el.offsetLeft - track.offsetLeft - x) < Math.abs(all[best].offsetLeft - track.offsetLeft - x)) best = i;
    });
    // At the far right the last slides can't snap to the left edge; treat the end as the last slide
    if (x + track.clientWidth >= track.scrollWidth - 8) best = all.length - 1;
    current = best;
  }

  // Vertical wheel and trackpad movement both scroll the track sideways
  function onWheel(e: WheelEvent) {
    if (!desktop()) return;
    e.preventDefault();
    const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
    const step = e.deltaMode === 1 ? delta * 40 : delta;
    scrollToX((raf ? target : track.scrollLeft) + step * 1.2);
  }

  function onKey(e: KeyboardEvent) {
    if (e.key === 'Escape') navigate('/');
    // Phones: the strip handles arrow keys itself
    if (mobile) return;
    if (e.key === 'ArrowRight') goTo(current + 1);
    if (e.key === 'ArrowLeft') goTo(current - 1);
  }

  function desktop() {
    return window.matchMedia('(min-width: 769px)').matches;
  }

  onMount(() => {
    window.scrollTo(0, 0);
    // Listen on the whole window so scrolling works wherever the cursor is
    window.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      window.removeEventListener('wheel', onWheel);
      cancelAnimationFrame(raf);
    };
  });
</script>

<svelte:window onkeydown={onKey} onresize={measure} bind:innerWidth={viewW} bind:innerHeight={viewH} />

{#if mobile}
  <div class="m-dots" aria-hidden="true">
    {#each rows as k (k)}
      <span
        class="m-dot"
        class:active={k === mStep}
        class:faded={k - mStep > 2}
        style:--colour={photoColours[item.images[k]] ?? colour}
        style:transform="translateY({(k - mStep) * ROW + 12}px)"
      ></span>
    {/each}
  </div>

  <!-- Black title and a details row, so a project doesn't look like the home page -->
  <div class="m-top grid">
    <span class="cell current m-title">{item.title}</span>
    <span class="cell m-counter">{pad(mStep + 1)} / {pad(item.images.length)}</span>
    {#if details.length}
      <span class="cell m-details">{details.join(' · ')}</span>
    {/if}
  </div>

  <Strip
    bind:step={mStep}
    count={item.images.length}
    itemAt={i => ({ src: item.images[i], alt: alt(i), ratio: ratios[item.images[i]] })}
    fit="contain"
    {viewH}
  />
{/if}

<div class="project">
  <!-- Everything about the project in one bar next to its colours (the counter is in the top bar) -->
  <div class="meta grid">
    <span class="name">
      <span class="dot" style:background={colour}></span>
      <span class="cell title">{item.title}</span>
    </span>
    {#if item.meta?.category}
      <span class="cell cat">{item.meta.category}</span>
    {/if}
    {#if item.meta?.year ?? item.meta?.date ?? item.description}
      <span class="cell year">{item.meta?.year ?? item.meta?.date ?? item.description}</span>
    {/if}
    <span class="swatches">
      {#each swatches as s}
        <span class="swatch" style:background={s}></span>
      {/each}
    </span>
  </div>

  <div class="track" bind:this={track} onscroll={onScroll}>
    {#each item.images as img, i}
      <button class="slide" onclick={() => goTo(i === current ? i + 1 : i)} aria-label="Beeld {pad(i + 1)}">
        <img
          src={displaySrc(img)}
          srcset={srcsetFor(img)}
          sizes="(max-width: 768px) 100vw, 70vw"
          alt={alt(i)}
          loading={i < 3 ? 'eager' : 'lazy'}
          onload={measure}
        />
      </button>
    {/each}
  </div>

  <span class="scrollbar" class:hidden={bar.size >= 1} aria-hidden="true">
    <span class="thumb" style:width="{bar.size * 100}%" style:left="{bar.at * 100}%"></span>
  </span>
</div>

<style>
  .project {
    height: 100vh;
    display: flex;
    flex-direction: column;
    padding-top: calc(var(--gap) * 2 + var(--bar));
    padding-bottom: calc(var(--gap) * 2 + var(--bar));
  }


  .meta {
    margin-top: auto;
    margin-bottom: var(--gap);
    align-items: center;
  }
  .name {
    grid-column: 1 / 7;
    display: flex;
    gap: var(--gap);
    min-width: 0;
  }
  .title { flex: 1; min-width: 0; }
  .dot {
    flex: none;
    width: var(--bar);
    height: var(--bar);
    border-radius: 50%;
    transition: background 0.6s ease;
  }
  .cat { grid-column: 7 / 9; }
  .year { grid-column: 9 / 11; }
  .swatches {
    grid-column: 11 / 13;
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 6px;
    height: var(--bar);
  }
  .swatch { transition: background 0.6s ease; }

  .track {
    height: min(70vh, calc(100vh - 12rem));
    display: flex;
    gap: var(--gap);
    padding: 0 var(--gap);
    overflow-x: auto;
    scrollbar-width: none;
  }
  .track::-webkit-scrollbar { display: none; }

  .slide {
    flex: none;
    height: 100%;
    cursor: e-resize;
    padding: 0;
  }
  .slide img {
    height: 100%;
    width: auto;
    display: block;
    background: var(--cell);
  }

  .scrollbar {
    position: relative;
    height: 2px;
    margin: var(--gap) var(--gap) 0;
    background: var(--cell);
    transition: opacity var(--speed) var(--ease);
  }
  .scrollbar.hidden { opacity: 0; }
  .thumb {
    position: absolute;
    top: 0;
    bottom: 0;
    background: var(--fg);
  }

  /* Phones: the strip above replaces the desktop layout */
  .m-dots {
    position: fixed;
    top: 0;
    left: 0;
    width: 44px;
    bottom: 0;
    overflow: hidden;
    z-index: 40;
    pointer-events: none;
  }
  .m-dot {
    position: absolute;
    top: 0;
    left: var(--gap);
    width: var(--bar);
    height: var(--bar);
    border-radius: 50%;
    background: var(--dot);
    transition: transform 700ms cubic-bezier(0.33, 1, 0.68, 1), border-radius var(--speed) var(--ease),
      background var(--speed) var(--ease), opacity var(--speed) var(--ease), filter var(--speed) var(--ease);
  }
  /* Grey dots; the photo you're on shows its colour */
  .m-dot.active { border-radius: 0; background: var(--colour); }
  .m-dot.faded { opacity: 0; filter: blur(1px); }

  .m-top {
    position: fixed;
    top: var(--gap);
    left: 0;
    right: 0;
    z-index: 50;
  }
  .m-title { grid-column: 1 / 6; grid-row: 1; margin-left: calc(var(--bar) + var(--gap)); }
  .m-counter { grid-column: 6 / 7; grid-row: 1; justify-content: center; font-variant-numeric: tabular-nums; }
  .m-details { grid-column: 1 / 7; grid-row: 2; margin: 6px 0 0 calc(var(--bar) + var(--gap)); }

  @media (max-width: 768px) {
    .project { display: none; }
  }
</style>
