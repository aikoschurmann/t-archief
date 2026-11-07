<script lang="ts">
  import Frame from './Frame.svelte';
  import { wheelStepper } from './gestures';

  // `ratio` (width / height) lets the strip decide per photo whether cropping it is fine
  type Item = { src: string; alt: string; href?: string; ratio?: number };

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
  let boxW = $state(0);

  // Every frame follows its photo's own shape. With "cover" it may grow by up to CROP (never
  // past the box), so a little gets cropped and the photo fills more of the screen without a
  // landscape photo losing most of its width.
  const CROP = 1.2;

  function frameSize(ratio?: number) {
    if (!ratio || !boxW) return { width: boxW, height: boxH };
    const grow = fit === 'cover' ? CROP : 1;
    const natural = Math.min(boxW, boxH * ratio);
    return { width: Math.min(boxW, natural * grow), height: Math.min(boxH, (natural / ratio) * grow) };
  }

  // Frames of nearly the same width (within SNAP of each other, or of the box) all take the
  // widest width of their group, cropping the last bit, so photos of almost the same shape
  // don't sit at slightly different widths. On any screen a strip ends up with a few widths.
  const SNAP = 0.85;

  let sizes = $derived.by(() => {
    const raw = Array.from({ length: count }, (_, i) => ({ ratio: itemAt(i).ratio, ...frameSize(itemAt(i).ratio) }));
    const tops: number[] = [];
    for (const width of [boxW, ...raw.map(r => r.width)].sort((a, b) => b - a)) {
      if (!tops.length || width < tops[tops.length - 1] * SNAP) tops.push(width);
    }
    return raw.map(({ ratio, width, height }) => {
      const top = tops.find(t => width >= t * SNAP) ?? width;
      if (top === width || !ratio) return { width, height };
      // Wider than its own shape: the photo needs top / ratio; "cover" may stay taller (its crop)
      return { width: top, height: Math.min(boxH, Math.max(fit === 'cover' ? height : 0, top / ratio)) };
    });
  });

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

  // A thin scroll bar beside the strip says there is more, and where in the set you are
  let thumb = $derived(1 / Math.max(1, count));
  let thumbAt = $derived(count > 1 ? (indexOf(step) / (count - 1)) * (1 - thumb) : 0);

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
  bind:clientWidth={boxW}
  role="region"
  aria-label="Veeg omhoog of omlaag"
  ontouchstart={onStart}
  ontouchmove={onMove}
  ontouchend={onEnd}
  ontouchcancel={onEnd}
>
  {#each slides as { key, src, alt, href } (key)}
    {@const size = sizes[indexOf(key)] ?? { width: boxW, height: boxH }}
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
      <span class="fit" style:width="{size.width}px" style:height="{size.height}px">
        <Frame {src} {alt} sizes="100vw" />
      </span>
    </svelte:element>
  {/each}
</div>

{#if count > 1}
  <span class="scrollbar" style:top="{boxTop}px" style:height="{boxH}px" aria-hidden="true">
    <span class="thumb" style:height="{thumb * 100}%" style:top="{thumbAt * 100}%"></span>
  </span>
{/if}

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
    display: flex;
    align-items: center;
    justify-content: center;
    -webkit-user-drag: none;
  }
  .fit { display: block; max-width: 100%; }
  .slide.animate { transition: transform 900ms cubic-bezier(0.16, 1, 0.3, 1); }

  /* Sits in the right-hand gutter, next to the strip */
  .scrollbar {
    position: fixed;
    right: 2px;
    width: 2px;
    background: var(--cell);
    pointer-events: none;
  }
  .thumb {
    position: absolute;
    left: 0;
    right: 0;
    background: var(--fg);
    transition: top 900ms cubic-bezier(0.16, 1, 0.3, 1);
  }
</style>
