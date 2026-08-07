(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const state = { view: 'grid', query: '', sort: 'added', artist: 'all', searchMode: 'songs', lyricsReady: false };
  const lyricsIndex = new Map();
  let lyricsLoadPromise = null;
  let searchTimer = 0;
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
  const archiveSearchLabel = $('#archive-search-label');
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

  function loadYouTubePlayerApi() {
    if (window.YT?.Player) return Promise.resolve(window.YT);
    if (window.__officialGalleryYouTubeApiPromise) return window.__officialGalleryYouTubeApiPromise;

    window.__officialGalleryYouTubeApiPromise = new Promise((resolve, reject) => {
      const previousReady = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (typeof previousReady === 'function') previousReady();
        resolve(window.YT);
      };

      const existing = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
      if (!existing) {
        const script = document.createElement('script');
        script.src = 'https://www.youtube.com/iframe_api';
        script.async = true;
        script.addEventListener('error', () => reject(new Error('YouTube Player API failed to load.')), { once: true });
        document.head.appendChild(script);
      }

      window.setTimeout(() => {
        if (window.YT?.Player) resolve(window.YT);
      }, 3000);
    });

    return window.__officialGalleryYouTubeApiPromise;
  }

  async function initFeaturedShort() {
    const section = document.getElementById('featured-short');
    const playerWrap = document.getElementById('featured-short-player');
    const soundButton = document.getElementById('featured-short-sound');
    const nextButton = document.getElementById('featured-short-next');
    if (!section || !playerWrap || !soundButton || !nextButton) return;

    try {
      const response = await fetch('data/shorts.json', { cache: 'no-store' });
      if (!response.ok) throw new Error(`Shorts data request failed: ${response.status}`);

      const data = await response.json();
      const rawShorts = Array.isArray(data) ? data : (Array.isArray(data?.items) ? data.items : []);
      const shorts = rawShorts.filter(item => item?.id);
      if (shorts.length === 0) return;

      section.hidden = false;
      requestAnimationFrame(() => section.classList.add('is-ready'));

      await loadYouTubePlayerApi();

      let currentIndex = Math.floor(Math.random() * shorts.length);
      let isMuted = true;
      let player;

      const updateSoundButton = () => {
        soundButton.setAttribute('aria-pressed', String(!isMuted));
        soundButton.setAttribute('aria-label', isMuted ? 'サウンドをオン' : 'サウンドをオフ');
        soundButton.setAttribute('title', isMuted ? 'サウンドをオン' : 'サウンドをオフ');
        soundButton.innerHTML = isMuted
          ? '<span aria-hidden="true">🔇</span>'
          : '<span aria-hidden="true">🔊</span>';
      };

      const playNext = () => {
        if (!player || shorts.length < 1) return;
        let nextIndex = currentIndex;
        if (shorts.length > 1) {
          while (nextIndex === currentIndex) nextIndex = Math.floor(Math.random() * shorts.length);
        }
        currentIndex = nextIndex;
        const next = shorts[currentIndex];
        player.loadVideoById(next.id);
        if (isMuted) player.mute(); else player.unMute();
        player.playVideo();
      };

      player = new window.YT.Player(playerWrap, {
        videoId: shorts[currentIndex].id,
        playerVars: {
          autoplay: 1,
          mute: 1,
          playsinline: 1,
          rel: 0,
          controls: 1,
          modestbranding: 1,
          origin: window.location.origin
        },
        events: {
          onReady: event => {
            event.target.mute();
            event.target.playVideo();
            soundButton.disabled = false;
            nextButton.disabled = false;
            updateSoundButton();
            section.hidden = false;
            requestAnimationFrame(() => section.classList.add('is-ready'));
          },
          onStateChange: event => {
            if (event.data === window.YT.PlayerState.ENDED) {
              event.target.seekTo(0, true);
              event.target.playVideo();
            }
          },
          onError: () => playNext()
        }
      });

      soundButton.addEventListener('click', () => {
        if (!player || typeof player.isMuted !== 'function') return;

        const currentlyMuted = player.isMuted();
        if (currentlyMuted) {
          player.unMute();
          player.setVolume?.(100);
          isMuted = false;
        } else {
          player.mute();
          isMuted = true;
        }

        player.playVideo();
        updateSoundButton();

        // Mobile browsers can apply the audio state a beat after the user gesture.
        window.setTimeout(() => {
          if (!player || typeof player.isMuted !== 'function') return;
          isMuted = player.isMuted();
          updateSoundButton();
        }, 120);
      });

      nextButton.addEventListener('click', playNext);
    } catch (error) {
      console.warn('Featured Short could not be loaded.', error);
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

  function normalizeSearchText(value = '') {
    return String(value).normalize('NFKC').toLocaleLowerCase('ja');
  }

  function getTrackTitle(track) {
    return typeof track === 'string' ? track : (track?.title || track?.name || '');
  }

  async function ensureLyricsIndex() {
    if (state.lyricsReady) return;
    if (lyricsLoadPromise) return lyricsLoadPromise;

    lyricsLoadPromise = Promise.allSettled(normalizedAlbums.map(async album => {
      const response = await fetch(`lyrics/${encodeURIComponent(album.id)}.json`, { cache: 'force-cache' });
      if (!response.ok) return;
      const data = await response.json();
      const tracks = Array.isArray(data?.tracks) ? data.tracks : [];
      lyricsIndex.set(album.id, tracks.map((track, trackIndex) => ({
        trackIndex,
        title: String(track?.title || ''),
        lyrics: String(track?.lyrics || ''),
        searchTitle: normalizeSearchText(track?.title || ''),
        searchLyrics: normalizeSearchText(track?.lyrics || '')
      })));
    }));

    await lyricsLoadPromise;
    state.lyricsReady = true;
  }

  function albumMatchesQuery(album, q) {
    if (state.searchMode === 'lyrics') {
      return (lyricsIndex.get(album.id) || []).some(track => track.searchLyrics.includes(q));
    }

    const trackText = (album.tracks || []).map(getTrackTitle).join(' ');
    const tagText = [
      ...(Array.isArray(album.tags) ? album.tags : []),
      ...(Array.isArray(album.genres) ? album.genres : []),
      album.genre || '',
      album.category || ''
    ].join(' ');
    return normalizeSearchText([album.title, trackText, tagText].join(' ')).includes(q);
  }

  function getFilteredAlbums() {
    const q = normalizeSearchText(state.query.trim());
    let items = normalizedAlbums.filter(album => {
      if (state.artist !== 'all' && album.artist !== state.artist) return false;
      if (!q) return true;
      return albumMatchesQuery(album, q);
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

  function excerptAroundMatch(text, query, radius = 42) {
    const source = String(text || '').replace(/\s+/g, ' ').trim();
    if (!source) return '';
    const normalized = normalizeSearchText(source);
    const index = normalized.indexOf(query);
    if (index < 0) return source.slice(0, radius * 2);
    const from = Math.max(0, index - radius);
    const to = Math.min(source.length, index + query.length + radius);
    return `${from > 0 ? '…' : ''}${source.slice(from, to)}${to < source.length ? '…' : ''}`;
  }

  function escapeRegExp(value = '') {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function highlightSearchMatch(text, query) {
    const source = String(text || '');
    const rawQuery = String(query || '').trim();
    if (!rawQuery) return escapeHtml(source);
    const pattern = new RegExp(`(${escapeRegExp(rawQuery)})`, 'giu');
    return source.split(pattern).map((part, index) =>
      index % 2 ? `<mark class="search-hit-mark">${escapeHtml(part)}</mark>` : escapeHtml(part)
    ).join('');
  }

  function createArchiveCard(album) {
    const link = document.createElement('a');
    link.className = 'archive-card';
    link.dataset.albumId = album.id;

    const q = normalizeSearchText(state.query.trim());
    const titleMatches = q && state.searchMode === 'songs'
      ? (album.tracks || []).filter(track => normalizeSearchText(getTrackTitle(track)).includes(q))
      : [];
    const lyricMatches = q && state.searchMode === 'lyrics'
      ? (lyricsIndex.get(album.id) || []).filter(track => track.searchLyrics.includes(q)).slice(0, 3)
      : [];

    if (state.searchMode === 'lyrics' && lyricMatches.length) {
      const target = lyricMatches[0];
      const url = new URL(detailUrl(album, 'archive'), location.href);
      url.searchParams.set('track', String(target.trackIndex));
      url.searchParams.set('lyric', state.query.trim());
      link.href = `${url.pathname.split('/').pop()}${url.search}${url.hash}`;
      link.setAttribute('aria-label', `${album.title}「${target.title}」の一致した歌詞を開く`);
    } else {
      link.href = detailUrl(album, 'archive');
    }

    const lyricMatchHtml = lyricMatches.map(track => `
      <div class="archive-card__lyric-hit">
        <div class="archive-card__matched-title">♪ ${escapeHtml(track.title)}</div>
        ${track.searchLyrics.includes(q)
          ? `<div class="archive-card__lyric-excerpt">${highlightSearchMatch(excerptAroundMatch(track.lyrics, q), state.query.trim())}</div>`
          : ''}
      </div>`).join('');

    const titleOnlyMatches = titleMatches.filter(track => {
      const title = getTrackTitle(track);
      return !lyricMatches.some(match => match.title === title);
    });

    const matchedHtml = q && (titleOnlyMatches.length || lyricMatches.length)
      ? `
        <div class="archive-card__matched">
          ${titleOnlyMatches.map(track => `
            <div class="archive-card__matched-title">♪ ${escapeHtml(getTrackTitle(track))}</div>`).join('')}
          ${lyricMatchHtml}
          <div class="archive-card__matched-label">${state.searchMode === 'lyrics' ? 'LYRICS MATCH' : 'SONG MATCH'}</div>
        </div>`
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
        ${matchedHtml}
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

  archiveSearch?.addEventListener('input', event => {
    state.query = event.target.value;
    window.clearTimeout(searchTimer);
    if (state.searchMode === 'songs') {
      renderArchive();
      return;
    }
    if (!state.query.trim()) {
      renderArchive();
      return;
    }
    searchTimer = window.setTimeout(async () => {
      await ensureLyricsIndex();
      renderArchive();
    }, 160);
  });

  $$('.search-mode-tabs button').forEach(button => button.addEventListener('click', async () => {
    state.searchMode = button.dataset.searchMode === 'lyrics' ? 'lyrics' : 'songs';
    state.query = '';
    if (archiveSearch) {
      archiveSearch.value = '';
      archiveSearch.placeholder = state.searchMode === 'lyrics'
        ? '歌詞の一節を検索'
        : '曲名・アルバムを検索';
    }
    if (archiveSearchLabel) {
      archiveSearchLabel.textContent = state.searchMode === 'lyrics'
        ? '歌詞検索'
        : '曲名・アルバム検索';
    }
    $$('.search-mode-tabs button').forEach(item => {
      const active = item === button;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-selected', String(active));
    });
    if (state.searchMode === 'lyrics') await ensureLyricsIndex();
    renderArchive();
    archiveSearch?.focus();
  }));
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
