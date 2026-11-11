<script lang="ts">
  import type { WorkItem } from '../utils/workLoader';
  import { assetsFor, projectColours, temperature, toHex } from './media';
  import { COPY, FREE_WORK } from '../site';

  let { works }: { works: WorkItem[] } = $props();

  const MAX_HOME = 3;

  type Draft = {
    folder: string;
    title: string;
    cover: string;
    images: { url: string; file: string }[];
    home: string[]; // file names
    hidden: string[]; // file names
    visible: boolean;
    colour: string; // '' = automatic
    free: boolean; // listed under "Vrij werk" and kept off the home page
  };

  // The editor works on a copy taken once; saving writes meta.json and Vite reloads the page
  let drafts: Draft[] = $state(
    works.map(w => ({
      folder: w.folder,
      title: w.title,
      cover: w.url,
      images: w.allImages.map(url => ({ url, file: w.files[url] })),
      home: (w.home ?? []).map(url => w.files[url]),
      hidden: w.hidden.map(url => w.files[url]),
      visible: w.visible,
      colour: typeof w.meta?.colour === 'string' ? w.meta.colour : '',
      free: w.meta?.section === FREE_WORK
    }))
  );

  // The selected project lives in the URL (#folder), so it survives the reload after saving
  const fromHash = decodeURIComponent(location.hash.slice(1));
  let selectedFolder = $state(drafts.some(d => d.folder === fromHash) ? fromHash : (works[0]?.folder ?? ''));
  let autoColours: Record<string, string> = $state({});
  let status: 'idle' | 'saving' | 'saved' | 'error' = $state('idle');
  let error = $state('');

  let selected = $derived(drafts.find(d => d.folder === selectedFolder));

  function select(folder: string) {
    selectedFolder = folder;
    history.replaceState(null, '', `#${encodeURIComponent(folder)}`);
  }

  // Unsaved = different from what was last loaded or saved, so undoing back to it counts as clean
  let savedJson = $state(JSON.stringify(drafts));
  let dirty = $derived(JSON.stringify(drafts) !== savedJson);

  // Undo: every edit goes through change(), which keeps a copy of the drafts from before it
  let undoStack: string[] = $state([]);
  let lastKey = '';

  function change(fn: () => void, key = '') {
    // Repeated edits with the same key (dragging the colour picker) undo as one step
    if (!key || key !== lastKey) {
      undoStack.push(JSON.stringify(drafts));
      if (undoStack.length > 100) undoStack.shift();
    }
    lastKey = key;
    fn();
    if (status !== 'saving') status = 'idle';
  }

  function undo() {
    const prev = undoStack.pop();
    if (!prev) return;
    drafts = JSON.parse(prev);
    lastKey = '';
    status = 'idle';
  }

  // Saving writes meta.json and Vite reloads the page (sometimes mounting this twice);
  // a recent timestamp lets the fresh page confirm the save
  try {
    if (Date.now() - Number(sessionStorage.getItem('archive-saved')) < 5000) status = 'saved';
  } catch {}

  $effect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    const keys = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return;
      if (e.key === 's') {
        e.preventDefault();
        save();
      } else if (e.key === 'z' && !e.shiftKey && !(e.target instanceof HTMLInputElement)) {
        e.preventDefault();
        undo();
      }
    };
    addEventListener('beforeunload', warn);
    addEventListener('keydown', keys);
    return () => {
      removeEventListener('beforeunload', warn);
      removeEventListener('keydown', keys);
    };
  });

  function leave(e: MouseEvent) {
    if (dirty && !confirm('Je wijzigingen zijn nog niet opgeslagen. Toch verlaten?')) e.preventDefault();
  }

  // Automatic colours ignore manual picks, so "Auto" always shows what the site would choose
  $effect(() => {
    const ids = Object.fromEntries(works.map(w => [w.id, w.folder]));
    const auto = works.map(w => ({ ...w, meta: { ...w.meta, colour: undefined } }));
    // Same set as the site (visible projects) so the grey ladder matches; hidden ones get theirs separately
    const onSite = auto.filter(w => w.visible && w.images.length);
    const offSite = auto.filter(w => !onSite.includes(w) && w.allImages.length);
    Promise.all([projectColours(onSite), projectColours(offSite.map(w => ({ ...w, images: w.allImages })))]).then(
      ([site, rest]) => {
        for (const id in rest) autoColours[ids[id]] = rest[id];
        for (const id in site) autoColours[ids[id]] = site[id];
      }
    );
  });

  function colourOf(d: Draft) {
    return d.colour || autoColours[d.folder] || '';
  }

  function setColour(d: Draft, value: string) {
    change(() => (d.colour = value), value ? `colour:${d.folder}` : '');
  }

  // Native drag & drop, shared by the three sortable lists
  let dragging: { list: string; index: number } | null = $state(null);
  let over: { list: string; index: number } | null = $state(null);

  function move<T>(arr: T[], from: number, to: number) {
    const [item] = arr.splice(from, 1);
    arr.splice(to, 0, item);
  }

  function dragProps(list: string, index: number, arr: unknown[]) {
    return {
      draggable: true,
      ondragstart: (e: DragEvent) => {
        dragging = { list, index };
        e.dataTransfer?.setData('text/plain', String(index));
      },
      ondragover: (e: DragEvent) => {
        if (dragging?.list !== list) return;
        e.preventDefault();
        over = { list, index };
      },
      ondrop: (e: DragEvent) => {
        e.preventDefault();
        if (dragging?.list === list && dragging.index !== index) {
          const from = dragging.index;
          change(() => move(arr, from, index));
        }
        dragging = over = null;
      },
      ondragend: () => (dragging = over = null)
    };
  }

  // Keyboard alternative to dragging: Alt + arrow moves the focused item
  function nudge(e: KeyboardEvent, arr: unknown[], index: number, back: string, forward: string) {
    if (!e.altKey || (e.key !== back && e.key !== forward)) return false;
    e.preventDefault();
    const to = index + (e.key === back ? -1 : 1);
    if (to >= 0 && to < arr.length) change(() => move(arr, index, to));
    return true;
  }

  function projectKeys(e: KeyboardEvent, i: number) {
    if (nudge(e, drafts, i, 'ArrowUp', 'ArrowDown')) return;
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
    e.preventDefault();
    const next = drafts[i + (e.key === 'ArrowUp' ? -1 : 1)];
    if (next) {
      select(next.folder);
      document.querySelector<HTMLElement>(`[data-project="${next.folder}"]`)?.focus();
    }
  }

  function isOver(list: string, index: number) {
    return over?.list === list && over.index === index && dragging?.index !== index;
  }

  function toggleHome(d: Draft, file: string) {
    change(() => {
      const i = d.home.indexOf(file);
      if (i >= 0) d.home.splice(i, 1);
      else if (d.home.length < MAX_HOME) d.home.push(file);
    });
  }

  function toggleHidden(d: Draft, file: string) {
    change(() => {
      const i = d.hidden.indexOf(file);
      if (i >= 0) d.hidden.splice(i, 1);
      else {
        d.hidden.push(file);
        // A hidden image can't be on the home page
        const h = d.home.indexOf(file);
        if (h >= 0) d.home.splice(h, 1);
      }
    });
  }

  function setFree(d: Draft, free: boolean) {
    if (d.free !== free) change(() => (d.free = free));
  }

  function toggleProject(d: Draft) {
    change(() => (d.visible = !d.visible));
  }

  function sortByColour() {
    change(() => drafts.sort((a, b) => temperature(colourOf(a)) - temperature(colourOf(b))));
  }

  async function save() {
    if (status === 'saving') return;
    status = 'saving';
    const json = JSON.stringify(drafts);
    // Set before the request: Vite may reload the page before the response arrives
    try {
      sessionStorage.setItem('archive-saved', String(Date.now()));
    } catch {}
    try {
      const res = await fetch('/__archive/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projects: drafts.map((d, i) => ({
            folder: d.folder,
            order: i + 1,
            image_order: d.images.map(img => img.file),
            home: d.home,
            hidden: d.hidden,
            visible: d.visible,
            colour: d.colour,
            free: d.free
          }))
        })
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      savedJson = json;
      status = 'saved';
    } catch (e) {
      try {
        sessionStorage.removeItem('archive-saved');
      } catch {}
      error = String(e);
      status = 'error';
    }
  }

  function thumb(url: string) {
    return assetsFor(url).smSrc;
  }

  let shown = $derived(selected ? selected.images.length - selected.hidden.length : 0);

  let homeUrl = $derived((file: string) => selected?.images.find(i => i.file === file)?.url ?? '');
