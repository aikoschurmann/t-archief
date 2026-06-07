<section class="hero" id="intro">
  <div class="hero-container">
    <div class="hero-content-wrap">
      <div class="hero-content">
        
        <div class="wordmark-hero-wrap">
          <div class="wordmark-hero">
            <div class="studio">studio</div>
            <div class="name-wrap">
              <span class="apos">'</span>
              <span class="title">t archief</span>
            </div>
            <div class="subtitle">VAN MOMENT NAAR BEELD</div>
          </div>
        </div>

        <div class="hero-sub">
        </div>
      </div>
    </div>

    <!-- Scroll Indicator -->
    <div class="hero-scroll reveal">
      <div class="scroll-line"></div>
      <span class="scroll-text">SCROLL</span>
    </div>
  </div>
  
  <div class="hero-ticker-wrap">
    <div class="hero-ticker">
      <div class="ticker-track">
        {#each Array(4) as _}
          <span>Portretsessies</span>
          <span>·</span>
          <span>Eventfotografie</span>
          <span>·</span>
          <span>Visuele Verhalen</span>
          <span>·</span>
          <span>Brussel — België</span>
          <span>·</span>
          <span>Studio 't Archief</span>
          <span>·</span>
        {/each}
      </div>
    </div>
  </div>
</section>

<style>
  .hero {
    height: 100vh;
    width: 100%;
    position: relative;
    overflow: hidden;
    background: transparent;
  }

  .hero-container {
    width: 100%;
    max-width: 1200px;
    height: 100%;
    margin: 0 auto;
    padding: 0 56px;
    display: flex;
    flex-direction: column;
    position: relative;
    z-index: 2;
  }
  
  .hero-content-wrap {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding-top: 40px; 
  }

  .hero-content {
    opacity: 0;
    animation: fadeIn 1s 0.2s forwards;
    display: flex;
    flex-direction: column;
  }
  
  .wordmark-hero-wrap {
    display: flex;
    justify-content: center;
    width: 100%;
    margin-bottom: 40px;
  }

  .wordmark-hero {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 0;
  }

  .studio {
    font-family: var(--brand);
    font-weight: 700;
    font-size: clamp(2rem, 5vw, 4rem);
    color: var(--accent);
    line-height: 0.85;
    letter-spacing: 0.02em;
    margin-bottom: -0.5rem;
  }

  .name-wrap {
    display: flex;
    align-items: flex-start;
  }

  .apos {
    font-family: var(--brand);
    font-style: italic;
    font-weight: 300;
    font-size: clamp(5rem, 12vw, 12rem);
    color: var(--accent);
    line-height: 0.85;
    margin-right: 0.05em; 
    position: relative;
  }

  .title {
    font-family: var(--brand);
    font-weight: 700;
    font-size: clamp(4rem, 10vw, 10rem);
    color: var(--fg);
    letter-spacing: -0.015em;
    line-height: 0.85;
    position: relative;
  }

  .subtitle {
    font-family: var(--body);
    font-weight: 600;
    font-size: clamp(0.9rem, 1.2vw, 1.3rem);
    letter-spacing: 0.35em;
    text-transform: uppercase;
    color: var(--fg);
    opacity: 0.85;
    margin-top: 0.2rem;
  }
  
  .hero-sub {
    margin-top: 40px;
    display: flex;
    justify-content: flex-end;
    opacity: 0;
    animation: fadeUp 0.9s 0.8s forwards;
    padding-right: 15%;
  }

  /* Scroll Indicator Styling */
  .hero-scroll {
    position: absolute;
    bottom: 100px; /* Lowered, just above the ticker line */
    left: 50%;
    transform: translate(-50%, 20px);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    opacity: 0;
    animation: scrollFadeUp 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.6s forwards;
  }

  @keyframes scrollFadeUp {
    from { opacity: 0; transform: translate(-50%, 20px); }
    to { opacity: 1; transform: translate(-50%, 0); }
  }

  .scroll-line {
    width: 1px;
    height: 40px;
    background: var(--line); /* Matching other decorative lines */
    position: relative;
    overflow: hidden;
  }

  .scroll-line::after {
    content: '';
    position: absolute;
    top: 0; left: 0;
    width: 100%;
    height: 100%;
    background: var(--accent);
    opacity: 0.8;
    animation: scrollPulse 2.5s cubic-bezier(0.65, 0, 0.35, 1) infinite;
  }

  @keyframes scrollPulse {
    0% { transform: translateY(-100%); }
    100% { transform: translateY(100%); }
  }

  .scroll-text {
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.3em;
    color: var(--fg);
    opacity: 0.4;
  }
  
  /* The "Rectangle" at the bottom */
  .hero-ticker-wrap {
    width: 100%;
    height: 140px;
    border-top: 1px solid var(--line);
    display: flex;
    align-items: center;
    background: transparent;
    position: absolute;
    bottom: 0;
    left: 0;
    z-index: 3;
    opacity: 0;
    animation: fadeUp 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.4s forwards;
  }

  .hero-ticker {
    overflow: hidden;
    white-space: nowrap;
    width: 100%;
  }
  
  .ticker-track {
    display: inline-block;
    animation: ticker 40s linear infinite;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: var(--warm-mid);
  }
  
  .ticker-track span { margin: 0 60px; }

  /* Decorative vertical line - offset to the right */

  
  @keyframes lineSlide {
    from { height: 0; }
    to { height: 30%; }
  }



  @media (max-width: 768px) {
    .hero-container { padding: 0 24px; text-align: center; }
    .hero-content-wrap { padding-top: 20px; align-items: center; }
    .hero-content { align-items: center; width: 100%; }
    
    .studio { font-size: 2.2rem; margin-bottom: -0.2rem; }
    .apos { font-size: 6rem; }
    .title { font-size: 5rem; }
    .subtitle { font-size: 1rem; letter-spacing: 0.25em; margin-top: 0.5rem; }
    
    .hero-ticker-wrap { height: 80px; }
    .hero-scroll { bottom: 120px; }
    .hero-sub { display: none; }
  }
</style>
