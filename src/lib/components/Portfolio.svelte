<script lang="ts">
  import { onMount } from 'svelte';
  import { loadWorks, type WorkItem } from '../utils/workLoader';
  import OptimizedImage from './OptimizedImage.svelte';

  let works = loadWorks();

  onMount(() => {
    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => { 
        if (e.isIntersecting) { 
          e.target.classList.add('visible'); 
          observer.unobserve(e.target); 
        } 
      });
    }, { threshold: 0.12 });
    reveals.forEach(el => observer.observe(el));
    
    return () => observer.disconnect();
  });
</script>

<section id="work">
  <div class="work-header">
    <div class="reveal">
      <p class="section-label">02 — Werk</p>
      <h2 class="section-title">Geselecteerde<br>projecten.</h2>
    </div>
    <p class="work-header-right reveal reveal-delay-2">Een zorgvuldige selectie van 't archief.</p>
  </div>

  <div class="work-grid">
    {#each works as item, i}
      <a href={item.href} class="work-item reveal" class:is-set={item.type === 'set'} style="transition-delay: {(i % 3) * 0.05}s">
        <div class="work-img-container">
          <div class="work-img">
            {#if item.url}
              <OptimizedImage src={item.url} alt={item.title} />
            {/if}
            
            {#if item.type === 'set'}
              <div class="set-indicator">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="13" height="13" rx="1" />
                  <path d="M21 8v10a3 3 0 0 1-3 3H8" />
                </svg>
              </div>
            {/if}

            <div class="hover-outline"></div>

            <div class="title-pill-wrap">
              <div class="title-pill">
                <span class="work-title">{item.title}</span>
              </div>
            </div>
          </div>
        </div>
      </a>
    {/each}
  </div>
</section>

<style>
  #work { 
    position: relative;
    background: transparent; 
    color: var(--fg); 
    padding: 100px 56px 120px;
    overflow: hidden;
  }

  #work .section-label { color: var(--accent); }
  #work .section-title { color: var(--fg); }
  
  .work-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 80px;
    max-width: 1200px;
    margin-left: auto;
    margin-right: auto;
  }
  
  .work-header-right {
    font-size: 13px;
    font-weight: 400;
    color: var(--fg);
    max-width: 240px;
    text-align: right;
    line-height: 1.7;
    opacity: 0.6;
  }
  
  .work-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    max-width: 1200px;
    margin: 0 auto;
  }

  
  .work-item {
    position: relative;
    aspect-ratio: 1;
    overflow: visible;
    text-decoration: none;
    display: block;
  }

  .work-img-container {
    width: 100%;
    height: 100%;
    position: relative;
  }
  
  .work-img {
    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden;
    background: var(--line);
  }

  .work-img :global(.optimized-image-container) {
    width: 100%;
    height: 100%;
  }

  .work-img :global(img) {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: filter 0.4s ease;
  }
  
  .set-indicator {
    position: absolute;
    top: 15px;
    right: 15px;
    z-index: 5;
    color: #fff;
    width: 18px;
    height: 18px;
    opacity: 0.8;
  }

  .set-indicator svg {
    width: 100%;
    height: 100%;
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
  }

  /* Hover Outline Effect */
  .hover-outline {
    position: absolute;
    inset: 0;
    border: 0.5px solid rgba(255, 255, 255, 0.6);
    opacity: 0;
    z-index: 2;
    pointer-events: none;
    transition: opacity 0.3s ease;
  }

  .work-item:hover .hover-outline {
    opacity: 1;
  }

  .work-item:hover .work-img :global(img) {
    filter: brightness(0.9);
  }

  /* Blurred Title Pill (User Provided Styles) */
  .title-pill-wrap {
    position: absolute;
    bottom: 1rem;
    left: 1rem;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    padding: 0.4rem 0.9rem;
    border-radius: 2rem;
    z-index: 10;
    pointer-events: none;
    border: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .title-pill {
    display: contents; /* Let the wrap handle the background/padding */
  }

  .work-title {
    font-family: var(--body);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.05em;
    color: #fff; /* Changed to white since background is dark */
    text-transform: uppercase;
  }

  @media (max-width: 1024px) {
    .work-grid { grid-template-columns: repeat(2, 1fr); }
  }

  @media (max-width: 768px) {
    #work { padding-top: 60px; }
    .work-grid { 
      grid-template-columns: 1fr; 
      gap: 24px; 
      max-width: 500px; 
      margin: 0 auto; 
      padding: 0; /* Reset desktop padding */
    }
    .work-header { 
      margin-bottom: 48px; 
      flex-direction: column; 
      align-items: flex-start; 
      text-align: left; 
      gap: 24px; 
      max-width: 500px;
      margin-left: auto;
      margin-right: auto;
      padding: 0; /* Reset desktop padding */
    }
    .work-header-right { text-align: left; margin: 0; }
    .set-indicator { top: 12px; right: 12px; width: 18px; height: 18px; }
    
    .title-pill-wrap { 
      bottom: 0.75rem; 
      left: 0.75rem; 
      padding: 0.3rem 0.7rem; 
    }
    .work-title { font-size: 10px; }
  }
</style>
