(function () {
  const FOLLOWING_URL = '/?variant=following';

  // If we ever land on bare "/", bounce to the Following feed.
  function ensureFollowing() {
    if (location.pathname === '/' && !location.search.includes('variant=following')) {
      location.replace(FOLLOWING_URL);
    }
  }

  // Instagram's Home link is an SPA <a href="/">. Intercept clicks and full-load the
  // Following URL instead — SPA pushState would drop the query param.
  document.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('a[href="/"]');
    if (!a) return;
    e.preventDefault();
    e.stopPropagation();
    location.href = FOLLOWING_URL;
  }, true);

  ensureFollowing();
  window.addEventListener('popstate', ensureFollowing);
})();
