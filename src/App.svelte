<script lang="ts">
  import TopBar from './lib/archive/TopBar.svelte';
  import BottomBar from './lib/archive/BottomBar.svelte';
  import InfoView from './lib/archive/InfoView.svelte';
  import IndexView from './lib/archive/IndexView.svelte';
  import HomeView from './lib/archive/HomeView.svelte';
  import EditView from './lib/archive/EditView.svelte';
  import ProjectView from './lib/archive/ProjectView.svelte';
  import { pad, projectColours } from './lib/archive/media';
  import { route } from './lib/archive/router.svelte';
  import { loadWorks } from './lib/utils/workLoader';
  import { COPY, DESCRIPTION, FREE_WORK, PERSON, STUDIO } from './lib/site';

  let allWorks = loadWorks();
  // Hidden projects, and projects whose images are all hidden, don't appear on the site
  // (the editor still sees them)
  let works = allWorks.filter(w => w.visible && w.images.length > 0);
  // Stage and event work leads; landscape and portrait sit apart as "Vrij werk"
  let mainWorks = works.filter(w => w.meta?.section !== FREE_WORK);

  let slide = $state(0);
  let homeSlide = $state(0);
  let colours: Record<string, string> = $state({});

  // One dot colour per project, shared by every page
  $effect(() => {
    projectColours(works).then(c => (colours = c));
  });

  // Find active work item if in a work route
  let activeWork = $derived(
    route.path.startsWith('/work/')
      ? works.find(w => w.id === route.path.slice('/work/'.length))
      : null
  );

  // Coming back home lands on the project you were looking at, not on the first one
  $effect(() => {
    if (activeWork && mainWorks.includes(activeWork)) homeSlide = mainWorks.indexOf(activeWork);
  });

  let page = $derived(
    import.meta.env.DEV && route.path === '/edit' ? 'edit'
      : activeWork ? 'project'
      : route.path === '/info' || route.path === '/en' ? 'info'
      : route.path === '/projecten' ? 'index'
      : 'home'
  );
  let lang = $derived(route.path === '/en' ? 'en' : 'nl') as 'nl' | 'en';

  // Reset the project counter on navigation
  $effect(() => {
    route.path;
    slide = 0;
  });

  // Track page views in GA4 and update title
  $effect(() => {
    // 1. Update document title & description (the build writes the same into each page's HTML)
    let title = `${STUDIO} | Podium- en eventfotografie in Leuven en Brussel`;
    let description = DESCRIPTION;

    if (activeWork) {
      title = `${activeWork.title} | ${STUDIO}`;
      description = activeWork.meta?.context || activeWork.description || `${activeWork.title}, gefotografeerd door ${PERSON}.`;
    } else if (page === 'info') {
      title = lang === 'en' ? `About and booking | ${STUDIO}` : `Info en boeken | ${STUDIO}`;
      description = `${COPY[lang].statement} ${COPY[lang].offers.join(', ')}.`;
    } else if (page === 'index') {
      title = `Projecten | ${STUDIO}`;
      description = `Alle projecten van ${STUDIO}: voorstellingen, concerten en events.`;
    }

    document.title = title;
    document.documentElement.lang = lang === 'en' ? 'en' : 'nl-BE';

    // Update meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', description);
    }

    // 2. Track GA page view
    if (typeof (window as any).gtag === 'function') {
      (window as any).gtag('config', 'G-JC6KNSDQYF', {
        page_path: route.path,
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
    counter={page === 'home' ? `${pad(homeSlide + 1)} / ${pad(mainWorks.length)}`
      : activeWork ? `${pad(slide + 1)} / ${pad(activeWork.images.length)}` : ''}
  />

  {#if activeWork}
    {#key activeWork.id}
      <ProjectView item={activeWork} colour={colours[activeWork.id]} onIndex={i => (slide = i)} />
    {/key}
  {:else if page === 'info'}
    <InfoView works={mainWorks} {lang} />
  {:else if page === 'index'}
    <IndexView {works} {colours} />
  {:else}
    <HomeView works={mainWorks} {colours} bind:current={homeSlide} />
  {/if}

  <BottomBar {page} {lang} back={!!activeWork} />
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
