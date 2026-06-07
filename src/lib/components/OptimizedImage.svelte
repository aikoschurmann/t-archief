<script lang="ts">
  let { src, alt = '', class: className = '' } = $props();

  let isLoaded = $state(false);
  
  // Construct variations based on naming convention
  // Assuming: 
  // path/image.jpg
  // path/image_sm.webp (800w)
  // path/image_md.webp (1600w)
  // path/image_blur.webp (Tiny)

  let base = $derived(src ? src.substring(0, src.lastIndexOf('.')) : '');
  let blurSrc = $derived(base ? `${base}_blur.webp` : '');
  let smSrc = $derived(base ? `${base}_sm.webp` : '');
  let mdSrc = $derived(base ? `${base}_md.webp` : '');
  
  let srcset = $derived(src ? `${smSrc} 800w, ${mdSrc} 1600w, ${src} 2500w` : '');

  function handleLoad() {
    isLoaded = true;
  }
</script>

<div class="optimized-image-container {className}">
  <!-- Blur Placeholder -->
  <img 
    src={blurSrc} 
    alt=""
    class="blur-placeholder" 
    class:hidden={isLoaded}
  />

  <!-- Main Image -->
  <img
    {src}
    {alt}
    {srcset}
    sizes="(max-width: 900px) 100vw, 1200px"
    loading="lazy"
    onload={handleLoad}
    class:loaded={isLoaded}
  />
</div>

<style>
  .optimized-image-container {
    position: relative;
    overflow: hidden;
    width: 100%;
    height: 100%;
    background: var(--bg-offset);
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .blur-placeholder {
    position: absolute;
    top: 0;
    left: 0;
    filter: blur(20px);
    transform: scale(1.1);
    transition: opacity 0.8s ease;
    z-index: 1;
  }

  .blur-placeholder.hidden {
    opacity: 0;
  }

  img:not(.blur-placeholder) {
    opacity: 0;
    transition: opacity 0.8s ease, transform 0.8s ease;
  }

  img.loaded {
    opacity: 1;
  }
</style>
