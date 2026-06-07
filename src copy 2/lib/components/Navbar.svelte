<script lang="ts">
</script>

<nav>
  <div class="nav-container">
    <div class="nav-glass"></div>
    <div class="nav-content">
      <ul class="nav-links">
        <li><a href="#about">Over</a></li>
        <li><a href="#work">Werk</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>
    </div>
  </div>
</nav>

<style>
  nav {
    position: fixed;
    top: 24px; left: 0; right: 0;
    z-index: 100;
    display: flex;
    justify-content: center;
    padding: 0 24px;
    pointer-events: none;
  }

  .nav-container {
    position: relative;
    pointer-events: auto;
  }

  .nav-glass {
    position: absolute;
    inset: 0;
    background: var(--nav-bg);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid var(--line);
    border-radius: 100px;
    z-index: -1;
    transition: background 0.6s ease, border-color 0.6s ease;
  }
  
  .nav-content {
    height: 64px;
    display: flex;
    align-items: center;
    padding: 0 32px;
  }

  .nav-links { 
    display: flex; 
    align-items: center;
    gap: 40px; 
    list-style: none; 
  }
  
  .nav-links a {
    font-family: var(--body);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--fg);
    text-decoration: none;
    opacity: 0.5;
    transition: opacity 0.25s, color 0.6s ease;
  }
  
  .nav-links a:hover { opacity: 1; }

</style>
