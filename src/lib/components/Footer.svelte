<script lang="ts">
  const currentYear = new Date().getFullYear();
</script>

<footer>
  <div class="footer-main">
    <div class="footer-left">
      <h2 class="footer-big-title">Laten we<br>iets creëren.</h2>
      <a href="mailto:info@tarchief.studio" class="footer-email-large">info@tarchief.studio</a>
    </div>

    <div class="footer-right">
      <div class="footer-nav-group">
        <span class="nav-label">Navigatie</span>
        <nav class="footer-links">
          <a href="#intro">Home</a>
          <a href="#about">Over</a>
          <a href="#work">Werk</a>
          <a href="#contact">Contact</a>
        </nav>
      </div>

      <div class="footer-nav-group">
        <span class="nav-label">Sociaal</span>
        <nav class="footer-links">
          <a href="https://instagram.com/studioarchief" target="_blank" rel="noopener">Instagram</a>
          <a href="mailto:info@tarchief.studio">Email</a>
        </nav>
      </div>
    </div>
  </div>

  <div class="footer-bottom">
    <div class="footer-bottom-inner">
      <div class="footer-legal">
        <span>© {currentYear} Studio 't archief</span>
        <span class="sep">/</span>
        <span>Brussel, België</span>
      </div>

      <div class="footer-tag">Every image, an archive.</div>
    </div>
  </div>
</footer>

<style>
  footer {
    background: var(--footer-bg);
    color: var(--footer-fg);
    padding: 120px 56px 0;
    position: relative;
    overflow: hidden;
    transition: background 0.6s ease, color 0.6s ease;
  }

  .footer-main {
    max-width: 1200px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1.2fr 0.8fr;
    gap: 80px;
    padding-bottom: 80px;
    position: relative;
    z-index: 2;
  }

  .footer-big-title {
    font-family: var(--body);
    font-size: clamp(40px, 5vw, 72px);
    font-weight: 800;
    letter-spacing: -0.04em;
    line-height: 0.95;
    color: var(--footer-fg);
    margin-bottom: 24px;
  }

  .footer-email-large {
    display: inline-block;
    font-family: var(--brand);
    font-size: clamp(24px, 3vw, 40px);
    font-weight: 400;
    color: var(--footer-fg);
    text-decoration: none;
    transition: color 0.3s ease;
  }

  .footer-email-large:hover {
    color: var(--accent);
  }

  .footer-right {
    display: flex;
    gap: 100px;
    padding-top: 20px;
  }

  .footer-nav-group {
    display: flex;
    flex-direction: column;
    gap: 32px;
  }

  .nav-label {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--accent);
    opacity: 0.9;
  }

  .footer-links {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .footer-links a {
    font-size: 14px;
    font-weight: 400;
    color: var(--footer-fg);
    opacity: 0.6;
    transition: opacity 0.3s, transform 0.3s;
    text-decoration: none;
  }

  .footer-links a:hover {
    opacity: 1;
    transform: translateX(4px);
  }

  .footer-bottom {
    border-top: 1px solid var(--line);
    padding: 40px 0;
    margin-top: 40px;
  }

  .footer-bottom-inner {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }

  .footer-legal {
    display: flex;
    gap: 16px;
    font-size: 11px;
    letter-spacing: 0.05em;
    opacity: 0.4;
  }

  .footer-legal .sep {
    opacity: 0.5;
  }

  .footer-tag {
    font-family: var(--brand);
    font-style: italic;
    font-size: 13px;
    opacity: 0.4;
  }

  @media (max-width: 1024px) {
    .footer-main { grid-template-columns: 1fr; gap: 64px; }
    .footer-right { gap: 64px; }
  }

  @media (max-width: 768px) {
    footer { padding: 80px 24px 0; }
    
    .footer-main { 
      max-width: 500px; 
      margin: 0 auto; 
      text-align: left;
    }
    
    .footer-big-title { margin-bottom: 48px; }
    .footer-right { flex-direction: column; gap: 48px; }
    
    .footer-bottom-inner { 
      flex-direction: column; 
      align-items: flex-start;
      gap: 20px; 
      text-align: left; 
      max-width: 500px;
      margin: 0 auto;
    }
  }
</style>
