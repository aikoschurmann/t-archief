<script lang="ts">
  // Wordmark is now static as requested
</script>

<div class="wordmark-container">
  <div class="studio">studio</div>
  <div class="name-wrap">
    <span class="apos">'</span>
    <span class="title">t archief</span>
  </div>
  <div class="subtitle">van moment naar beeld</div>
</div>

<style>
  .wordmark-container {
    position: relative;
    z-index: 20;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    pointer-events: none;
    gap: 0.5rem;
  }

  .studio {
    font-family: var(--font-brand);
    font-weight: 700;
    font-size: clamp(2.5rem, 6vw, 6.5rem);
    color: var(--acc);
    line-height: 0.85;
    letter-spacing: 0.02em;
    margin-bottom: -1rem;
    transition: color 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .name-wrap {
    display: flex;
    align-items: flex-start;
  }

  .apos {
    font-family: var(--font-brand);
    font-style: italic;
    font-weight: 300;
    font-size: clamp(6rem, 14vw, 15rem);
    color: var(--acc);
    line-height: 0.85;
    margin-right: 0.1em; 
    position: relative;
    transition: color 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .title {
    font-family: var(--font-brand);
    font-weight: 700;
    font-size: clamp(5rem, 12vw, 13rem);
    color: var(--paper);
    letter-spacing: -0.015em;
    line-height: 0.85;
    position: relative;
    transition: color 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .subtitle {
    font-family: var(--font-main);
    font-weight: 400;
    font-size: clamp(0.9rem, 1.2vw, 1.2rem);
    letter-spacing: 0.4em;
    text-transform: uppercase;
    color: var(--aged);
    opacity: 0.7;
    margin-top: -0.5rem;
    transition: color 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  }

  @media (max-width: 768px) {
    .studio {
      margin-bottom: -0.5rem;
    }
    .subtitle {
      margin-top: 0;
      letter-spacing: 0.25em;
    }
  }
</style>
