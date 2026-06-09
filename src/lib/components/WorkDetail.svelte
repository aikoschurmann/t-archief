<script lang="ts">
  import type { WorkItem } from '../utils/workLoader';
  import { onMount } from 'svelte';
  import OptimizedImage from './OptimizedImage.svelte';
  import Footer from './Footer.svelte';

  let { item }: { item: WorkItem } = $props();

  // Masonry State
  let columnCount = $derived(item.meta?.columns || (item.images.length > 1 ? 2 : 1));
  let columns: string[][] = $state([]);
  let colHeights: number[] = $state([]);
  let imagesLoaded = $state(0);

  onMount(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Initialize state arrays based on derived columnCount
    columns = Array.from({ length: columnCount }, () => []);
    colHeights = Array(columnCount).fill(0);
    
    // Initial distribution (round-robin) while we wait for measurements
    distributeRoundRobin();
  });

  function distributeRoundRobin() {
    const newCols: string[][] = Array.from({ length: columnCount }, () => []);
    item.images.forEach((img, i) => {
      newCols[i % columnCount].push(img);
    });
    columns = newCols;
  }

  function handleImageLoad(event: Event, src: string) {
    const img = event.target as HTMLImageElement;
    const aspect = img.naturalHeight / img.naturalWidth;
    imagesLoaded++;
    
    if (imagesLoaded === item.images.length) {
      balanceMasonry();
    }
  }

  function balanceMasonry() {
    const newCols: string[][] = Array.from({ length: columnCount }, () => []);
    const newHeights = Array(columnCount).fill(0);
    
    const imgElements = document.querySelectorAll('.hidden-measurer img');
    const measuredImages = Array.from(imgElements).map(img => {
      const i = img as HTMLImageElement;
      return {
        src: i.src,
        ratio: i.naturalHeight / i.naturalWidth
      };
    });

    measuredImages.forEach(imgData => {
      const shortestColIndex = newHeights.indexOf(Math.min(...newHeights));
      newCols[shortestColIndex].push(imgData.src);
      newHeights[shortestColIndex] += imgData.ratio;
    });

    columns = newCols;
    colHeights = newHeights;
  }
</script>

