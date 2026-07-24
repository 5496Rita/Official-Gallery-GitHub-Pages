(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const state = { currentIndex: 0, view: 'grid', query: '', sort: 'added' };

  const welcome = $('#welcome');
  const site = $('#site');
  const exhibitionStage = $('#exhibition-stage');
  const archiveResults = $('#archive-results');
  const archiveSearch = $('#archive-search');
  const archiveSort = $('#archive-sort');
  const archiveCount = $('#archive-count');
  const dialog = $('#detail-dialog');

  const artistCounts = new Map();
  const normalizedAlbums = albums.map((album, index) => {
    const artistWorkNumber = (artistCounts.get(album.artist) || 0) + 1;
    artistCounts.set(album.artist, artistWorkNumber);
    return { ...album, _index: index, _addedIndex: index, artistWorkNumber };
  });

  function ordinal(value) {
    const mod100 = value % 100;
    if (mod100 >= 11 && mod100 <= 13) return `${value}th`;
    return `${value}${({ 1: 'st', 2: 'nd', 3: 'rd' })[value % 10] || 'th'}`;
  }

  function workLabel(album) {
    return `${ordinal(album.artistWorkNumber)} Album`;
  }

  function releaseLabel(album) {
    return album.release ? album.release : 'RELEASE TBA';
  }

  function enterSite() {
    site.hidden = false;
    requestAnimationFrame(() => {
      welcome.classList.add('is-leaving');
      setTimeout(() => welcome.remove(), 360);
      observeReveals();
    });
  }

  // A brief title card: show the welcome message, then reveal the gallery automatically.
  window.setTimeout(enterSite, 1000);

  const menuButton = $('#menu-button');
  const siteNav = $('#site-nav');
  menuButton.addEventListener('click', () => {
    const open = siteNav.classList.toggle('is-open');
    menuButton.setAttribute('aria-expanded', String(open));
  });
  $$('#site-nav a').forEach(link => link.addEventListener('click', () => {
    siteNav.classList.remove('is-open');
    menuButton.setAttribute('aria-expanded', 'false');
  }));

  function seededValue(seed) {
    const x = Math.sin(seed * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  }

  function renderExhibition() {
    exhibitionStage.innerHTML = '';
    const columns = Math.ceil(normalizedAlbums.length / 3);
    normalizedAlbums.forEach((album, index) => {
      const column = Math.floor(index / 3);
      const row = index % 3;
      const jitterX = (seededValue(index + 2) - .5) * 6;
      const jitterY = (seededValue(index + 22) - .5) * 11;
      const left = 4 + ((column + .5) / columns) * 92 + jitterX;
      const baseRows = [22, 50, 78];
      const top = baseRows[row] + jitterY;
      const depth = seededValue(index + 90);
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'exhibition-item';
      button.style.left = `${left}%`;
      button.style.top = `${top}%`;
      button.style.setProperty('--rot', `${(seededValue(index + 40) - .5) * 10}deg`);
      button.style.setProperty('--dur', `${5.5 + seededValue(index + 60) * 4}s`);
      button.style.setProperty('--delay', `${-seededValue(index + 80) * 5}s`);
      button.style.setProperty('--z', String(5 + Math.round(depth * 10)));
      button.style.setProperty('--bright', String(.78 + depth * .25));
      button.style.setProperty('--blur', `${depth < .16 ? .7 : 0}px`);
      button.setAttribute('aria-label', `${album.title} を開く`);
      button.innerHTML = `<img src="${album.art}" alt="${escapeHtml(album.title)}" loading="lazy">`;
      button.addEventListener('click', () => openDetail(album._index));
      exhibitionStage.appendChild(button);
    });
  }

  function getFilteredAlbums() {
    const q = state.query.trim().toLocaleLowerCase('ja');
    let items = normalizedAlbums.filter(album => {
      if (!q) return true;
      const haystack = [album.title, album.artist, ...(album.tracks || [])].join(' ').toLocaleLowerCase('ja');
      return haystack.includes(q);
    });
    const sorters = {
      added: (a, b) => a._addedIndex - b._addedIndex,
      addedNewest: (a, b) => b._addedIndex - a._addedIndex,
      newest: (a, b) => {
        if (!a.release && !b.release) return a._addedIndex - b._addedIndex;
        if (!a.release) return 1;
        if (!b.release) return -1;
        return b.release.localeCompare(a.release) || a._addedIndex - b._addedIndex;
      },
      oldest: (a, b) => {
        if (!a.release && !b.release) return a._addedIndex - b._addedIndex;
        if (!a.release) return 1;
        if (!b.release) return -1;
        return a.release.localeCompare(b.release) || a._addedIndex - b._addedIndex;
      },
      title: (a, b) => a.title.localeCompare(b.title, 'ja')
    };
    return items.sort(sorters[state.sort] || sorters.added);
  }

  function renderArchive() {
    const items = getFilteredAlbums();
    archiveResults.className = `archive-results archive-results--${state.view}`;
    archiveResults.innerHTML = '';
    archiveCount.textContent = `${items.length} WORKS`;
    if (!items.length) {
      archiveResults.innerHTML = '<p>該当する作品がありません。</p>';
      return;
    }
    items.forEach(album => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'archive-card';
      button.innerHTML = `
        <span class="archive-card__image"><img src="${album.art}" alt="" loading="lazy"></span>
        <span class="archive-card__meta">
          <h3>${escapeHtml(album.title)}</h3>
          <p>${escapeHtml(album.artist)} · ${workLabel(album)} · ${escapeHtml(releaseLabel(album))} · ${(album.tracks || []).length} TRACKS</p>
        </span>`;
      button.addEventListener('click', () => openDetail(album._index));
      archiveResults.appendChild(button);
    });
  }

  archiveSearch.addEventListener('input', event => { state.query = event.target.value; renderArchive(); });
  archiveSort.addEventListener('change', event => { state.sort = event.target.value; renderArchive(); });
  $$('.view-toggle button').forEach(button => button.addEventListener('click', () => {
    state.view = button.dataset.view;
    $$('.view-toggle button').forEach(item => item.classList.toggle('is-active', item === button));
    renderArchive();
  }));

  function openDetail(index) {
    state.currentIndex = index;
    const album = normalizedAlbums[index];
    $('#detail-cover').src = album.art;
    $('#detail-cover').alt = `${album.title} cover`;
    $('#detail-number').textContent = `${album.artist} · ${workLabel(album)}`;
    $('#detail-title').textContent = album.title;
    $('#detail-release').textContent = album.release ? `RELEASE ${album.release}` : 'RELEASE TBA';
    $('#detail-story').innerHTML = (album.story || []).map(p => `<p>${escapeHtml(p)}</p>`).join('');
    $('#detail-tracks').innerHTML = (album.tracks || []).map(track => `<li>${escapeHtml(track)}</li>`).join('');
    const linkLabels = { spotify: 'SPOTIFY', apple: 'APPLE MUSIC', amazon: 'AMAZON MUSIC', youtube: 'YOUTUBE' };
    $('#detail-links').innerHTML = Object.entries(album.links || {})
      .filter(([, url]) => Boolean(url))
      .map(([key, url]) => `<a href="${escapeAttribute(url)}" target="_blank" rel="noopener">${linkLabels[key] || key.toUpperCase()}</a>`).join('');
    if (!dialog.open) dialog.showModal();
    history.replaceState(null, '', `#work=${encodeURIComponent(album.id)}`);
    dialog.scrollTop = 0;
  }

  function closeDetail() {
    dialog.close();
    if (location.hash.startsWith('#work=')) history.replaceState(null, '', '#archive');
  }

  $('#detail-close').addEventListener('click', closeDetail);
  dialog.addEventListener('click', event => { if (event.target === dialog) closeDetail(); });
  $('#detail-prev').addEventListener('click', () => openDetail((state.currentIndex - 1 + normalizedAlbums.length) % normalizedAlbums.length));
  $('#detail-next').addEventListener('click', () => openDetail((state.currentIndex + 1) % normalizedAlbums.length));
  document.addEventListener('keydown', event => {
    if (!dialog.open) return;
    if (event.key === 'ArrowLeft') $('#detail-prev').click();
    if (event.key === 'ArrowRight') $('#detail-next').click();
  });

  function observeReveals() {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    }), { threshold: .14 });
    $$('.reveal').forEach(element => observer.observe(element));
  }

  function escapeHtml(value = '') {
    return String(value).replace(/[&<>'"]/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[char]));
  }
  function escapeAttribute(value = '') { return escapeHtml(value); }

  renderExhibition();
  renderArchive();

  const workHash = location.hash.match(/^#work=(.+)$/);
  if (workHash) {
    const found = normalizedAlbums.findIndex(album => album.id === decodeURIComponent(workHash[1]));
    enterSite();
    if (found >= 0) setTimeout(() => openDetail(found), 120);
  }
})();