</script>

<div class="edit grid">
  <header class="bar">
    <a href="/" class="cell back" onclick={leave}>← Site</a>
    <span class="cell heading">
      Volgorde bewerken
      {#if dirty}<span class="unsaved">· niet opgeslagen</span>{/if}
    </span>
    <button class="cell undo" onclick={undo} disabled={!undoStack.length} title="⌘Z">Ongedaan maken</button>
    <button class="cell sort" onclick={sortByColour}>Sorteer op kleur</button>
    <button class="cell save" class:dirty onclick={save} disabled={status === 'saving'} title="⌘S">
      {status === 'saving' ? 'Opslaan…' : status === 'error' ? 'Fout — opnieuw' : dirty ? 'Opslaan' : status === 'saved' ? 'Opgeslagen ✓' : 'Alles opgeslagen'}
    </button>
  </header>

  {#if status === 'error'}
    <p class="cell error">{error}</p>
  {/if}

  <!-- Project order -->
  <div class="projects">
    <span class="cell label" title="Of: pijltjes om te kiezen, ⌥ + pijltjes om te verplaatsen">Projecten — sleep om te ordenen</span>
    <ol>
      {#each drafts as d, i (d.folder)}
        <li
          class="project"
          class:on={d.folder === selectedFolder}
          class:off={!d.visible}
          class:over={isOver('projects', i)}
          class:lifted={dragging?.list === 'projects' && dragging.index === i}
          {...dragProps('projects', i, drafts)}
        >
          <button data-project={d.folder} onclick={() => select(d.folder)} onkeydown={e => projectKeys(e, i)}>
            <span class="dot" style:background={colourOf(d) || 'var(--cell)'}></span>
            <span class="cell num">{String(i + 1).padStart(2, '0')}</span>
            <span class="cell name">{d.title}</span>
            {#if d.free}<span class="cell free-tag">vrij</span>{/if}
            {#if d.hidden.length || !d.free}
              <span class="cell count">
                {d.hidden.length === d.images.length ? 'alle beelden verborgen' : d.hidden.length ? `${d.hidden.length} verborgen` : d.home.length ? `home ${d.home.length}` : 'home auto'}
              </span>
            {/if}
          </button>
          <button
            class="cell toggle"
            class:off={!d.visible}
            onclick={() => toggleProject(d)}
            title={d.visible ? 'Klik om het project van de site te halen' : 'Klik om het project weer te tonen'}
          >
            {d.visible ? 'verberg' : 'verborgen'}
          </button>
        </li>
      {/each}
    </ol>
  </div>

  {#if selected}
    <div class="images">
      <div class="title-row">
        <span class="cell title">{selected.title}</span>
        <span class="cell summary">
          {!selected.visible ? 'project verborgen' : `${shown} van ${selected.images.length} beelden op de site`}
        </span>
        {#if selected.visible && shown}
          <a class="cell" href="/work/{selected.folder}" target="_blank">Bekijk ↗</a>
        {/if}
      </div>

      <!-- Section -->
      <div class="colour-row choice">
        <span class="cell label">Plaats op de site</span>
        <button class="cell" class:active={!selected.free} onclick={() => selected && setFree(selected, false)}>Opdrachten</button>
        <button class="cell" class:active={selected.free} onclick={() => selected && setFree(selected, true)}>{COPY.nl.labels.free}</button>
      </div>

      <!-- Dot colour -->
      <div class="colour-row">
        <span class="cell label">Kleur van de stip</span>
        <label class="swatch-input" style:background={colourOf(selected) || 'var(--cell)'}>
          <input
            type="color"
            value={toHex(colourOf(selected) || '#808080')}
            oninput={e => selected && setColour(selected, e.currentTarget.value)}
            aria-label="Kies een kleur"
          />
        </label>
        <button class="cell" class:active={!selected.colour} onclick={() => selected && setColour(selected, '')}>
          {selected.colour ? 'Terug naar automatisch' : 'Automatisch'}
        </button>
      </div>

      <!-- Home picks -->
      <span class="cell label">Op home — klik ☆ op een beeld (max {MAX_HOME}), sleep om te ordenen</span>
      {#if selected.free}
        <div class="home-strip">
          <p class="hint">{COPY.nl.labels.free} staat niet op home. Je keuzes blijven bewaard voor als je het terugzet.</p>
        </div>
      {:else}
      <div class="home-strip">
        {#each selected.home as file, i (file)}
          <figure
            class="home-pick"
            class:over={isOver('home', i)}
            {...dragProps('home', i, selected.home)}
          >
            <img src={thumb(homeUrl(file))} alt="" draggable="false" />
            <button class="remove" onclick={() => selected && toggleHome(selected, file)} aria-label="Verwijder van home">×</button>
            <span class="badge">{i + 1}</span>
          </figure>
        {:else}
          <p class="hint">Niets gekozen: home toont automatisch de cover en de beelden erna.</p>
        {/each}
      </div>
      {/if}

      <!-- Image order -->
      <span class="cell label" title="Of: ⌥ + pijltjes om een geselecteerd beeld te verplaatsen">Beelden in dit project — sleep om te ordenen</span>
      <div class="image-grid">
        {#each selected.images as img, i (img.file)}
          <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
          <figure
            class="image"
            class:hidden={selected.hidden.includes(img.file)}
            class:over={isOver('images', i)}
            class:lifted={dragging?.list === 'images' && dragging.index === i}
            tabindex="0"
            onkeydown={e => selected && nudge(e, selected.images, i, 'ArrowLeft', 'ArrowRight')}
            {...dragProps('images', i, selected.images)}
          >
            <img src={thumb(img.url)} alt={img.file} draggable="false" />
            <span class="badge">{String(i + 1).padStart(2, '0')}</span>
            <button
              class="eye"
              class:off={selected.hidden.includes(img.file)}
              onclick={() => selected && toggleHidden(selected, img.file)}
              aria-label={selected.hidden.includes(img.file) ? 'Toon dit beeld' : 'Verberg dit beeld'}
              title={selected.hidden.includes(img.file) ? 'Verborgen — klik om te tonen' : 'Zichtbaar — klik om te verbergen'}
            >
              {selected.hidden.includes(img.file) ? 'verborgen' : 'verberg'}
            </button>
            <button
              class="star"
              class:picked={selected.home.includes(img.file)}
              disabled={selected.free || selected.hidden.includes(img.file) || (!selected.home.includes(img.file) && selected.home.length >= MAX_HOME)}
              onclick={() => selected && toggleHome(selected, img.file)}
              aria-label="Toon op home"
            >
              {selected.home.includes(img.file) ? `★ ${selected.home.indexOf(img.file) + 1}` : '☆'}
            </button>
            <figcaption>{img.file}</figcaption>
          </figure>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .edit {
    min-height: 100vh;
    padding-top: var(--gap);
    padding-bottom: 80px;
    row-gap: calc(var(--gap) * 3);
    align-items: start;
    align-content: start;
  }

  .bar {
    grid-column: 1 / 13;
    display: grid;
    grid-template-columns: subgrid;
    position: sticky;
    top: var(--gap);
    z-index: 10;
  }
  .back { grid-column: 1 / 3; }
  .heading { grid-column: 3 / 7; gap: 0.4em; }
  .unsaved { color: var(--mid); }
  .undo { grid-column: 7 / 9; }
  .sort { grid-column: 9 / 11; }
  .save { grid-column: 11 / 13; }
  .bar button { cursor: pointer; }
  .bar button:disabled { color: var(--mid); cursor: default; }
  .save.dirty { background: var(--fg); color: var(--bg); }

  .error { grid-column: 1 / 13; white-space: normal; color: #b00020; }

  .label { color: var(--mid); margin-bottom: var(--gap); }

  .projects {
    grid-column: 1 / 5;
    position: sticky;
    top: calc(var(--gap) * 2 + var(--bar));
    display: flex;
    flex-direction: column;
  }

  ol { list-style: none; display: flex; flex-direction: column; gap: 6px; }

  .project { display: flex; gap: 6px; }
  .project > button:first-child {
    flex: 1;
    min-width: 0;
    display: flex;
    gap: 6px;
    align-items: center;
    padding: 0;
    cursor: grab;
  }
  .project .dot { flex: none; width: var(--bar); height: var(--bar); border-radius: 50%; }
  .project.on .dot { border-radius: 0; }
  .project .num { flex: none; width: 2.2rem; justify-content: center; }
  .project .name { flex: 1; min-width: 0; }
  .project .count { flex: none; color: var(--mid); }
  .project.on .name { background: var(--fg); color: var(--bg); }
  /* Fixed width so the names line up whether a project is shown or hidden */
  .toggle { flex: none; width: 4.6rem; justify-content: center; cursor: pointer; }
  .toggle.off { background: var(--fg); color: var(--bg); }
  .project.off > button:first-child { opacity: 0.35; }
  .project.off .name { text-decoration: line-through; }

  .images {
    grid-column: 5 / 13;
    display: flex;
    flex-direction: column;
  }

  .title-row {
    display: flex;
    gap: 6px;
    margin-bottom: calc(var(--gap) * 2);
  }
  .title-row .title { background: var(--fg); color: var(--bg); min-width: 0; }
  .title-row .summary { color: var(--mid); }

  .colour-row {
    display: flex;
    gap: var(--gap);
    align-items: flex-start;
    margin-bottom: calc(var(--gap) * 2);
  }
  .colour-row .label { margin: 0; }
  .colour-row button { cursor: pointer; }
  .colour-row button.active { color: var(--mid); cursor: default; }
  .colour-row.choice { gap: 6px; }
  .colour-row.choice .label { margin-right: calc(var(--gap) - 6px); }
  .colour-row.choice button.active { background: var(--fg); color: var(--bg); }
  .free-tag { flex: none; color: var(--mid); }
  .swatch-input {
    position: relative;
    width: var(--bar);
    height: var(--bar);
    border-radius: 50%;
    cursor: pointer;
    flex: none;
  }
  .swatch-input input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }

  .home-strip {
    display: flex;
    gap: var(--gap);
    min-height: 120px;
    margin-bottom: calc(var(--gap) * 3);
  }
  .home-pick { position: relative; height: 120px; cursor: grab; }
  .home-pick img { height: 100%; width: auto; display: block; }
  .hint { font-size: var(--label); font-weight: 700; color: var(--mid); align-self: center; }

  .image-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: var(--gap);
  }

  .image { position: relative; cursor: grab; }
  .image img {
    width: 100%;
    aspect-ratio: 4 / 3;
    object-fit: contain;
    background: var(--cell);
    display: block;
  }
  figcaption {
    font-size: 10px;
    font-weight: 700;
    color: var(--mid);
    margin-top: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .badge, .star, .remove, .eye {
    position: absolute;
    top: 6px;
    min-width: var(--bar);
    height: var(--bar);
    padding: 0 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--label);
    font-weight: 700;
    background: var(--bg);
  }
  .badge { left: 6px; }
  .star, .remove { right: 6px; cursor: pointer; }
  .star.picked { background: var(--fg); color: var(--bg); }
  .eye { left: auto; right: 6px; top: auto; bottom: 26px; cursor: pointer; }
  .eye.off { background: var(--fg); color: var(--bg); }
  .image.hidden img { opacity: 0.25; }
  .image.hidden figcaption { text-decoration: line-through; }
  .star:disabled { opacity: 0.3; cursor: default; }

  .image:focus-visible, .project button:focus-visible { outline: 2px solid var(--fg); outline-offset: 2px; }

  /* With a mouse, the controls you haven't used yet only show on hover, so the grid stays calm */
  @media (hover: hover) {
    .image .star:not(.picked), .image .eye:not(.off), .project .toggle:not(.off) {
      opacity: 0;
      transition: opacity var(--speed) var(--ease);
    }
    .image:hover .star:not(:disabled), .image:focus-within .star:not(:disabled),
    .image:hover .eye, .image:focus-within .eye,
    .project:hover .toggle, .project:focus-within .toggle {
      opacity: 1;
    }
    .image:hover .star:disabled { opacity: 0.3; }
  }

  .lifted { opacity: 0.35; }
  .over { outline: 2px solid var(--fg); outline-offset: 2px; }

  @media (max-width: 768px) {
    .projects, .images { grid-column: 1 / 7; position: static; }
    .bar { display: flex; flex-wrap: wrap; gap: 6px; }
    .bar > * { grid-column: auto; }
  }
</style>
