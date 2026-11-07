<script lang="ts">
  let { back = false, page = '' }: { back?: boolean; page?: string } = $props();

  // Phones: everything lives behind one "Menu" button. Opening follows the reference site's
  // sequence: the name cell widens, the links grow upward one by one, then the info panels
  // expand and their text fades in.
  let open = $state(false);

  function close() {
    open = false;
  }

  function toggleMenu() {
    open = !open;
  }
</script>

<svelte:window onhashchange={close} onkeydown={e => e.key === 'Escape' && close()} />

<!-- Desktop: mirrors the top bar, "Terug" on the left of project pages -->
{#if page !== 'info'}
  <footer class="bar desktop grid">
    {#if back}
      <a href="#/" class="cell back">Terug</a>
    {/if}
    <a href="mailto:info@tarchief.studio" class="cell contact">Contacteer mij</a>
    <a href="https://instagram.com/tarchief.studio" target="_blank" rel="noopener" class="cell instagram">Instagram</a>
  </footer>
{/if}

<!-- Phones -->
<button class="overlay" class:open onclick={close} aria-label="Sluit menu" tabindex="-1"></button>

<footer class="bar mobile grid" class:open>
  <div class="left">

    <div class="grow panel-wrap" inert={!open}>
      <div class="panel">
        <span class="head">Contact</span>
        <a href="mailto:info@tarchief.studio">info@tarchief.studio</a>
        <a href="https://instagram.com/tarchief.studio" target="_blank" rel="noopener">@tarchief.studio</a>
        <span>Leuven / Brussel</span>
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

    <div class="bottom-row">
      {#if back}
        <a href="#/" class="cell back-mobile">Terug</a>
      {/if}
      <div class="name">
        <a href="#/" class="name-link" onclick={close}>Studio 't Archief</a>
        <div class="grow bio-wrap" inert={!open}>
          <div>
            <p class="bio">
              Event-, concert- &amp; cultuurfotografie · Leuven/Brussel. Stuur me een DM!
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="right">
    <div class="grow link" inert={!open}><div><a href="#/" class="cell" class:current={page === 'home'} onclick={close}>Home</a></div></div>
    <div class="grow link" inert={!open}><div><a href="#/info" class="cell" class:current={page === 'info'} onclick={close}>Info</a></div></div>
    <div class="grow link" inert={!open}><div><a href="https://instagram.com/tarchief.studio" target="_blank" rel="noopener" class="cell">Instagram</a></div></div>
    <div class="grow link" inert={!open}><div><a href="mailto:info@tarchief.studio" class="cell cta">Contacteer mij</a></div></div>
    <button class="cell toggle" onclick={toggleMenu} aria-expanded={open}>{open ? 'Sluit' : 'Menu'}</button>
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
  .desktop > * { grid-row: 1; }
  .back { grid-column: 1 / 3; }
  .contact { grid-column: 9 / 11; }
  .instagram { grid-column: 11 / 13; }

  .mobile, .overlay { display: none; }

  @media (max-width: 768px) {
    .desktop { display: none; }

    /* The page fades back while the menu is open */
    .overlay {
      display: block;
      position: fixed;
      inset: 0;
      z-index: 70;
      background: rgba(255, 255, 255, 0.7);
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

    /* 1. The name cell widens from columns 3–4 to the whole left half */
    .bottom-row { display: flex; gap: 6px; width: 100%; justify-content: flex-end; align-items: flex-end; }
    .back-mobile { flex: none; width: calc(50% - 3px); }
    .open .back-mobile { display: none; }

    .name {
      width: calc(50% - 3px);
      background: var(--cell);
      font-size: var(--label);
      font-weight: 700;
      transition: width 250ms var(--ease);
    }
    .open .name { width: 100%; transition-delay: 150ms; }
    .name-link { display: flex; align-items: center; min-height: var(--bar); padding: 0 6px; }

    /* 2. Links grow upward one by one */
    .link { margin-bottom: 0; }
    .open .link { margin-bottom: 6px; transition-duration: 250ms; transition-timing-function: cubic-bezier(0.33, 1, 0.68, 1); }
    .open .link:nth-child(1) { transition-delay: 350ms; }
    .open .link:nth-child(2) { transition-delay: 480ms; }
    .open .link:nth-child(3) { transition-delay: 580ms; }
    .open .link:nth-child(4) { transition-delay: 680ms; }
    .cta { background: var(--fg); color: var(--bg); }
    .toggle { cursor: pointer; }

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
    .bio { padding: 0 6px 6px; line-height: 1.3; }
    .panel, .bio { opacity: 0; transition: opacity 150ms var(--ease); }
    .open .panel, .open .bio { opacity: 1; transition: opacity 350ms var(--ease) 660ms; }
  }
</style>