<div class="work-detail">
  <!-- Hidden measurer to get natural dimensions without affecting layout -->
  <div class="hidden-measurer" aria-hidden="true">
    {#each item.images as img}
      <img src={img} alt="" onload={(e) => handleImageLoad(e, img)} loading="eager" />
    {/each}
  </div>

  <nav class="detail-nav">
    <a href="#work" class="back-link">
      <svg class="back-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1">
        <path d="M19 12H5M5 12l7-7M5 12l7 7" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span class="back-text">TERUG NAAR OVERZICHT</span>
    </a>
  </nav>

  <div class="content-wrapper">
    <header class="detail-header">
      <div class="header-main">
        <h1 class="detail-title">{item.title}</h1>
        {#if item.description}
          <p class="description">{item.description}</p>
        {/if}
      </div>
      
      <div class="header-meta">
        {#if item.meta?.date || item.meta?.year}
          <div class="info-block">
            <span class="label">JAAR</span>
            <span class="value">{item.meta.date || item.meta.year}</span>
          </div>
        {/if}
        {#if item.meta?.location}
          <div class="info-block">
            <span class="label">LOCATIE</span>
            <span class="value">{item.meta.location}</span>
          </div>
        {/if}
        {#if item.meta?.category}
          <div class="info-block">
            <span class="label">PROJECT</span>
            <span class="value">{item.meta.category}</span>
          </div>
        {/if}
      </div>
    </header>

    <main class="detail-content">
      {#if item.type === 'video' && item.videoUrl}
        <div class="media-wrap video full-width">
          <video src={item.videoUrl} controls autoplay muted loop playsinline></video>
        </div>
      {/if}

      {#if item.images.length > 0}
        <div class="masonry-grid" style="--cols: {columnCount}">
          {#each columns as col}
            <div class="masonry-col">
              {#each col as img}
                <div class="media-wrap">
                  <OptimizedImage src={img} alt={item.title} />
                </div>
              {/each}
            </div>
          {/each}
        </div>
      {/if}
    </main>

    {#if item.meta?.long_text}
      <section class="long-text">
        <div class="text-container">
          <p>{item.meta.long_text}</p>
        </div>
      </section>
    {/if}

  </div>

  <div class="full-width-footer">
    <Footer />
  </div>
</div>

<style>
  .work-detail {
    min-height: 100vh;
    background: var(--bg);
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    color: var(--fg);
    transition: background 0.6s ease;
    padding: 0 56px;
  }

  .hidden-measurer {
    position: absolute;
    width: 0;
    height: 0;
    overflow: hidden;
    opacity: 0;
    pointer-events: none;
  }

  .content-wrapper {
    max-width: 1200px;
    width: 100%;
    padding: 0 0 100px;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 0 auto;
  }

  .full-width-footer {
    width: calc(100% + 112px);
    margin-left: -56px;
    margin-right: -56px;
  }

  .detail-nav {
    max-width: 1200px;
    width: 100%;
    padding: 40px 0 0;
    display: flex;
    justify-content: center;
    z-index: 10;
    margin: 0 auto;
  }

  .back-link {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    font-family: var(--body);
    font-size: 10px;
    letter-spacing: 0.2em;
    color: var(--fg);
    text-decoration: none;
    transition: all 0.4s ease;
    font-weight: 700;
    position: relative;
    padding-bottom: 6px;
    text-transform: uppercase;
    opacity: 0.6;
  }

  .back-arrow {
    width: 14px;
    height: 14px;
    transition: transform 0.4s ease;
  }

  .back-link::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0;
    height: 1px;
    background: var(--accent);
    transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .back-link:hover { opacity: 1; }
  .back-link:hover .back-arrow { transform: translateX(-4px); }
  .back-link:hover::after { width: 100%; }

  .detail-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 1.5rem;
    margin: 1.25rem 0 5rem 0;
    max-width: 1000px;
  }

  .header-main {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    width: 100%;
  }

  .detail-title {
    font-family: var(--body);
    font-size: clamp(3rem, 8vw, 6.5rem);
    font-weight: 800;
    line-height: 0.95;
    letter-spacing: -0.04em;
    color: var(--fg);
    margin: 0;
  }

  .description {
    font-size: 1.1rem;
    color: var(--fg);
    max-width: 50ch;
    line-height: 1.6;
    font-weight: 400;
    margin: 0 auto;
    opacity: 0.8;
  }

  .header-meta {
    display: flex;
    gap: 4rem;
    padding-top: 1.5rem;
    width: 100%;
    justify-content: center;
  }

  .info-block {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    align-items: center;
  }

  .label {
    font-size: 10px;
    letter-spacing: 0.15em;
    color: var(--accent);
    text-transform: uppercase;
    font-weight: 700;
  }

  .value {
    font-family: var(--body);
    font-size: 13px;
    letter-spacing: 0.05em;
    color: var(--fg);
    font-weight: 600;
    text-transform: uppercase;
  }

  .detail-content {
    width: 100%;
  }

  .masonry-grid {
    display: flex;
    gap: 16px;
    width: 100%;
    align-items: flex-start;
  }

  .masonry-col {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .media-wrap {
    width: 100%;
    overflow: hidden;
    border-radius: 2px;
    background: var(--bg-alt);
  }

  .media-wrap :global(.optimized-image-container) {
    width: 100%;
    height: auto;
  }

  .media-wrap img, .media-wrap video {
    width: 100%;
    height: auto;
    display: block;
    transition: transform 0.6s ease;
  }

  .full-width {
    width: 100%;
    margin-bottom: 16px;
  }

  .long-text {
    margin-top: 6rem;
    padding: 6rem 0;
    display: flex;
    justify-content: center;
    width: 100%;
    border-top: 1px solid var(--line);
  }

  .text-container {
    max-width: 800px;
    text-align: center;
  }

  .long-text p {
    font-size: 1.3rem;
    line-height: 1.8;
    color: var(--fg);
    font-weight: 300;
  }

  @media (max-width: 900px) {
    .work-detail { padding: 0 24px; }
    .content-wrapper { padding: 0 0 60px; }
    .full-width-footer {
      width: calc(100% + 48px);
      margin-left: -24px;
      margin-right: -24px;
    }
    .detail-nav { padding: 32px 0 0; }
    .detail-header { margin: 1.5rem 0 2.5rem 0; gap: 1.5rem; }
    .header-main { gap: 1.5rem; }
    .header-meta { gap: 1.5rem; flex-wrap: wrap; padding-top: 0.5rem; }
    .masonry-grid { flex-direction: column; gap: 12px; }
    .masonry-col { gap: 12px; }
    .description { font-size: 1rem; line-height: 1.5; }
    .detail-title { font-size: 2.5rem; }
  }
</style>
