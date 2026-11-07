<script lang="ts">
  import { onMount } from 'svelte';
  import TopBar from './lib/archive/TopBar.svelte';
  import BottomBar from './lib/archive/BottomBar.svelte';
  import InfoView from './lib/archive/InfoView.svelte';
  import IndexView from './lib/archive/IndexView.svelte';
  import HomeView from './lib/archive/HomeView.svelte';
  import EditView from './lib/archive/EditView.svelte';
  import ProjectView from './lib/archive/ProjectView.svelte';
  import { pad, projectColours } from './lib/archive/media';
  import { loadWorks } from './lib/utils/workLoader';

  let currentPath = $state(window.location.hash);
  let allWorks = loadWorks();
  // Hidden projects, and projects whose images are all hidden, don't appear on the site
  // (the editor still sees them)
  let works = allWorks.filter(w => w.visible && w.images.length > 0);

  let slide = $state(0);
  let homeSlide = $state(0);
  let colours: Record<string, string> = $state({});

  // One dot colour per project, shared by every page
  $effect(() => {
    projectColours(works).then(c => (colours = c));
  });
  
  // Find active work item if in a work route
  let activeWork = $derived(
    currentPath.startsWith('#/work/') 
      ? works.find(w => w.id === currentPath.replace('#/work/', '')) 
      : null
  );

  // Coming back home lands on the project you were looking at, not on the first one
  $effect(() => {
    if (activeWork) homeSlide = works.indexOf(activeWork);
  });

  let page = $derived(
    import.meta.env.DEV && currentPath === '#/edit' ? 'edit'
      : activeWork ? 'project'
      // Old section links (#about, #contact) land on the info page too
      : ['#/info', '#about', '#contact'].includes(currentPath) ? 'info'
      : currentPath === '#/index' ? 'index'
      : 'home'
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

  // Reset the project counter on navigation
  $effect(() => {
    currentPath;
    slide = 0;
  });

  // Track page views in GA4 and update title
  $effect(() => {
    // 1. Update document title & description
    let title = "Studio 't Archief | Event-, concert- & cultuurfotografie";
    let description = "Studio 't Archief: event-, concert- en cultuurfotografie in Leuven en Brussel. Van moment naar beeld, zodat het niet verloren gaat.";
    
    if (activeWork) {
      title = `${activeWork.title} | Studio 't Archief`;
      description = activeWork.description || `Bekijk het project ${activeWork.title} van Studio 't Archief.`;
    } else if (page === 'info') {
      title = "Info | Studio 't Archief";
      description = "Studio 't Archief: event-, concert- en cultuurfotografie in Leuven en Brussel. Stuur me een DM of een mail.";
    } else if (page === 'index') {
      title = "Index | Studio 't Archief";
      description = "Alle projecten van Studio 't Archief: event-, concert- en cultuurfotografie.";
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
  {#if page === 'edit'}
    <EditView works={allWorks} />
  {:else}
  <TopBar
    {page}
    back={!!activeWork}
    counter={page === 'home' ? `${pad(homeSlide + 1)} / ${pad(works.length)}`
      : activeWork ? `${pad(slide + 1)} / ${pad(activeWork.images.length)}` : ''}
  />

  {#if activeWork}
    {#key activeWork.id}
      <ProjectView item={activeWork} colour={colours[activeWork.id]} onIndex={i => (slide = i)} />
    {/key}
  {:else if page === 'info'}
    <InfoView {works} />
  {:else if page === 'index'}
    <IndexView {works} {colours} />
  {:else}
    <HomeView {works} {colours} bind:current={homeSlide} />
  {/if}

  <BottomBar {page} back={!!activeWork} />
  {/if}
</main>

<style>
  main {
    width: 100%;
    min-height: 100vh;
    background: var(--bg);
    position: relative;
  }
</style>
