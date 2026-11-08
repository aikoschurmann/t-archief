<script lang="ts">
  let { back = false, page = '' }: { back?: boolean; page?: string } = $props();

  // Phones: everything lives behind one "Menu" button. Opening follows the reference site's
  // sequence: the name cell widens, the links grow upward one by one, then the info panels
  // expand and their text fades in.
  let open = $state(false);
  // With the menu closed, the button says which section you're in (Info has its own cell)
  let section = $derived(page === 'index' ? 'Index' : '');

  function close() {
    open = false;
  }

  function toggleMenu() {
    open = !open;
  }
</script>

<svelte:window onhashchange={close} onkeydown={e => e.key === 'Escape' && close()} />

<!-- Desktop: the studio name signs every page, bottom left, and leads to the info page
     (which has the name at the top already) -->
{#if page !== 'info'}
  <footer class="bar desktop grid">
    <a href="#/info" class="cell brand">Studio 't Archief</a>
  </footer>
{/if}

<!-- Phones: everything else lives in the menu; on desktop the top bar does the navigation -->
<button class="overlay" class:open onclick={close} aria-label="Sluit menu" tabindex="-1"></button>

<footer class="bar mobile grid" class:open>
  <div class="left">

    <div class="grow panel-wrap" inert={!open}>
      <div class="panel">
        <span class="head">Contact</span>
        <!-- ↗ plus U+FE0E: without it iPhones draw the arrow as an emoji -->
        <a href="mailto:info@tarchief.studio" class="line">info@tarchief.studio →</a>
        <a href="https://instagram.com/tarchief.studio" target="_blank" rel="noopener" class="line">Instagram @tarchief.studio ↗&#xFE0E;</a>
        <span class="line muted">Leuven / Brussel</span>
      </div>
    </div>
    <div class="grow panel-wrap" inert={!open}>
      <div class="panel">
        <span class="head">Diensten</span>
        <span>Eventfotografie</span>
        <span>Concertfotografie</span>
        <span>Cultuurfotografie</span>
      </div>
    </div>

    <!-- Closed: Home · Info · Menu (contact is in the menu). On project pages "Home" is "Terug". -->
    <div class="bottom-row">
      <div class="name" class:current={page === 'home' && !open}>
        <a href="#/" class="name-link" onclick={close}>{back && !open ? '← Terug' : open ? "Studio 't Archief" : 'Home'}</a>
        <div class="grow bio-wrap" inert={!open}>
          <div>
            <p class="bio">
              Event-, concert- &amp; cultuurfotografie · Leuven/Brussel. Stuur me een DM!
            </p>
          </div>
        </div>
      </div>
      <a href="#/info" class="cell info-mobile" class:current={page === 'info'} aria-current={page === 'info' ? 'page' : undefined}>Info</a>
    </div>
  </div>

  <div class="right">
    <div class="grow link" inert={!open}><div><a href="#/index" class="cell" class:current={page === 'index'} aria-current={page === 'index' ? 'page' : undefined} onclick={close}>Index</a></div></div>
    <div class="grow link" inert={!open}><div><a href="#/info" class="cell" class:current={page === 'info'} aria-current={page === 'info' ? 'page' : undefined} onclick={close}>Info</a></div></div>
    <div class="grow link" inert={!open}><div><a href="mailto:info@tarchief.studio" class="cell cta">Mail mij →</a></div></div>
    <button class="cell toggle" onclick={toggleMenu} aria-expanded={open}>
      {#if open}Sluit{:else}Menu{#if section}<span class="section">&nbsp;· {section}</span>{/if}{/if}
    </button>
  </div>
</footer>

<style>
  .bar {
    position: fixed;
    bottom: var(--gap);
    left: 0;
    right: 0;
    z-index: 50;
  }
  .brand { grid-column: 1 / 3; }
  .mobile, .overlay { display: none; }

  @media (max-width: 768px) {
    .desktop { display: none; }

    /* The page fades back while the menu is open */
    .overlay {
      display: block;
      position: fixed;
      inset: 0;
      z-index: 70;
      background: rgba(255, 255, 255, 0.92);
      opacity: 0;
      pointer-events: none;
      transition: opacity 300ms var(--ease);
    }
    .overlay.open { opacity: 1; pointer-events: auto; }

    .mobile {
      display: grid;
      bottom: var(--gap);
      z-index: 80;
      align-items: end;
      pointer-events: none;
    }
    .mobile > * { pointer-events: auto; }
    /* A white strip behind the bar, so the page doesn't show between and under the cells */
    .mobile::before {
      content: '';
      position: fixed;
      left: 0;
      right: 0;
      bottom: 0;
      height: calc(var(--bar) + var(--gap) * 2);
      background: var(--bg);
      z-index: -1;
    }

    .left, .right {
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      min-width: 0;
    }
    .left { grid-column: 1 / 5; align-items: flex-end; }
    .right { grid-column: 5 / 7; }

    /* Height 0 → auto via grid rows; closing is quick and without delays */
    .grow {
      display: grid;
      grid-template-rows: 0fr;
      width: 100%;
      transition: grid-template-rows 200ms var(--ease), margin 200ms var(--ease);
    }
    .grow > * { overflow: hidden; min-height: 0; }
    .open .grow { grid-template-rows: 1fr; }

    /* 1. The name cell widens from columns 1–2 to the whole left half */
    .bottom-row { display: flex; gap: 6px; width: 100%; align-items: flex-end; }
    .info-mobile { flex: none; width: calc(50% - 3px); }
    .open .info-mobile { display: none; }

    .name {
      width: calc(50% - 3px);
      background: var(--cell);
      font-size: var(--label);
      font-weight: 700;
      transition: width 250ms var(--ease);
    }
    .open .name { width: 100%; transition-delay: 150ms; }
    .name.current { background: var(--fg); color: var(--bg); }
    .name-link { display: flex; align-items: center; min-height: var(--bar); padding: 0 6px; }

    /* 2. Links grow upward one by one */
    .link { margin-bottom: 0; }
    .open .link { margin-bottom: 6px; transition-duration: 250ms; transition-timing-function: cubic-bezier(0.33, 1, 0.68, 1); }
    .open .link:nth-child(1) { transition-delay: 350ms; }
    .open .link:nth-child(2) { transition-delay: 480ms; }
    .open .link:nth-child(3) { transition-delay: 610ms; }
    .cta { background: var(--fg); color: var(--bg); }
    .toggle { cursor: pointer; }
    .section { color: var(--mid); }

    /* 3. Info panels and the bio expand, 4. then their text fades in */
    .panel-wrap { margin-bottom: 0; }
    .open .panel-wrap, .open .bio-wrap { transition-duration: 400ms; transition-delay: 520ms; }
    .open .panel-wrap { margin-bottom: 6px; }
    .panel {
      background: var(--cell-solid);
      padding: 6px;
      display: flex;
      flex-direction: column;
      font-size: var(--label);
      font-weight: 700;
      line-height: 1.3;
    }
    .head { margin-bottom: 1em; }
    .line { padding: 3px 0; }
    .muted { color: var(--mid); }
    .bio { padding: 0 6px 6px; line-height: 1.3; }
    .panel, .bio { opacity: 0; transition: opacity 150ms var(--ease); }
    .open .panel, .open .bio { opacity: 1; transition: opacity 350ms var(--ease) 660ms; }
  }
</style>
