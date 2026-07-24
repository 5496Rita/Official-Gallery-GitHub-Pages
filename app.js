(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const state = { view: 'grid', query: '', sort: 'added', artist: 'all' };

  const welcome = $('#welcome');
  const site = $('#site');
  const exhibitionStage = $('#exhibition-stage');
  const archiveRitaResults = $('#archive-rita-results');
  const archiveCroveilResults = $('#archive-croveil-results');
  const archiveRitaSection = $('#archive-rita-section');
  const archiveCroveilSection = $('#archive-croveil-section');
  const archiveRitaCount = $('#archive-rita-count');
  const archiveCroveilCount = $('#archive-croveil-count');
  const archiveSearch = $('#archive-search');
  const archiveSort = $('#archive-sort');
  const archiveCount = $('#archive-count');

  const artistCounts = new Map();
  const normalizedAlbums = albums.map((album, index) => {
    const artistWorkNumber = (artistCounts.get(album.artist) || 0) + 1;
    artistCounts.set(album.artist, artistWorkNumber);
    return { ...album, _index: index, _addedIndex: index, artistWorkNumber };
  });

  const ordinal = value => {
    const mod100 = value % 100;
    if (mod100 >= 11 && mod100 <= 13) return `${value}th`;
    return `${value}${({ 1: 'st', 2: 'nd', 3: 'rd' })[value % 10] || 'th'}`;
  };
  const workLabel = album => `${ordinal(album.artistWorkNumber)} Album`;
  const releaseLabel = album => album.release || 'RELEASE TBA';
  const detailUrl = album => `detail.html?id=${encodeURIComponent(album.id)}`;

  function enterSite() {
    if (!site.hidden) return;
    site.hidden = false;
    requestAnimationFrame(() => {
      welcome.classList.add('is-leaving');
      setTimeout(() => welcome.remove(), 360);
      observeReveals();
    });
  }
  window.setTimeout(enterSite, 2000);

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
      const top = [22, 50, 78][row] + jitterY;
      const depth = seededValue(index + 90);
      const link = document.createElement('a');
      link.className = 'exhibition-item';
      link.href = detailUrl(album);
      link.style.left = `${left}%`;
      link.style.top = `${top}%`;
      link.style.setProperty('--rot', `${(seededValue(index + 40) - .5) * 10}deg`);
      link.style.setProperty('--dur', `${5.5 + seededValue(index + 60) * 4}s`);
      link.style.setProperty('--delay', `${-seededValue(index + 80) * 5}s`);
      link.style.setProperty('--z', String(5 + Math.round(depth * 10)));
      link.style.setProperty('--bright', String(.78 + depth * .25));
      link.style.setProperty('--blur', `${depth < .16 ? .7 : 0}px`);
      link.setAttribute('aria-label', `${album.title} の展示室へ`);
      link.innerHTML = `<img src="${album.art}" alt="${escapeHtml(album.title)}" loading="lazy">`;
      exhibitionStage.appendChild(link);
    });
  }

  function getFilteredAlbums() {
    const q = state.query.trim().toLocaleLowerCase('ja');
    let items = normalizedAlbums.filter(album => {
      if (state.artist !== 'all' && album.artist !== state.artist) return false;
      if (!q) return true;
      return [album.title, album.artist, ...(album.tracks || [])].join(' ').toLocaleLowerCase('ja').includes(q);
    });
    const sorters = {
      added: (a, b) => a._addedIndex - b._addedIndex,
      addedNewest: (a, b) => b._addedIndex - a._addedIndex,
      newest: (a, b) => (!a.release ? 1 : !b.release ? -1 : b.release.localeCompare(a.release)),
      oldest: (a, b) => (!a.release ? 1 : !b.release ? -1 : a.release.localeCompare(b.release)),
      title: (a, b) => a.title.localeCompare(b.title, 'ja')
    };
    return items.sort(sorters[state.sort] || sorters.added);
  }

  function createArchiveCard(album) {
    const link = document.createElement('a');
    link.href = detailUrl(album);
    link.className = 'archive-card';
    link.innerHTML = `
      <span class="archive-card__image"><img src="${album.art}" alt="" loading="lazy"></span>
      <span class="archive-card__meta">
        <h3>${escapeHtml(album.title)}</h3>
        <p>${workLabel(album)} · ${escapeHtml(releaseLabel(album))} · ${(album.tracks || []).length} TRACKS</p>
      </span>`;
    return link;
  }

  function renderArtistArchive(container, section, countElement, artist, items) {
    const artistItems = items.filter(album => album.artist === artist);
    section.hidden = artistItems.length === 0;
    countElement.textContent = `${artistItems.length} WORKS`;
    container.className = `archive-results archive-results--${state.view}`;
    container.innerHTML = '';
    artistItems.forEach(album => container.appendChild(createArchiveCard(album)));
  }

  function renderArchive() {
    const items = getFilteredAlbums();
    archiveCount.textContent = `${items.length} WORKS`;
    renderArtistArchive(archiveRitaResults, archiveRitaSection, archiveRitaCount, '越黒リタ', items);
    renderArtistArchive(archiveCroveilResults, archiveCroveilSection, archiveCroveilCount, 'CROVEIL', items);
    if (!items.length) {
      archiveRitaSection.hidden = false;
      archiveRitaResults.className = 'archive-results archive-results--grid';
      archiveRitaResults.innerHTML = '<p class="archive-empty">該当する作品がありません。</p>';
      archiveRitaCount.textContent = '';
      archiveCroveilSection.hidden = true;
    }
  }

  archiveSearch.addEventListener('input', event => { state.query = event.target.value; renderArchive(); });
  archiveSort.addEventListener('change', event => { state.sort = event.target.value; renderArchive(); });
  $$('.view-toggle button').forEach(button => button.addEventListener('click', () => {
    state.view = button.dataset.view;
    $$('.view-toggle button').forEach(item => item.classList.toggle('is-active', item === button));
    renderArchive();
  }));
  $$('.archive-tabs button').forEach(button => button.addEventListener('click', () => {
    state.artist = button.dataset.artist;
    $$('.archive-tabs button').forEach(item => item.classList.toggle('is-active', item === button));
    renderArchive();
  }));

  function observeReveals() {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    }), { threshold: .14 });
    $$('.reveal').forEach(element => observer.observe(element));
  }

  function escapeHtml(value = '') {
    return String(value).replace(/[&<>'"]/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[char]));
  }

  renderExhibition();
  renderArchive();
})();
