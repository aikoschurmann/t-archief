<script lang="ts">
  import { onMount } from 'svelte';
  import Navbar from './lib/components/Navbar.svelte';
  import Hero from './lib/components/Hero.svelte';
  import About from './lib/components/About.svelte';
  import Portfolio from './lib/components/Portfolio.svelte';
  import Contact from './lib/components/Contact.svelte';
  import Footer from './lib/components/Footer.svelte';
  import WorkDetail from './lib/components/WorkDetail.svelte';
  import { loadWorks } from './lib/utils/workLoader';

  let currentPath = $state(window.location.hash);
  let works = loadWorks();
  
  // Find active work item if in a work route
  let activeWork = $derived(
    currentPath.startsWith('#/work/') 
      ? works.find(w => w.id === currentPath.replace('#/work/', '')) 
      : null
  );

  onMount(() => {
    const handleHashChange = () => {
      currentPath = window.location.hash;
    };

    window.addEventListener('hashchange', handleHashChange);
    
    if (window.location.hash) {
      handleHashChange();
    }

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  });

  // Handle scrolling to sections
  $effect(() => {
    if (currentPath && !currentPath.startsWith('#/work/')) {
      const id = currentPath.replace('#', '');
      if (id) {
        setTimeout(() => {
          const el = document.getElementById(id);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }, 50);
      }
    }
  });

  // Track page views in GA4 and update title
  $effect(() => {
    // 1. Update document title & description
    let title = "Studio 't Archief | Portret & Eventfotografie";
    let description = "Studio 't Archief legt jouw meest waardevolle momenten vast. Gevestigd in Brussel, gespecialiseerd in authentieke portret- en eventfotografie. Van moment naar beeld.";
    
    if (activeWork) {
      title = `${activeWork.title} | Studio 't Archief`;
      description = activeWork.description || `Bekijk het project ${activeWork.title} van Studio 't Archief.`;
    } else if (currentPath === '#work') {
      title = "Portfolio | Studio 't Archief";
      description = "Bekijk onze geselecteerde projecten in portret- en eventfotografie.";
    } else if (currentPath === '#about') {
      title = "Over | Studio 't Archief";
      description = "Onze visie op fotografie: van moment naar beeld.";
    } else if (currentPath === '#contact') {
      title = "Contact | Studio 't Archief";
      description = "Start een project met Studio 't Archief. Beschikbaar voor portretsessies en eventfotografie.";
    }
    
    document.title = title;
    
    // Update meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', description);
    }

    // 2. Track GA page view
    if (typeof (window as any).gtag === 'function') {
      // Normalize path for GA: #/work/slug -> /work/slug, #about -> /about, etc.
      const path = currentPath.startsWith('#') 
        ? currentPath.substring(1) || '/' 
        : currentPath || '/';
      
      const normalizedPath = path.startsWith('/') ? path : `/${path}`;

      (window as any).gtag('config', 'G-JC6KNSDQYF', {
        page_path: normalizedPath,
        page_title: title,
        page_location: window.location.href
      });
    }
  });
</script>

<main>
  {#if activeWork}
    <WorkDetail item={activeWork} />
  {:else}
    <Navbar />
    <Hero />
    <About />
    <Portfolio />
    <Contact />
    <Footer />
  {/if}
</main>

<style>
  main {
    width: 100%;
    background: var(--bg);
    overflow-x: hidden;
    position: relative;
    scroll-behavior: smooth;
    display: flex;
    flex-direction: column;
    transition: background 0.6s ease;
  }
</style>
