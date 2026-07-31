(() => {
  'use strict';

  // Gallery items now use normal page navigation.
  // The former expanding-cover transition could remain on screen when the
  // browser restored the gallery from its back-forward cache, blocking input.
  function clearArtworkTransition() {
    document.querySelectorAll('.gallery-transition-clone').forEach(element => element.remove());
    document.body.classList.remove('is-opening-artwork');
  }

  clearArtworkTransition();
  window.addEventListener('pageshow', clearArtworkTransition);
  window.addEventListener('pagehide', clearArtworkTransition);
})();
