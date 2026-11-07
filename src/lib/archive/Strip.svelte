<script lang="ts">
  import Frame from './Frame.svelte';
  import { wheelStepper } from './gestures';

  type Item = { src: string; alt: string; href?: string };

  // Phones: a vertical strip of photo boxes (60% of the screen high, 6px apart), seen through
  // a window of one box, that follows the finger and glides to the next item on release.
  // Measured from the reference site.
  let {
    count,
    itemAt,
    step = $bindable(0),
    loop = false,
    fit = 'cover',
    viewH
  }: {
    count: number;
    itemAt: (index: number) => Item;
    step?: number;
    loop?: boolean;
    fit?: 'cover' | 'contain';
    viewH: number;
  } = $props();

  const GAP = 6;
  let boxH = $derived(Math.round(viewH * 0.6));
  let boxTop = $derived(Math.round((viewH - boxH) / 2));
  let drag = $state(0);
  let dragging = $state(false);
  let moved = false;
  let start: { x: number; y: number; t: number } | null = null;

  const indexOf = (k: number) => (loop ? ((k % count) + count) % count : k);

  let slides = $derived(
    [-1, 0, 1, 2]
      .map(i => step + i)
      .filter(k => loop || (k >= 0 && k < count))
      .map(k => ({ key: k, ...itemAt(indexOf(k)) }))
  );

  function go(delta: number) {
    const next = step + delta;
    if (loop || (next >= 0 && next < count)) step = next;
  }

  // Without touch (e.g. a narrow desktop window): wheel, trackpad and arrow keys step too
  const onWheel = wheelStepper(go);

  function onKey(e: KeyboardEvent) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') go(1);
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') go(-1);
  }

  function onStart(e: TouchEvent) {
    start = { x: e.touches[0].clientX, y: e.touches[0].clientY, t: performance.now() };
    moved = false;
  }

  function onMove(e: TouchEvent) {
    if (!start) return;
    const dy = e.touches[0].clientY - start.y;
    const dx = e.touches[0].clientX - start.x;
    if (!dragging && (Math.abs(dy) < 6 || Math.abs(dx) > Math.abs(dy))) return;
    dragging = true;
    moved = true;
    // Resist at the ends of a non-looping strip
    const atEnd = !loop && ((dy > 0 && step === 0) || (dy < 0 && step === count - 1));
    drag = atEnd ? dy * 0.3 : dy;
  }

  function onEnd() {
    if (!start) return;
    const velocity = drag / Math.max(1, performance.now() - start.t);
    if (drag < -60 || velocity < -0.4) go(1);
    else if (drag > 60 || velocity > 0.4) go(-1);
    drag = 0;
    dragging = false;
    start = null;
  }

  // A drag shouldn't also count as a tap
  function onClick(e: MouseEvent) {
    if (moved) e.preventDefault();
  }
</script>

<svelte:window onwheel={onWheel} onkeydown={onKey} />

<div
  class="strip"
  style:top="{boxTop}px"
  style:height="{boxH}px"
  role="region"
  aria-label="Veeg omhoog of omlaag"
  ontouchstart={onStart}
  ontouchmove={onMove}
  ontouchend={onEnd}
  ontouchcancel={onEnd}
>
  {#each slides as { key, src, alt, href } (key)}
    <svelte:element
      this={href ? 'a' : 'div'}
      {href}
      class="slide"
      class:animate={!dragging}
      style:height="{boxH}px"
      style:transform="translateY({(key - step) * (boxH + GAP) + drag}px)"
      onclick={onClick}
      role={href ? undefined : 'presentation'}
    >
      <Frame {src} {alt} {fit} sizes="100vw" />
    </svelte:element>
  {/each}
</div>

<style>
  .strip {
    position: fixed;
    left: var(--gap);
    right: var(--gap);
    overflow: hidden;
    touch-action: none;
  }

  .slide {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    display: block;
    -webkit-user-drag: none;
  }
  .slide.animate { transition: transform 900ms cubic-bezier(0.16, 1, 0.3, 1); }
</style>
