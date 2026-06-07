<script lang="ts">
  import { onMount } from 'svelte';
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

<section id="about">
  <!-- Original decorative elements -->
  <div class="line-v-left"></div>
  <div class="line-h-accent"></div>

  <div class="about-container">

    <div class="about-left reveal">
      <div class="label-wrap">
        <p class="section-label">01 — Over</p>
      </div>
      <h2 class="section-title">
        De<br>
        filosofie.
      </h2>
      <div class="about-quote reveal reveal-delay-1">
        "Een moment bestaat twee keer. <br>
        Eerst wanneer het gebeurt, <br>
        en daarna wanneer het wordt <br>
        <em>herinnerd.</em>"
      </div>
    </div>

    <div class="about-right">
      <div class="about-content reveal reveal-delay-2">
        <div class="content-block">
          <p class="about-body">
            Met <strong>studio 't archief</strong> vertalen we jouw verhaal <strong>van moment naar beeld</strong> zodat ze nooit verloren gaan. Met een focus op portret- en eventfotografie leggen we de essentie vast van wat er echt toe doet.
          </p>
        </div>

        <div class="about-meta reveal reveal-delay-3">
          <div class="meta-item">
            <span class="meta-label">Locatie</span>
            <span class="meta-value">Brussel, België</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Focus</span>
            <span class="meta-value">Portret & Events</span>
          </div>
        </div>
      </div>
    </div>

  </div>
</section>

<style>
  #about {
    position: relative;
    padding: 160px 56px;
    background: var(--bg-alt);
    overflow: hidden;
    transition: background 0.6s ease;
  }

  .line-v-left {
    position: absolute;
    top: 160px;
    left: calc(50% - 600px);
    width: 1px;
    height: 400px;
    background: var(--fg);
    opacity: 0.15;
    z-index: 1;
  }

  .line-h-accent {
    position: absolute;
    top: 600px;
    left: calc(50% - 600px);
    width: 120px;
    height: 1px;
    background: var(--accent);
    opacity: 0.4;
    z-index: 1;
  }

  .about-container {
    display: grid;
    grid-template-columns: 1.1fr 0.9fr;
    gap: 100px;
    align-items: start;
    max-width: 1200px;
    margin: 0 auto;
    position: relative;
    z-index: 2;
  }

  .label-wrap {
    padding-left: 24px;
    margin-bottom: 8px;
  }

  .section-label {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--mid);
  }

  .section-title {
    color: var(--fg);
    font-size: clamp(42px, 6vw, 88px);
    font-weight: 800;
    letter-spacing: -0.04em;
    line-height: 0.95;
    margin-top: 8px;
    margin-bottom: 48px;
    padding-left: 24px;
  }

  .about-quote {
    font-family: var(--brand);
    font-size: clamp(24px, 2.5vw, 32px);
    font-weight: 400;
    line-height: 1.3;
    color: var(--fg);
    font-style: italic;
    opacity: 0.8;
    max-width: 440px;
    padding-left: 24px;
  }

  .about-quote em {
    color: var(--accent);
    font-style: italic;
  }

  .about-right {
    padding-top: 36px; /* Aligned with the top of 'De filosofie' */
  }

  .about-content {
    display: flex;
    flex-direction: column;
    gap: 64px;
  }

  .about-body {
    font-size: 19px;
    font-weight: 300;
    line-height: 1.8;
    color: var(--fg);
    margin-bottom: 24px;
    max-width: 440px;
  }

  .about-body strong {
    font-weight: 600;
  }


  .about-meta {
    display: flex;
    justify-content: space-between;
    gap: 40px;
    border-top: 1px solid var(--line);
    padding-top: 40px;
    max-width: 440px;
  }

  .meta-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .meta-label {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--fg);
    opacity: 0.95;
  }

  .meta-value {
    font-size: 14px;
    font-weight: 400;
    color: var(--fg);
  }

  @media (max-width: 1024px) {
    #about { padding: 80px 24px; }
    .about-container { grid-template-columns: 1fr; gap: 48px; }
    .about-left { position: static; }
    .about-right { padding-top: 0; }
    .about-quote { font-size: 24px; }
    .line-v-left, .line-h-accent { display: none; }
  }
</style>