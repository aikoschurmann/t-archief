<script lang="ts">
  import { onMount } from 'svelte';

  let mx = 0, my = 0, rx = 0, ry = 0;
  let cursorEl: HTMLDivElement;
  let ringEl: HTMLDivElement;
  let isExpanded = false;

  onMount(() => {
    const moveCursor = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (cursorEl) {
        cursorEl.style.left = mx + 'px';
        cursorEl.style.top = my + 'px';
      }
    };

    const animateRing = () => {
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      if (ringEl) {
        ringEl.style.left = rx + 'px';
        ringEl.style.top = ry + 'px';
      }
      requestAnimationFrame(animateRing);
    };

    const handleMouseEnter = () => isExpanded = true;
    const handleMouseLeave = () => isExpanded = false;

    document.addEventListener('mousemove', moveCursor);
    animateRing();

    const updateInteractions = () => {
      document.querySelectorAll('a, button, .work-item, .form-input, .form-textarea, .form-select').forEach(el => {
        el.addEventListener('mouseenter', handleMouseEnter);
        el.addEventListener('mouseleave', handleMouseLeave);
      });
    };

    updateInteractions();

    // Use a MutationObserver to handle dynamically added elements if needed
    const observer = new MutationObserver(updateInteractions);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.removeEventListener('mousemove', moveCursor);
      observer.disconnect();
    };
  });
</script>

<div class="cursor" class:expand={isExpanded} bind:this={cursorEl}></div>
<div class="cursor-ring" class:expand={isExpanded} bind:this={ringEl}></div>

<style>
  .cursor {
    position: fixed;
    width: 10px; height: 10px;
    background: var(--ink);
    border-radius: 50%;
    pointer-events: none;
    z-index: 9999;
    transform: translate(-50%,-50%);
    transition: transform 0.1s ease, width 0.3s ease, height 0.3s ease, background 0.3s ease;
  }
  
  .cursor-ring {
    position: fixed;
    width: 36px; height: 36px;
    border: 1.5px solid var(--ink);
    border-radius: 50%;
    pointer-events: none;
    z-index: 9998;
    transform: translate(-50%,-50%);
    transition: transform 0.15s ease, width 0.3s ease, height 0.3s ease, opacity 0.3s ease;
    opacity: 0.5;
  }
  
  .cursor.expand { width: 18px; height: 18px; background: var(--accent); }
  .cursor-ring.expand { width: 56px; height: 56px; opacity: 0.2; }

  @media (max-width: 1024px) {
    .cursor, .cursor-ring { display: none; }
  }
</style>
