<script lang="ts">
  let {
    page = '',
    href = '',
    counter = ''
  }: {
    page?: string;
    href?: string;
    counter?: string;
  } = $props();
</script>

<header class="bar grid">
  {#if href}
    <a {href} class="cell see">Bekijk project</a>
  {/if}
  <a href="#/" class="cell brand">Studio 't Archief</a>
  <a href="#/info" class="cell info" class:current={page === 'info'}>Info</a>
  <a href="#/" class="cell home" class:current={page === 'home'}>Home</a>
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

  .see { grid-column: 5 / 7; }
  .brand { grid-column: 7 / 9; }
  .info { grid-column: 9 / 11; }
  .home { grid-column: 11 / 12; }
  .counter {
    grid-column: 12 / 13;
    justify-self: start;
    font-variant-numeric: tabular-nums;
  }

  /* Phones: navigation moves into the Menu in the bottom bar */
  @media (max-width: 768px) {
    .bar { display: none; }
  }
</style>
