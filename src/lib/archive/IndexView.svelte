<script lang="ts">
  import type { WorkItem } from '../utils/workLoader';
  import { pad } from './media';
  import Frame from './Frame.svelte';

  let { works, colours = {} }: { works: WorkItem[]; colours?: Record<string, string> } = $props();

  // Desktop: the cover of the hovered project, the first one until you hover
  let hovered: WorkItem | undefined = $state();
  let preview = $derived(hovered ?? works[0]);

  function onKey(e: KeyboardEvent) {
    if (e.key === 'Escape') location.hash = '#/';
  }
</script>

<svelte:window onkeydown={onKey} />

<div class="index grid">
  <ol class="list">
    {#each works as w, i (w.id)}
      <li>
        <a
          href={w.href}
          class="row"
          onmouseenter={() => (hovered = w)}
          onfocus={() => (hovered = w)}
        >
          <span class="name">
            <span class="dot" style:--colour={colours[w.id]}></span>
            <span class="cell title"><span class="num">{pad(i + 1)}</span>{w.title}</span>
          </span>
          <span class="cell cat">{w.meta?.category ?? ''}</span>
          <span class="cell year">{w.meta?.year ?? w.meta?.date ?? ''}</span>
          <span class="cell count">{pad(w.images.length)}<span class="count-label">&nbsp;beelden</span></span>
        </a>
      </li>
    {/each}
  </ol>

  {#if preview?.url}
    <a href={preview.href} class="photo" aria-label={preview.title}>
      {#key preview.id}
        <Frame src={preview.home?.[0] ?? preview.url} alt={preview.title} sizes="33vw" />
      {/key}
    </a>
  {/if}
</div>

<style>
  .index {
    min-height: 100vh;
    padding-top: calc(var(--gap) * 2 + var(--bar) + 8vh);
    padding-bottom: calc(var(--gap) * 4 + var(--bar));
    align-items: start;
  }

  .list {
    grid-column: 1 / 9;
    list-style: none;
    display: grid;
    grid-template-columns: subgrid;
    row-gap: 6px;
  }
  li { grid-column: 1 / -1; display: grid; grid-template-columns: subgrid; }

  .row {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: subgrid;
    align-items: center;
    transition: opacity var(--speed) var(--ease);
  }
  @media (hover: hover) {
    .list:hover .row { opacity: 0.4; }
    .list:hover .row:hover { opacity: 1; }
  }

  .name {
    grid-column: 1 / 5;
    display: flex;
    gap: var(--gap);
    min-width: 0;
  }
  .dot {
    flex: none;
    width: var(--bar);
    height: var(--bar);
    border-radius: 50%;
    background: var(--dot);
    transition: border-radius var(--speed) var(--ease), background var(--speed) var(--ease);
  }
  /* Grey until you point at a project, then its colour */
  .row:hover .dot, .row:focus-visible .dot { border-radius: 0; background: var(--colour, var(--fg)); }
  .title { flex: 1; min-width: 0; }
  .num { color: var(--mid); margin-right: 12px; font-variant-numeric: tabular-nums; }
  .cat { grid-column: 5 / 7; }
  .year { grid-column: 7 / 8; }
  .count { grid-column: 8 / 9; font-variant-numeric: tabular-nums; }

  .photo {
    grid-column: 9 / 13;
    aspect-ratio: 4 / 5;
    position: sticky;
    top: calc(var(--gap) * 2 + var(--bar));
  }

  @media (max-width: 768px) {
    .index { padding-top: calc(var(--gap) * 3); padding-bottom: calc(var(--gap) * 3 + var(--bar)); }
    .list { grid-column: 1 / 7; }
    .name { grid-column: 1 / 6; }
    .count { grid-column: 6 / 7; justify-content: center; }
    .cat, .year, .photo, .count-label { display: none; }
  }
</style>
