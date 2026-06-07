<script lang="ts">
  import { onMount } from 'svelte';
  import { loadWorks, type WorkItem } from '../utils/workLoader';

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
    <p class="work-header-right reveal reveal-delay-2">Een zorgvuldige selectie uit het archief — recente shoots en lopende series.</p>
  </div>

  <div class="work-grid">
    {#each works as item, i}
      <a href={item.href} class="work-item reveal" class:is-set={item.type === 'set'} style="transition-delay: {(i % 3) * 0.05}s">
        <div class="work-img-container">
          <div class="work-img">
            {#if item.url}
              <img src={item.url} alt={item.title} loading="lazy" />
            {/if}
            
            {#if item.type === 'set'}
              <div class="set-indicator">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="13" height="13" rx="1" />
                  <path d="M21 8v10a3 3 0 0 1-3 3H8" />
                </svg>
              </div>
            {/if}

            <div class="work-overlay">
              <div class="overlay-content">
                <div class="work-title">{item.title}</div>
                <div class="work-cat">{item.meta?.category || 'Photography'}</div>
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
    padding-top: 100px; 
    padding-bottom: 120px;
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
  }

  .work-img-container {
    width: 100%;
    height: 100%;
    position: relative;
    transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  }

  
  .work-img {
    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden;
    background: var(--line);
    border: 1px solid var(--line);
    transition: border-color 0.6s ease;
  }

  .work-img img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 1.2s cubic-bezier(0.16, 1, 0.3, 1), filter 0.6s ease;
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
    transition: transform 0.4s ease, opacity 0.4s ease;
  }

  .set-indicator svg {
    width: 100%;
    height: 100%;
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
  }

  .work-item.is-set:hover .set-indicator {
    transform: scale(0.9);
    opacity: 1;
  }

  .work-item:hover .work-img img {
    transform: scale(1.05);
    filter: brightness(0.8) contrast(1.1);
  }

  .work-overlay {
    position: absolute;
    inset: 0;
    background: var(--overlay-bg);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.4s ease;
    padding: 32px;
    text-align: center;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }

  .work-item:hover .work-overlay {
    opacity: 1;
  }

  .overlay-content {
    transform: translateY(12px);
    transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .work-item:hover .overlay-content {
    transform: translateY(0);
  }

  .work-title {
    font-family: var(--brand);
    font-size: clamp(18px, 1.8vw, 28px);
    font-weight: 500;
    color: #fff;
    margin-bottom: 6px;
    line-height: 1.1;
  }
  
  .work-cat {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--accent);
  }

  @media (max-width: 1024px) {
    .work-grid { grid-template-columns: repeat(2, 1fr); }
  }

  @media (max-width: 768px) {
    #work { padding-top: 60px; }
    .work-grid { gap: 8px; }
    .work-header { margin-bottom: 32px; flex-direction: column; align-items: flex-start; gap: 16px; }
    .work-header-right { text-align: left; }
    .work-title { font-size: 16px; }
    .work-cat { font-size: 9px; }
    .set-indicator { top: 10px; right: 10px; width: 14px; height: 14px; }
  }
</style>
