(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const state = { view: 'grid', query: '', sort: 'added', artist: 'all' };
  const RETURN_STATE_KEY = 'officialGalleryReturnState';
  let returnState = null;
  try { returnState = JSON.parse(sessionStorage.getItem(RETURN_STATE_KEY) || 'null'); } catch (_) { returnState = null; }
  const isReturningFromDetail = Boolean(returnState && returnState.returning);

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
  const detailUrl = (album, from = 'archive') => `detail.html?id=${encodeURIComponent(album.id)}&from=${encodeURIComponent(from)}`;
  const thumbnailUrl = album => `covers/thumbs/${encodeURIComponent(album.id)}.webp`;
  const newestRelease = normalizedAlbums.reduce((latest, album) => {
    if (!album.release) return latest;
    return !latest || album.release > latest ? album.release : latest;
  }, '');

  function applySiteUrls() {
    const configured = String(window.SITE_CONFIG?.siteUrl || '').replace(/\/$/, '');
    const base = configured || `${location.origin}${location.pathname.replace(/[^/]*$/, '')}`.replace(/\/$/, '');
    $$('[data-site-url]').forEach(element => {
      const raw = element.getAttribute('href') || element.getAttribute('content') || '';
      const resolved = raw.replace('__SITE_URL__', base);
      if (element.hasAttribute('href')) element.setAttribute('href', resolved);
      if (element.hasAttribute('content')) element.setAttribute('content', resolved);
    });
    $$('[data-relative-url]').forEach(element => {
      const raw = element.getAttribute('content');
      if (raw && !/^https?:/i.test(raw)) element.setAttribute('content', new URL(raw, location.href).href);
    });
  }

  function enablePageTransitions() {
    requestAnimationFrame(() => document.body.classList.add('is-ready'));
    document.addEventListener('click', event => {
      const link = event.target.closest('a[href]');
      if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (link.target === '_blank' || link.hasAttribute('download')) return;
      const url = new URL(link.href, location.href);
      if (url.origin !== location.origin || (url.pathname === location.pathname && url.search === location.search && url.hash)) return;
      event.preventDefault();
      document.body.classList.add('is-exiting');
      window.setTimeout(() => { location.href = url.href; }, prefersReducedMotion ? 0 : 180);
    });
  }

  function enterSite() {
    if (!site || !welcome || !site.hidden) return;
    site.hidden = false;
    requestAnimationFrame(() => {
      welcome.classList.add('is-leaving');
      window.setTimeout(() => welcome.remove(), 360);
      observeReveals();
    });
  }

  function initFeaturedShort() {
    const playerHost = document.getElementById('featured-short-player');
    if (!playerHost) return;

    const playlistId = 'PLiJ4i_JuStGC25t-DOW7QXow7CaN32HHV';
    let randomized = false;
    let settling = false;

    const createPlayer = () => {
      if (!window.YT?.Player || playerHost.dataset.initialized === 'true') return;
      playerHost.dataset.initialized = 'true';

      const player = new window.YT.Player(playerHost, {
        width: '100%',
        height: '100%',
        playerVars: {
          listType: 'playlist',
          list: playlistId,
          playsinline: 1,
          rel: 0,
          controls: 1,
          modestbranding: 1,
          enablejsapi: 1
        },
        events: {
          onReady(event) {
            event.target.cuePlaylist({ listType: 'playlist', list: playlistId, index: 0 });
          },
          onStateChange(event) {
            if (settling && event.data === window.YT.PlayerState.PLAYING) {
              event.target.pauseVideo();
              settling = false;
              return;
            }
            if (!randomized && event.data === window.YT.PlayerState.CUED) {
              randomized = true;
              event.target.setShuffle(true);
              settling = true;
              event.target.nextVideo();
            }
          }
        }
      });
    };

    if (window.YT?.Player) {
      createPlayer();
      return;
    }

    const previousReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (typeof previousReady === 'function') previousReady();
      createPlayer();
    };

    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.async = true;
      document.head.appendChild(script);
    }
  }

  initFeaturedShort();

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const welcomeDelay = isReturningFromDetail ? 0 : (prefersReducedMotion ? 0 : 2300);
  window.setTimeout(enterSite, welcomeDelay);
  welcome?.addEventListener('click', enterSite);
  welcome?.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      enterSite();
    }
  });

  const menuButton = $('#menu-button');
  const siteNav = $('#site-nav');
  menuButton?.addEventListener('click', () => {
    const open = siteNav?.classList.toggle('is-open') || false;
    menuButton.setAttribute('aria-expanded', String(open));
  });
  $$('#site-nav a').forEach(link => link.addEventListener('click', () => {
    siteNav?.classList.remove('is-open');
    menuButton.setAttribute('aria-expanded', 'false');
  }));

  function seededValue(seed) {
    const x = Math.sin(seed * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  }

  function shuffle(items) {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  function renderExhibition() {
    if (!exhibitionStage) return;
    exhibitionStage.replaceChildren();
    const columns = Math.max(1, Math.ceil(normalizedAlbums.length / 3));
    const shuffledAlbums = shuffle(normalizedAlbums);
    shuffledAlbums.forEach((album, index) => {
      const column = Math.floor(index / 3);
      const row = index % 3;
      const jitterX = (seededValue(index + 2) - .5) * 6;
      const jitterY = (seededValue(index + 22) - .5) * 11;
      const left = 4 + ((column + .5) / columns) * 92 + jitterX;
      const top = [22, 50, 78][row] + jitterY;
      const depth = seededValue(index + 90);
      const link = document.createElement('a');
      link.className = 'exhibition-item';
      link.dataset.albumId = album.id;
      link.href = detailUrl(album, 'exhibition');
      link.style.left = `${left}%`;
      link.style.top = `${top}%`;
      link.style.setProperty('--rot', `${(seededValue(index + 40) - .5) * 10}deg`);
      link.style.setProperty('--dur', `${5.5 + seededValue(index + 60) * 4}s`);
      link.style.setProperty('--delay', `${-seededValue(index + 80) * 5}s`);
      link.style.setProperty('--z', String(5 + Math.round(depth * 10)));
      link.style.setProperty('--bright', String(.78 + depth * .25));
      link.style.setProperty('--blur', `${depth < .16 ? .7 : 0}px`);
      link.setAttribute('aria-label', `${album.title} の展示室へ`);
      link.innerHTML = `
        <span class="exhibition-item__spotlight" aria-hidden="true"></span>
        <span class="exhibition-item__frame">
          <img src="${thumbnailUrl(album)}" alt="${escapeHtml(album.title)} ジャケット" loading="lazy" decoding="async" width="420" height="420">
        </span>`;
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
  link.href = detailUrl(album, 'archive');
  link.className = 'archive-card';
  link.dataset.albumId = album.id;

  const q = state.query.trim().toLocaleLowerCase('ja');

  const matchedTracks = q
    ? (album.tracks || []).filter(track =>
        String(typeof track === 'string' ? track : (track.title || '')).toLocaleLowerCase('ja').includes(q)
      )
    : [];

 const matchedTracksHtml = matchedTracks.length
  ? `
    <div class="archive-card__matched">
      ${matchedTracks
        .map(track => `
          <div class="archive-card__matched-title">
            ♪ ${escapeHtml(typeof track === 'string' ? track : (track.title || ''))}
          </div>
        `)
        .join('')}
      <div class="archive-card__matched-label">
        MATCHED TRACK
      </div>
    </div>
  `
  : '';

  const isNewest = Boolean(album.release && album.release === newestRelease);
  link.innerHTML = `
    <span class="archive-card__image">
      <img src="${thumbnailUrl(album)}" alt="${escapeHtml(album.title)} ジャケット" loading="lazy" decoding="async" width="420" height="420">
      <span class="archive-card__glint" aria-hidden="true"></span>
      ${isNewest ? '<span class="archive-card__new">NEW EXHIBIT</span>' : ''}
    </span>

    <span class="archive-card__meta">
      <span class="archive-card__catalog">COLLECTION No. ${String(album.artistWorkNumber).padStart(2, '0')}</span>
      <h3>${escapeHtml(album.title)}</h3>
      <p>
        ${workLabel(album)} ·
        ${escapeHtml(releaseLabel(album))} ·
        ${(album.tracks || []).length} TRACKS
      </p>

      ${matchedTracksHtml}
    </span>
  `;

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

  archiveSearch?.addEventListener('input', event => { state.query = event.target.value; renderArchive(); });
  archiveSort?.addEventListener('change', event => { state.sort = event.target.value; renderArchive(); });
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
    if (!('IntersectionObserver' in window) || prefersReducedMotion) {
      $$('.reveal').forEach(element => element.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    }), { threshold: .14 });
    $$('.reveal').forEach(element => observer.observe(element));
  }

  function escapeHtml(value = '') {
    return String(value).replace(/[&<>'"]/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[char]));
  }

  document.addEventListener('click', event => {
    const link = event.target.closest('a[href*="detail.html"]');
    if (!link) return;
    const url = new URL(link.href, location.href);
    const from = url.searchParams.get('from') === 'exhibition' ? 'exhibition' : 'archive';
    try {
      sessionStorage.setItem(RETURN_STATE_KEY, JSON.stringify({
        from,
        albumId: url.searchParams.get('id') || '',
        scrollY: window.scrollY,
        returning: false,
        savedAt: Date.now()
      }));
    } catch (_) {}
  }, true);

  function restoreListPosition() {
    if (!isReturningFromDetail || !returnState) return;
    const targetId = returnState.from === 'exhibition' ? 'exhibition' : 'archive';
    if (location.hash !== `#${targetId}`) history.replaceState(null, '', `#${targetId}`);
    let restored = false;
    const restore = () => {
      if (restored) return;
      const target = returnState.albumId
        ? document.querySelector(`[data-album-id="${CSS.escape(returnState.albumId)}"]`)
        : null;
      if (target) {
        target.scrollIntoView({ block: 'center', inline: 'center', behavior: 'auto' });
      } else {
        window.scrollTo({ top: Number(returnState.scrollY) || 0, left: 0, behavior: 'auto' });
      }
      restored = true;
      try { sessionStorage.removeItem(RETURN_STATE_KEY); } catch (_) {}
    };
    requestAnimationFrame(() => requestAnimationFrame(restore));
    window.addEventListener('load', restore, { once: true });
    window.setTimeout(restore, 450);
  }

  applySiteUrls();
  enablePageTransitions();
  renderExhibition();
  renderArchive();
  restoreListPosition();
})();
