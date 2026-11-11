<script lang="ts">
  import type { WorkItem } from '../utils/workLoader';
  import { pad } from './media';
  import Frame from './Frame.svelte';
  import { navigate } from './router.svelte';
  import { EMAIL, INSTAGRAM, INSTAGRAM_HANDLE, STUDIO, type Lang } from '../site';

  let { works, lang = 'nl' }: { works: WorkItem[]; lang?: Lang } = $props();

  // This page's own words, in both languages
  const TEXT = {
    nl: {
      statement: 'Ik fotografeer events, concerten en cultuur in Leuven en Brussel.',
      about: `Met ${STUDIO} vertaal ik momenten naar beeld, zodat ze nooit verloren gaan. Van de eerste soundcheck tot de laatste dans.`,
      labels: { about: 'Over', services: 'Diensten', region: 'Regio', contact: 'Contact', recent: 'Recent' },
      services: ['Eventfotografie', 'Concertfotografie', 'Cultuurfotografie'],
      region: 'Leuven, Brussel en daarbuiten',
      all: 'Alle projecten',
      quote: 'Een moment bestaat twee keer. Eerst wanneer het gebeurt, en daarna wanneer het wordt herinnerd.',
      mail: 'Mail mij', subject: 'Fotografie', dm: 'Stuur een DM'
    },
    en: {
      statement: 'I photograph events, concerts and culture in Leuven and Brussels.',
      about: `With ${STUDIO} I turn moments into pictures, so they are never lost. From the first soundcheck to the last dance.`,
      labels: { about: 'About', services: 'Services', region: 'Region', contact: 'Contact', recent: 'Recent' },
      services: ['Event photography', 'Concert photography', 'Culture photography'],
      region: 'Leuven, Brussels and beyond',
      all: 'All projects',
      quote: 'A moment exists twice. First when it happens, and then when it is remembered.',
      mail: 'Email me', subject: 'Photography', dm: 'Send a DM'
    }
  };
  let t = $derived(TEXT[lang]);

  // The photo follows the hovered project, like on the Index; the first one until then
  let hovered: WorkItem | undefined = $state();
  let photo = $derived(hovered ?? works[0]);
  // A short list of work, so the page leads somewhere; the Index has the rest
  let recent = $derived(works.slice(0, 5));

  function onKey(e: KeyboardEvent) {
    if (e.key === 'Escape') navigate('/');
  }
</script>

<svelte:window onkeydown={onKey} />

<div class="info grid">
  <header class="intro">
    <div class="tags">
      <span class="cell name">{STUDIO}</span>
      <a href={lang === 'en' ? '/info' : '/en'} class="cell" hreflang={lang === 'en' ? 'nl' : 'en'}>{lang === 'en' ? 'NL' : 'EN'}</a>
    </div>
    <h1 class="statement">{t.statement}</h1>
  </header>

  {#if photo?.url}
    <figure class="photo">
      <a href={photo.href} class="frame" aria-label={photo.title}>
        {#key photo.id}
          <Frame src={photo.home?.[0] ?? photo.url} alt={photo.title} sizes="(max-width: 768px) 100vw, 33vw" />
        {/key}
      </a>
      <a href={photo.href} class="cell caption">{photo.title}</a>
    </figure>
  {/if}

  <!-- Label cells on the left, text on the right: the same rows as the Index -->
  <dl class="rows">
    <div class="row">
      <dt class="cell">{t.labels.about}</dt>
      <dd>{t.about}</dd>
    </div>

    <div class="row">
      <dt class="cell">{t.labels.services}</dt>
      <dd>{#each t.services as service, i}{#if i}<br />{/if}{service}{/each}</dd>
    </div>

    <div class="row">
      <dt class="cell">{t.labels.region}</dt>
      <dd>{t.region}</dd>
    </div>

    <div class="row">
      <dt class="cell">{t.labels.contact}</dt>
      <dd>
        <a href="mailto:{EMAIL}">{EMAIL}</a><br />
        <a href={INSTAGRAM} target="_blank" rel="noopener">Instagram {INSTAGRAM_HANDLE} ↗&#xFE0E;</a>
      </dd>
    </div>

    {#if recent.length}
      <div class="row">
        <dt class="cell">{t.labels.recent}</dt>
        <dd>
          <ol class="work">
            {#each recent as w, i (w.id)}
              <li>
                <a href={w.href} onmouseenter={() => (hovered = w)} onfocus={() => (hovered = w)}>
                  <span class="num">{pad(i + 1)}</span>
                  <span class="title">{w.title}</span>
                  <span class="cat">{w.meta?.category ?? ''}</span>
                </a>
              </li>
            {/each}
          </ol>
          <a href="/projecten" class="all">{t.all} →</a>
        </dd>
      </div>
    {/if}
  </dl>

  <blockquote class="quote">
    “{t.quote}”
  </blockquote>

  <div class="cta" id="boek">
    <a href="mailto:{EMAIL}?subject={t.subject}" class="book">{t.mail} →</a>
    <a href={INSTAGRAM} target="_blank" rel="noopener" class="book alt">{t.dm} ↗&#xFE0E;</a>
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
  .tags { display: flex; gap: 6px; width: 100%; }
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
  .work a { transition: opacity var(--speed) var(--ease); }
  @media (hover: hover) {
    .work:hover a { opacity: 0.4; }
    .work:hover a:hover { opacity: 1; }
  }
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
    scroll-margin-top: calc(var(--gap) * 3 + var(--bar));
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
    /* Text under its label, so it gets the full width */
    dt { grid-column: 1 / 3; }
    dd { grid-column: 1 / 7; margin-top: 6px; max-width: none; }
    .cta { flex-direction: column; gap: 6px; }
  }
</style>
