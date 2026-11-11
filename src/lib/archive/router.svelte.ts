// Real paths (/work/30cc-circus) instead of hash routes, so every page has its own address
// for search engines and link previews. Links stay plain <a href="/..."> elements: clicks on
// same-site links are caught here and handled without a page load.

/** Old hash addresses (#/work/x, #/index, #about) still land on the right page. */
function fromHash(hash: string): string | null {
  if (hash.startsWith('#/work/')) return hash.slice(1);
  if (hash === '#/index') return '/projecten';
  if (['#/info', '#about', '#contact'].includes(hash)) return '/info';
  if (hash === '#/edit') return '/edit';
  if (hash === '#/') return '/';
  return null;
}

function normalise(path: string) {
  return path.length > 1 ? path.replace(/\/+$/, '').replace(/\.html$/, '') : path;
}

const legacy = fromHash(location.hash);
if (legacy) history.replaceState(null, '', legacy);

export const route = $state({ path: normalise(location.pathname), hash: location.hash });

export function navigate(to: string) {
  const url = new URL(to, location.href);
  if (url.pathname !== location.pathname || url.hash !== location.hash) {
    history.pushState(null, '', url.pathname + url.search + url.hash);
  }
  route.path = normalise(url.pathname);
  route.hash = url.hash;
  if (url.hash) {
    // Let the page render first, then jump to the anchor
    requestAnimationFrame(() => document.querySelector(url.hash)?.scrollIntoView({ behavior: 'smooth' }));
  } else {
    window.scrollTo(0, 0);
  }
}

window.addEventListener('popstate', () => {
  route.path = normalise(location.pathname);
  route.hash = location.hash;
});

document.addEventListener('click', e => {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const a = (e.target as Element).closest?.('a');
  if (!a || a.target || a.hasAttribute('download')) return;
  const url = new URL(a.href, location.href);
  if (url.origin !== location.origin || url.pathname.startsWith('/__')) return;
  e.preventDefault();
  navigate(url.pathname + url.hash);
});
