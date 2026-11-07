<script lang="ts">
  let {
    page = '',
    back = false,
    counter = ''
  }: {
    page?: string;
    back?: boolean;
    counter?: string;
  } = $props();
</script>

<!-- "Home", or "Terug" on project pages, like on phones. The page you're on is the black cell. -->
<header class="bar grid">
  <a href="#/" class="cell brand" class:current={page === 'home'} aria-current={page === 'home' ? 'page' : undefined}>{back ? '← Terug' : 'Home'}</a>
  <a href="#/index" class="cell index" class:current={page === 'index'} aria-current={page === 'index' ? 'page' : undefined}>Index</a>
  <a href="#/info" class="cell info" class:current={page === 'info'} aria-current={page === 'info' ? 'page' : undefined}>Info</a>
  {#if counter}
    <span class="cell counter">{counter}</span>
  {/if}
</header>

<style>
  .bar {
    position: fixed;
    top: var(--gap);
    left: 0;
    right: 0;
    z-index: 50;
  }
  .bar > * { grid-row: 1; }

  .brand { grid-column: 5 / 7; }
  .index { grid-column: 7 / 9; }
  .info { grid-column: 9 / 11; }
  .counter {
    grid-column: 11 / 13;
    justify-self: start;
    font-variant-numeric: tabular-nums;
  }

  /* Phones: navigation moves into the Menu in the bottom bar */
  @media (max-width: 768px) {
    .bar { display: none; }
  }
</style>
