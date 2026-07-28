(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const gallery = document.querySelector('#exhibition-stage');
  if (!gallery) return;

  // The existing gallery is rendered dynamically. Event delegation keeps this lightweight.
  gallery.addEventListener('click', event => {
    const link = event.target.closest('.exhibition-item');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const image = link.querySelector('img');
    if (!image || reduceMotion) return;

    event.preventDefault();

    const rect = image.getBoundingClientRect();
    const targetSize = Math.min(window.innerWidth * .62, window.innerHeight * .68, 680);
    const targetLeft = (window.innerWidth - targetSize) / 2;
    const targetTop = (window.innerHeight - targetSize) / 2;
    const clone = image.cloneNode();

    clone.className = 'gallery-transition-clone';
    Object.assign(clone.style, {
      left: `${rect.left}px`,
      top: `${rect.top}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      transform: 'translateZ(0)'
    });

    document.body.appendChild(clone);
    document.body.classList.add('is-opening-artwork');

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        Object.assign(clone.style, {
          left: `${targetLeft}px`,
          top: `${targetTop}px`,
          width: `${targetSize}px`,
          height: `${targetSize}px`,
          transform: 'translateZ(0) scale(1.015)',
          boxShadow: '0 42px 120px rgba(0,0,0,.92), 0 0 48px rgba(153,97,168,.18)'
        });
      });
    });

    window.setTimeout(() => {
      window.location.href = link.href;
    }, 520);
  });
})();
