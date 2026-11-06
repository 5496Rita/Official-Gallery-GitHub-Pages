(() => {
  'use strict';
  const originalFetch = window.fetch.bind(window);
  window.fetch = (input, init = {}) => {
    let url = typeof input === 'string' ? input : input?.url;
    if (typeof url === 'string' && /(^|\/)lyrics\/[^/?#]+\.json(?:[?#]|$)/.test(url)) {
      try {
        const absolute = new URL(url, location.href);
        absolute.searchParams.set('v', '3300');
        const requestInit = { ...init, cache: 'no-store' };
        if (typeof input === 'string') return originalFetch(absolute.href, requestInit);
        return originalFetch(new Request(absolute.href, input), requestInit);
      } catch (_) {
        return originalFetch(input, { ...init, cache: 'no-store' });
      }
    }
    return originalFetch(input, init);
  };
})();
