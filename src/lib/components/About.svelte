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
    <div class="line-v-left"></div>

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

  </div>
</section>

<style>
  #about {
    position: relative;
    padding: 180px 56px;
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
    opacity: 0.08;
    z-index: 1;
  }

  .about-container {
    display: grid;
    grid-template-columns: 1.2fr 0.8fr;
    grid-template-areas: "header quote";
    gap: 0 100px;
    align-items: center;
    max-width: 1200px;
    margin: 0 auto;
    position: relative;
    z-index: 2;
  }

  .about-left-header {
    grid-area: header;
    position: relative;
    padding-left: 64px;
  }

  .label-wrap {
    margin-bottom: 12px;
  }

  .section-label {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: var(--accent);
  }

  .section-title {
    color: var(--fg);
    font-size: clamp(48px, 7vw, 92px);
    font-weight: 800;
    letter-spacing: -0.04em;
    line-height: 0.9;
    margin-top: 8px;
    margin-bottom: 56px;
  }

  .about-vision {
    max-width: 460px;
  }

  .about-body {
    font-size: 18px;
    font-weight: 300;
    line-height: 1.9;
    color: var(--fg);
    opacity: 0.85;
  }

  .about-body strong {
    font-weight: 600;
    color: var(--fg);
  }

  .about-right {
    grid-area: quote;
    display: flex;
    justify-content: flex-start;
    padding-left: 20px;
  }

  .quote-wrapper {
    position: relative;
    max-width: 440px;
  }

  .about-quote {
    font-family: var(--brand);
    font-size: clamp(22px, 2.6vw, 32px);
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
    text-decoration: none;
    border-bottom: 1px solid var(--accent);
    padding-bottom: 2px;
  }

  @media (max-width: 1024px) {
    #about { padding: 100px 32px; }

    .line-v-left { display: none; }

    .about-container {
      grid-template-areas:
        "header"
        "quote";
      grid-template-columns: 1fr;
      gap: 72px;
      text-align: left;
      max-width: 500px;
    }

    .about-left-header { padding-left: 0; }

    .section-title { font-size: clamp(42px, 10vw, 64px); margin-bottom: 32px; }

    .about-vision { max-width: none; }

    .about-right { padding-left: 0; }

    .about-quote {
      font-size: 24px;
      line-height: 1.5;
    }
  }
</style>
