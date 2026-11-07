<script lang="ts">
  import { assetsFor, displaySrc, srcsetFor } from './media';

  let {
    src,
    alt = '',
    sizes = '50vw',
    fit = 'cover'
  }: { src: string; alt?: string; sizes?: string; fit?: 'cover' | 'contain' } = $props();

  let loaded = $state(false);
  let blur = $derived(assetsFor(src).blurSrc);
</script>

<!-- Shows the blurred version instantly, then fades the sharp image in over it -->
<!-- "contain" keeps the photo's own shape inside the box, without a grey background -->
<span class="frame" class:contain={fit === 'contain'} class:loaded>
  {#if blur}
    <img class="blur" src={blur} alt="" aria-hidden="true" />
  {/if}
  <img
    class="sharp"
    src={displaySrc(src)}
    srcset={srcsetFor(src)}
    {sizes}
    {alt}
    onload={() => (loaded = true)}
  />
</span>

<style>
  .frame {
    position: relative;
    display: block;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: var(--cell);
  }

  img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .blur {
    filter: blur(24px);
    transform: scale(1.15);
    transition: opacity var(--slow) ease;
  }
  /* Once the sharp photo is in, the blur goes (in "contain" mode it would haze around the photo) */
  .loaded .blur { opacity: 0; }

  .sharp {
    opacity: 0;
    transition: opacity var(--slow) ease;
  }
  .loaded .sharp { opacity: 1; }

  .contain { background: transparent; }
  .contain img { object-fit: contain; }
  .contain .blur { transform: none; }
</style>
