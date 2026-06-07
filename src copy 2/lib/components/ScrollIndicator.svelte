<div class="scroll-indicator">
  <div class="line-wrap">
    <div class="line"></div>
  </div>
  <span class="scroll-text">scroll</span>
</div>

<style>
  .scroll-indicator {
    position: absolute;
    bottom: 2.5rem;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    z-index: 100;
    pointer-events: none;
  }

  .line-wrap {
    width: 1px;
    height: 60px;
    background: var(--dim);
    position: relative;
    overflow: hidden;
  }

  .line {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: var(--acc);
    transform: translateY(-100%);
    animation: scroll-line 3s cubic-bezier(0.16, 1, 0.3, 1) infinite;
  }

  .scroll-text {
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.4em;
    text-transform: uppercase;
    color: var(--paper);
    font-weight: 400;
    opacity: 0.8;
    margin-right: -0.4em;
  }

  @keyframes scroll-line {
    0% { transform: translateY(-100%); }
    40%, 100% { transform: translateY(100%); }
  }
</style>
