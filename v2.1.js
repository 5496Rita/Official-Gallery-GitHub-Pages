(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const root = document.documentElement;

  // One passive, animation-frame-throttled pointer listener powers the subtle light field.
  if (!reduceMotion && !coarsePointer) {
    let frame = 0;
    let latestX = innerWidth / 2;
    let latestY = innerHeight * .42;
    const paint = () => {
      frame = 0;
      root.style.setProperty('--v21-pointer-x', `${(latestX / innerWidth) * 100}%`);
      root.style.setProperty('--v21-pointer-y', `${(latestY / innerHeight) * 100}%`);
      const shift = ((latestX / innerWidth) - .5) * -10;
      root.style.setProperty('--v21-room-shift', `${shift.toFixed(2)}px`);
    };
    addEventListener('pointermove', event => {
      latestX = event.clientX;
      latestY = event.clientY;
      if (!frame) frame = requestAnimationFrame(paint);
    }, { passive: true });
  }

  // Track rows become keyboard-focusable exhibition entries and keep one quiet selection state.
  const trackList = document.querySelector('.detail-track-list');
  if (trackList) {
    const tracks = [...trackList.querySelectorAll('li')];
    tracks.forEach((track, index) => {
      track.tabIndex = 0;
      track.setAttribute('aria-label', `${index + 1}曲目 ${track.textContent.trim()}`);
      const select = () => {
        tracks.forEach(item => item.classList.toggle('is-selected', item === track));
      };
      track.addEventListener('click', select);
      track.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          select();
        }
      });
    });
  }

  // Make the album accent available to CSS without changing albums.js.
  if (document.body.classList.contains('detail-page')) {
    const syncAccent = () => {
      const value = document.body.dataset.accent || 'violet';
      document.body.dataset.detailAccent = value;
    };
    syncAccent();
    new MutationObserver(syncAccent).observe(document.body, { attributes: true, attributeFilter: ['data-accent'] });
  }
})();
