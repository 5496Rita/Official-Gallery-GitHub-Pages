(() => {
  document.documentElement.classList.add('home-ready');
  const links = document.querySelectorAll('.home-portal, .home-latest a');
  links.forEach(link => {
    link.addEventListener('pointerenter', () => document.body.dataset.hover = link.textContent.trim().split(/\s+/)[0] || '');
    link.addEventListener('pointerleave', () => delete document.body.dataset.hover);
  });
})();
