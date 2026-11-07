<script lang="ts">
  import type { WorkItem } from '../utils/workLoader';
  import { pad } from './media';
  import Frame from './Frame.svelte';

  let { works }: { works: WorkItem[] } = $props();

  // The cover of the first project (in the editor's order) sets the mood of the page
  let photo = $derived(works[0]);
  // A short list of work, so the page leads somewhere; the Index has the rest
  let recent = $derived(works.slice(0, 5));

  function onKey(e: KeyboardEvent) {
    if (e.key === 'Escape') location.hash = '#/';
  }
</script>

<svelte:window onkeydown={onKey} />

<div class="info grid">
  <header class="intro">
    <span class="cell name">Studio 't Archief</span>
    <h1 class="statement">
      Ik fotografeer events, concerten en cultuur in Leuven en Brussel.
    </h1>
  </header>

  {#if photo?.url}
    <figure class="photo">
      <a href={photo.href} class="frame" aria-label={photo.title}>
        <Frame src={photo.home?.[0] ?? photo.url} alt={photo.title} sizes="(max-width: 768px) 100vw, 33vw" />
      </a>
      <a href={photo.href} class="cell caption">{photo.title}</a>
    </figure>
  {/if}

  <!-- Label cells on the left, text on the right: the same rows as the Index -->
  <dl class="rows">
    <div class="row">
      <dt class="cell">Over</dt>
      <dd>
        Met Studio 't Archief vertaal ik momenten naar beeld, zodat ze nooit verloren gaan.
        Van de eerste soundcheck tot de laatste dans.
      </dd>
    </div>

    <div class="row">
      <dt class="cell">Diensten</dt>
      <dd>
        Eventfotografie<br />
        Concertfotografie<br />
        Cultuurfotografie
      </dd>
    </div>

    <div class="row">
      <dt class="cell">Regio</dt>
      <dd>Leuven, Brussel en daarbuiten</dd>
    </div>

    <div class="row">
      <dt class="cell">Contact</dt>
      <dd>
        <a href="mailto:info@tarchief.studio">info@tarchief.studio</a><br />
        <a href="https://instagram.com/tarchief.studio" target="_blank" rel="noopener">Instagram @tarchief.studio ↗</a>
      </dd>
    </div>

    {#if recent.length}
      <div class="row">
        <dt class="cell">Recent</dt>
        <dd>
          <ol class="work">
            {#each recent as w, i (w.id)}
              <li>
                <a href={w.href}>
                  <span class="num">{pad(i + 1)}</span>
                  <span class="title">{w.title}</span>
                  <span class="cat">{w.meta?.category ?? ''}</span>
                </a>
              </li>
            {/each}
          </ol>
          <a href="#/index" class="all">Alle projecten →</a>
        </dd>
      </div>
    {/if}
  </dl>

  <blockquote class="quote">
    “Een moment bestaat twee keer. Eerst wanneer het gebeurt, en daarna wanneer het wordt herinnerd.”
  </blockquote>

  <div class="cta">
    <a href="mailto:info@tarchief.studio?subject=Fotografie" class="book">Mail mij →</a>
    <a href="https://instagram.com/tarchief.studio" target="_blank" rel="noopener" class="book alt">Stuur een DM ↗</a>
  </div>
</div>

<style>
  .info {
    min-height: 100vh;
    padding-top: calc(var(--gap) * 2 + var(--bar) + 4vh);
    padding-bottom: calc(var(--gap) * 4);
    row-gap: calc(var(--gap) * 3);
    align-content: start;
    align-items: start;
  }

  .intro {
    grid-column: 1 / 8;
    grid-row: 1;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--gap);
  }
  .name { width: calc((100% - var(--gap) * 6) / 7 * 2 + var(--gap)); }

  .statement {
    font-family: var(--body);
    font-size: clamp(28px, 3.4vw, 52px);
    font-weight: 700;
    line-height: 1.05;
    letter-spacing: -0.025em;
    color: var(--fg);
    text-wrap: balance;
  }

  .photo {
    grid-column: 9 / 13;
    grid-row: 1 / 5;
    position: sticky;
    top: calc(var(--gap) * 2 + var(--bar));
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .frame {
    display: block;
    aspect-ratio: 4 / 5;
    transition: opacity var(--speed) var(--ease);
  }
  .frame:hover { opacity: 0.85; }

  .rows {
    grid-column: 1 / 8;
    grid-row: 2;
    display: grid;
    grid-template-columns: subgrid;
    row-gap: calc(var(--gap) * 1.5);
  }
  .row {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: subgrid;
    align-items: start;
  }
  dt { grid-column: 1 / 3; }
  dd {
    grid-column: 3 / -1;
    font-size: var(--label);
    font-weight: 700;
    line-height: 1.5;
    padding: 1px 6px 0;
    max-width: 52ch;
  }
  dd a { transition: opacity var(--speed) var(--ease); }
  dd a:hover { opacity: 0.5; }

  .work { list-style: none; }
  .work a { display: flex; gap: 12px; }
  .num, .cat { color: var(--mid); font-variant-numeric: tabular-nums; }
  .title { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .cat { margin-left: auto; padding-left: 12px; flex: none; }
  .all { display: inline-block; margin-top: 6px; color: var(--mid); }

  .quote {
    grid-column: 3 / 8;
    grid-row: 3;
    font-size: clamp(16px, 1.4vw, 20px);
    font-weight: 700;
    line-height: 1.25;
    letter-spacing: -0.01em;
    color: var(--mid);
    text-wrap: balance;
  }

  .cta {
    grid-column: 3 / 8;
    grid-row: 4;
    display: flex;
    gap: var(--gap);
  }
  .book {
    flex: 1;
    display: flex;
    align-items: center;
    min-height: calc(var(--bar) * 2);
    padding: 0 10px;
    background: var(--fg);
    color: var(--bg);
    font-size: var(--label);
    font-weight: 700;
    transition: opacity var(--speed) var(--ease);
  }
  .book.alt { background: var(--cell); color: var(--fg); }
  .book:hover { opacity: 0.8; }

  @media (max-width: 768px) {
    .info { padding-top: calc(var(--gap) * 3); row-gap: calc(var(--gap) * 3); }
    .intro, .rows, .quote, .cta, .photo { grid-column: 1 / 7; grid-row: auto; }
    .name { width: calc((100% - 6px * 5) / 6 * 2 + 6px); }
    .photo { position: static; order: 1; }
    .frame { aspect-ratio: 4 / 3; }
    dt { grid-column: 1 / 3; }
    dd { grid-column: 3 / 7; }
    .cta { flex-direction: column; gap: 6px; }
  }
</style>
