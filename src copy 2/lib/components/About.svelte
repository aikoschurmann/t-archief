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
  <div class="about-container">
    <!-- Vertical Line: Now in the main container to span all rows -->
    <div class="line-v-left"></div>

    <!-- Left Header Content -->
    <div class="about-left-header reveal">
      <div class="label-wrap">
        <p class="section-label">01 — Over</p>
      </div>
      <h2 class="section-title">
        Onze<br>
        Visie.
      </h2>
      <div class="about-vision reveal reveal-delay-1">
        <p class="about-body">
          Met <strong>studio 't archief</strong> vertalen we jouw verhaal <strong>van moment naar beeld</strong> zodat ze nooit verloren gaan. Met een focus op portret- en eventfotografie leggen we de essentie vast van wat er echt toe doet.
        </p>
      </div>
    </div>

    <!-- The Quote -->
    <div class="about-right">
      <div class="quote-wrapper reveal reveal-delay-3">
        <div class="about-quote">
          "Een moment bestaat twee keer. <br>
          Eerst wanneer het gebeurt, <br>
          en daarna wanneer het wordt <br>
          <em>herinnerd.</em>"
        </div>
      </div>
    </div>

    <!-- Meta Info -->
    <div class="about-footer reveal reveal-delay-2">
      <div class="about-meta">
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
    top: 0;
    height: 100%;
    left: 0;
    width: 1px;
    background: var(--fg);
    opacity: 0.1;
    z-index: 1;
  }

  .about-container {
    display: grid;
    grid-template-columns: 1.1fr 0.9fr;
    grid-template-areas: 
      "header quote"
      "footer quote";
    gap: 0 80px;
    align-items: center;
    max-width: 1200px;
    margin: 0 auto;
    position: relative;
    z-index: 2;
  }

  .about-left-header {
    grid-area: header;
    position: relative;
    padding-left: 48px;
    align-self: end;
  }

  .label-wrap {
    margin-bottom: 8px;
  }

  .section-label {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--accent);
  }

  .section-title {
    color: var(--fg);
    font-size: clamp(42px, 6vw, 88px);
    font-weight: 800;
    letter-spacing: -0.04em;
    line-height: 0.95;
    margin-top: 8px;
    margin-bottom: 48px;
  }

  .about-vision {
    max-width: 480px;
    margin-bottom: 40px;
  }

  .about-body {
    font-size: 19px;
    font-weight: 300;
    line-height: 1.8;
    color: var(--fg);
    opacity: 0.9;
  }

  .about-body strong {
    font-weight: 600;
  }

  .about-footer {
    grid-area: footer;
    padding-left: 48px;
    align-self: start;
  }

  .about-meta {
    display: flex;
    gap: 64px;
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
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--mid);
    margin-bottom: 8px;
    opacity: 0.85;
  }

  .meta-value {
    font-size: 14px;
    font-weight: 400;
    color: var(--fg);
  }

  .about-right {
    grid-area: quote;
    display: flex;
    justify-content: flex-start;
    padding-left: 40px;
  }

  .quote-wrapper {
    position: relative;
    max-width: 440px;
  }

  .about-quote {
    font-family: var(--brand);
    font-size: clamp(20px, 2.5vw, 32px);
    font-weight: 400;
    line-height: 1.4;
    color: var(--fg);
    font-style: italic;
    opacity: 1;
    text-align: left;
  }

  .about-quote em {
    color: var(--accent);
    font-style: italic;
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 10px;
  }

  .desktop-only { display: inline; }

  @media (max-width: 1024px) {
    #about { padding: 80px 24px; }
    
    .line-v-left { display: none; }

    .about-container { 
      grid-template-areas: 
        "header"
        "quote"
        "footer";
      grid-template-columns: 1fr;
      gap: 64px; 
      text-align: left; 
      max-width: 500px; 
    }

    .about-left-header { 
      padding-left: 0;
      align-self: auto;
    }
    
    .section-title { font-size: clamp(36px, 8vw, 56px); margin-bottom: 32px; }

    .about-vision { margin-bottom: 0; max-width: none; }
    
    .about-right { 
      padding-left: 0;
      justify-content: center;
    }

    .about-footer { 
      padding-left: 0;
      align-self: auto;
    }

    .about-meta { 
      max-width: fit-content; 
      margin: 0 auto;
      border-top: 1px solid var(--line); 
      padding-top: 32px;
      justify-content: center;
      gap: 48px;
    }
    
    .quote-wrapper { 
      max-width: fit-content; 
      margin: 0 auto;
    }
    
    .about-quote { 
      font-size: clamp(18px, 5vw, 24px);
      line-height: 1.5;
      text-align: left;
    }

    .desktop-only { display: none; }
  }
</style>
