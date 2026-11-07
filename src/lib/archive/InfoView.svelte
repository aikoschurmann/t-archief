<script lang="ts">
  import type { WorkItem } from '../utils/workLoader';
  import Frame from './Frame.svelte';

  let { works }: { works: WorkItem[] } = $props();

  // The cover of the first project (in the editor's order) sets the mood of the page
  let photo = $derived(works[0]);

  function onKey(e: KeyboardEvent) {
    if (e.key === 'Escape') location.hash = '#/';
  }
</script>

<svelte:window onkeydown={onKey} />

<div class="info grid">
  <h1 class="statement">
    Ik fotografeer events, concerten en cultuur in Leuven en Brussel.
  </h1>

  {#if photo?.url}
    <a href={photo.href} class="photo" aria-label={photo.title}>
      <Frame src={photo.url} alt={photo.title} sizes="(max-width: 768px) 100vw, 33vw" />
    </a>
  {/if}

  <div class="columns">
    <div class="block">
      <span class="cell">Over</span>
      <p>
        Ik ben fotograaf in Leuven en Brussel. Met 't Archief vertaal ik momenten naar beeld,
        zodat ze nooit verloren gaan.
      </p>
    </div>

    <div class="block">
      <span class="cell">Diensten</span>
      <p>
        Eventfotografie<br />
        Concertfotografie<br />
        Cultuurfotografie
      </p>
    </div>

    <div class="block">
      <span class="cell">Contact</span>
      <p>
        <a href="mailto:info@tarchief.studio">info@tarchief.studio</a><br />
        <a href="https://instagram.com/tarchief.studio" target="_blank" rel="noopener">@tarchief.studio — stuur me een DM</a><br />
        Leuven / Brussel
      </p>
    </div>
  </div>

  <blockquote class="quote">
    "Een moment bestaat twee keer. Eerst wanneer het gebeurt, en daarna wanneer het wordt herinnerd."
  </blockquote>

  <a href="mailto:info@tarchief.studio?subject=Contact" class="book">Contacteer mij →</a>
</div>

<style>
  .info {
    min-height: 100vh;
    padding-top: calc(var(--gap) * 2 + var(--bar) + 8vh);
    padding-bottom: calc(var(--gap) * 4 + var(--bar));
    row-gap: calc(var(--gap) * 4);
    align-content: start;
    align-items: start;
  }

  .statement {
    grid-column: 1 / 8;
    grid-row: 1;
    font-family: var(--body);
    font-size: clamp(28px, 3.4vw, 52px);
    font-weight: 700;
    line-height: 1.05;
    letter-spacing: -0.025em;
    color: var(--fg);
  }

  .photo {
    grid-column: 9 / 13;
    grid-row: 1 / 5;
    aspect-ratio: 4 / 5;
    position: sticky;
    top: calc(var(--gap) * 2 + var(--bar));
    transition: opacity var(--speed) var(--ease);
  }
  .photo:hover { opacity: 0.85; }

  .columns {
    grid-column: 1 / 8;
    grid-row: 2;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: var(--gap);
  }

  .block { display: flex; flex-direction: column; gap: var(--gap); }

  .block p {
    font-size: var(--label);
    font-weight: 700;
    line-height: 1.35;
    padding: 0 6px;
  }
  .block a { transition: opacity var(--speed) var(--ease); }
  .block a:hover { opacity: 0.5; }

  .quote {
    grid-column: 1 / 6;
    grid-row: 3;
    font-size: clamp(16px, 1.4vw, 20px);
    font-weight: 700;
    line-height: 1.25;
    letter-spacing: -0.01em;
    color: var(--mid);
  }

  .book {
    grid-column: 1 / 3;
    grid-row: 4;
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
  .book:hover { opacity: 0.8; }

  @media (max-width: 768px) {
    .info { padding-top: calc(var(--gap) * 3); row-gap: calc(var(--gap) * 3); }
    .statement, .columns, .quote, .book, .photo { grid-column: 1 / 7; grid-row: auto; }
    .photo { position: static; order: 1; aspect-ratio: 4 / 3; }
    .columns { grid-template-columns: 1fr; }
    .book { grid-column: 1 / 5; }
  }
</style>
