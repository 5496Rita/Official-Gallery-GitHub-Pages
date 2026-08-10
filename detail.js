(async () => {
  'use strict';

  const $ = selector => document.querySelector(selector);
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  const index = albums.findIndex(album => album.id === id);
  const from = params.get('from') === 'exhibition' ? 'exhibition' : 'archive';
  const requestedTrackIndex = Number.parseInt(params.get('track') || '', 10);
  const lyricQuery = String(params.get('lyric') || '').trim();

  const quickBack = $('#quick-back');
  quickBack?.addEventListener('click', () => {
    try {
      const saved = JSON.parse(sessionStorage.getItem('officialGalleryReturnState') || 'null') || {};
      sessionStorage.setItem('officialGalleryReturnState', JSON.stringify({
        ...saved,
        from,
        returning: true,
        savedAt: Date.now()
      }));
    } catch (_) {}
    location.href = `index.html#${from}`;
  });

  const configuredSiteUrl = String(window.SITE_CONFIG?.siteUrl || '').replace(/\/$/, '');
  const siteBase = configuredSiteUrl || `${location.origin}${location.pathname.replace(/[^/]*$/, '')}`.replace(/\/$/, '');
  const absoluteUrl = value => new URL(value, `${siteBase}/`).href;
  const setMeta = (selector, value) => {
    const element = $(selector);
    if (element) element.setAttribute('content', value);
  };
  const setHref = (selector, value) => {
    const element = $(selector);
    if (element) element.setAttribute('href', value);
  };
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function enablePageTransitions() {
    requestAnimationFrame(() => document.body.classList.add('is-ready'));
    document.addEventListener('click', event => {
      const link = event.target.closest('a[href]');
      if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (link.target === '_blank' || link.hasAttribute('download')) return;
      const url = new URL(link.href, location.href);
      if (url.origin !== location.origin) return;
      event.preventDefault();
      document.body.classList.add('is-exiting');
      window.setTimeout(() => { location.href = url.href; }, prefersReducedMotion ? 0 : 180);
    });
  }

  const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  })[char]);

  const escapeRegExp = (value = '') => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const renderHighlightedLyrics = (lyrics, query) => {
    const source = String(lyrics || '');
    if (!query) return escapeHtml(source);
    const pattern = new RegExp(`(${escapeRegExp(query)})`, 'giu');
    return source.split(pattern).map((part, index) =>
      index % 2 ? `<mark class="lyric-search-hit" data-lyric-hit>${escapeHtml(part)}</mark>` : escapeHtml(part)
    ).join('');
  };

  const ordinal = value => {
    const mod100 = value % 100;
    if (mod100 >= 11 && mod100 <= 13) return `${value}th`;
    return `${value}${({ 1: 'st', 2: 'nd', 3: 'rd' })[value % 10] || 'th'}`;
  };

  const normalizeTrack = track => typeof track === 'string'
    ? { title: track, lyrics: '' }
    : { title: String(track?.title || 'Untitled'), lyrics: String(track?.lyrics || '') };

  const toYoutubeEmbedUrl = value => {
    const raw = String(value || '').trim();
    if (!raw) return '';
    if (/^[A-Za-z0-9_-]{11}$/.test(raw)) return `https://www.youtube-nocookie.com/embed/${raw}`;
    try {
      const url = new URL(raw);
      if (url.hostname.includes('youtu.be')) {
        const videoId = url.pathname.split('/').filter(Boolean)[0];
        return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}` : '';
      }
      if (url.hostname.includes('youtube.com') || url.hostname.includes('youtube-nocookie.com')) {
        if (url.pathname.startsWith('/embed/')) {
          const videoId = url.pathname.split('/').filter(Boolean)[1];
          return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}` : '';
        }
        const videoId = url.searchParams.get('v');
        return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}` : '';
      }
    } catch (_) {
      return '';
    }
    return '';
  };

  const parseChapterTime = value => {
    if (Number.isFinite(value)) return Math.max(0, Number(value));
    const raw = String(value ?? '').trim();
    if (!raw) return null;
    if (/^\d+(?::\d{1,2}){1,2}$/.test(raw)) {
      const parts = raw.split(':').map(Number);
      return parts.reduce((seconds, part) => seconds * 60 + part, 0);
    }
    const numeric = Number(raw);
    return Number.isFinite(numeric) ? Math.max(0, numeric) : null;
  };

  const getChapterStarts = album => {
    const source = album.chapterStarts || album.chapters || window.ALBUM_CHAPTERS?.[album.id] || [];
    if (!Array.isArray(source)) return [];
    return source.map(item => {
      if (item && typeof item === 'object') return parseChapterTime(item.start ?? item.time ?? item.seconds);
      return parseChapterTime(item);
    });
  };

  const getAlbumDuration = album => parseChapterTime(
    album.duration || album.fullAlbumDuration || window.ALBUM_DURATIONS?.[album.id]
  );

  const formatClock = seconds => {
    const value = Math.max(0, Math.floor(Number(seconds) || 0));
    const minutes = Math.floor(value / 60);
    const secs = String(value % 60).padStart(2, '0');
    return `${minutes}:${secs}`;
  };

  const counts = new Map();
  const normalized = albums.map(album => {
    const number = (counts.get(album.artist) || 0) + 1;
    counts.set(album.artist, number);
    return { ...album, artistWorkNumber: number };
  });

  if (index < 0) {
    $('#detail-not-found').hidden = false;
    return;
  }

  const album = normalized[index];
  let trackSource = album.tracks || [];
  try {
    const response = await fetch(`lyrics/${encodeURIComponent(album.id)}.json`, { cache: 'force-cache' });
    if (response.ok) {
      const payload = await response.json();
      if (Array.isArray(payload.tracks)) trackSource = payload.tracks;
    }
  } catch (_) {
    // Keep the lightweight title-only track list when lyrics cannot be loaded.
  }
  const tracks = trackSource.map(normalizeTrack);
  const chapterStarts = getChapterStarts(album);
  const albumDuration = getAlbumDuration(album);
  const description = (album.story || []).join(' ') || `${album.title} — ${album.artist}の音楽作品。`;
  const canonicalUrl = `${siteBase}/detail.html?id=${encodeURIComponent(album.id)}`;
  const shareImage = absoluteUrl(album.art);
  document.title = `${album.title} — ${album.artist} Official Gallery`;
  $('#meta-description')?.setAttribute('content', description);
  setMeta('#og-title', document.title);
  setMeta('#og-description', description);
  setMeta('#og-image', shareImage);
  setMeta('#og-url', canonicalUrl);
  setMeta('#twitter-title', document.title);
  setMeta('#twitter-description', description);
  setMeta('#twitter-image', shareImage);
  setHref('#canonical-url', canonicalUrl);

  const structuredData = document.createElement('script');
  structuredData.type = 'application/ld+json';
  structuredData.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'MusicAlbum',
    name: album.title,
    byArtist: { '@type': 'MusicGroup', name: album.artist },
    datePublished: album.release ? album.release.replace(/\./g, '-') : undefined,
    image: shareImage,
    url: canonicalUrl,
    description,
    track: tracks.map((track, position) => ({ '@type': 'MusicRecording', name: track.title, position: position + 1 }))
  });
  document.head.appendChild(structuredData);

  document.body.dataset.accent = album.accent || 'blue';
  $('#detail-main').hidden = false;
  $('#work-cover').src = album.art;
  $('#work-cover').fetchPriority = 'high';
  $('#work-cover').alt = `${album.title} cover`;
  $('#work-kicker').textContent = `${album.artist} · ${ordinal(album.artistWorkNumber)} ALBUM`;
  $('#work-title').textContent = album.title;
  const workReading = $('#work-reading');
  if (workReading) {
    workReading.textContent = album.reading || '';
    workReading.hidden = !album.reading;
  }
  $('#work-release').textContent = album.release ? `RELEASE ${album.release}` : 'RELEASE TBA';
  const storyParagraphs = Array.isArray(album.story)
    ? album.story.filter(Boolean)
    : (album.story ? [String(album.story)] : []);
  const storyHtml = storyParagraphs.map(paragraph => `<p>${escapeHtml(paragraph)}</p>`).join('');
  const storyContainer = $('#work-story');
  storyContainer.innerHTML = storyHtml
    ? `<button class="story-toggle-button" type="button" aria-expanded="false" aria-controls="story-body">物語を読む</button>
       <div id="story-body" class="story-body">${storyHtml}</div>`
    : '';
  const storyButton = storyContainer.querySelector('.story-toggle-button');
  const storyBody = storyContainer.querySelector('.story-body');
  storyButton?.addEventListener('click', () => {
    const expanded = storyButton.getAttribute('aria-expanded') === 'true';
    storyButton.setAttribute('aria-expanded', String(!expanded));
    storyButton.textContent = expanded ? '物語を読む' : '閉じる';
    storyBody?.classList.toggle('is-open', !expanded);
  });

  const renderLyricsBody = (track, highlightQuery = '') => {
    const lyrics = track.lyrics.trim();
    return lyrics
      ? `<div class="track-lyrics" aria-label="${escapeHtml(track.title)} lyrics">${renderHighlightedLyrics(lyrics, highlightQuery)}</div>`
      : `<div class="lyrics-unarchived"><span>LYRICS</span><strong>NOT YET ARCHIVED</strong><p>This manuscript has not yet<br>been added to the archive.</p></div>`;
  };

  const initialTrackIndex = Number.isInteger(requestedTrackIndex) && requestedTrackIndex >= 0 && requestedTrackIndex < tracks.length
    ? requestedTrackIndex
    : 0;

  $('#work-tracks').innerHTML = `
    <div class="lyrics-exhibit">
      <div class="lyrics-exhibit__catalog" aria-label="Track list">
        <ol class="lyrics-exhibit__list" role="tablist" aria-orientation="vertical">
          ${tracks.map((track, i) => {
            const number = String(i + 1).padStart(2, '0');
            return `
              <li>
                <button class="lyrics-exhibit__track${i === initialTrackIndex ? ' is-active' : ''}" type="button" role="tab"
                  id="lyrics-tab-${i}" aria-selected="${i === initialTrackIndex}" aria-controls="lyrics-viewer" data-track-index="${i}">
                  <span class="track-number">${number}</span>
                  <span class="track-title">${escapeHtml(track.title)}</span>
                  <span class="lyrics-exhibit__arrow" aria-hidden="true">→</span>
                </button>
              </li>`;
          }).join('')}
        </ol>
      </div>

      <section class="lyrics-exhibit__viewer" id="lyrics-viewer" role="tabpanel" aria-labelledby="lyrics-tab-${initialTrackIndex}" tabindex="0">
        <header class="lyrics-exhibit__header">
          <p class="lyrics-exhibit__meta">${escapeHtml(album.title)} · TRACK ${String(initialTrackIndex + 1).padStart(2, '0')}</p>
          <div class="lyrics-exhibit__title-row">
            <h3 class="lyrics-exhibit__title">${escapeHtml(tracks[initialTrackIndex]?.title || 'Untitled')}</h3>
            <div class="track-player" id="track-player">
              <button class="track-play-button" id="track-play-button" type="button" data-track-index="${initialTrackIndex}" aria-label="この曲を再生">▶</button>
              <input class="track-seek" id="track-seek" type="range" min="0" max="100" value="0" step="0.1" aria-label="曲の再生位置" />
              <span class="track-time" id="track-time" aria-live="off">0:00 / 0:00</span>
            </div>
          </div>
        </header>
        <div class="lyrics-exhibit__scroll" id="lyrics-scroll">
          ${tracks[initialTrackIndex] ? renderLyricsBody(tracks[initialTrackIndex], lyricQuery) : ''}
        </div>
      </section>
    </div>

    <div class="mobile-lyrics-list" aria-label="歌詞一覧">
      ${tracks.map((track, i) => {
        const number = String(i + 1).padStart(2, '0');
        return `
          <details class="mobile-lyric-toggle"${i === initialTrackIndex && lyricQuery ? ' open' : ''}>
            <summary>
              <span class="track-number">${number}</span>
              <span class="track-title">${escapeHtml(track.title)}</span>
              <span class="mobile-lyric-toggle__action" aria-hidden="true">読む</span>
            </summary>
            <div class="mobile-lyric-toggle__body">
              <div class="mobile-track-player" data-mobile-track-index="${i}">
                <button class="mobile-track-play" type="button" data-track-index="${i}" aria-label="この曲を再生">▶ 再生</button>
                <input class="mobile-track-seek" type="range" min="0" max="100" value="0" step="0.1" data-track-index="${i}" aria-label="曲の再生位置" />
                <span class="mobile-track-time" data-track-index="${i}" aria-live="off">0:00 / 0:00</span>
              </div>
              ${renderLyricsBody(track, i === initialTrackIndex ? lyricQuery : '')}
            </div>
          </details>`;
      }).join('')}
    </div>`;

  const trackButtons = [...document.querySelectorAll('.lyrics-exhibit__track')];
  const viewer = $('#lyrics-viewer');
  const viewerTitle = viewer?.querySelector('.lyrics-exhibit__title');
  const viewerMeta = viewer?.querySelector('.lyrics-exhibit__meta');
  const viewerScroll = $('#lyrics-scroll');
  const trackPlayButton = $('#track-play-button');
  const trackSeek = $('#track-seek');
  const trackTime = $('#track-time');
  const mobilePlayButtons = [...document.querySelectorAll('.mobile-track-play')];
  const mobileSeekBars = [...document.querySelectorAll('.mobile-track-seek')];
  const mobileTimeLabels = [...document.querySelectorAll('.mobile-track-time')];

  const focusLyricHit = (root, smooth = true) => {
    const hit = root?.querySelector?.('[data-lyric-hit]');
    if (!hit) return;
    hit.classList.add('is-arrival-highlight');
    hit.scrollIntoView({ behavior: smooth && !prefersReducedMotion ? 'smooth' : 'auto', block: 'center' });
    window.setTimeout(() => hit.classList.remove('is-arrival-highlight'), 2400);
  };

  const selectTrack = (index, highlightQuery = '') => {
    const track = tracks[index];
    if (!track || !viewer || !viewerScroll || !viewerTitle || !viewerMeta) return;

    trackButtons.forEach((button, buttonIndex) => {
      const active = buttonIndex === index;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-selected', String(active));
      button.tabIndex = active ? 0 : -1;
    });

    viewer.setAttribute('aria-labelledby', `lyrics-tab-${index}`);
    viewerMeta.textContent = `${album.title} · TRACK ${String(index + 1).padStart(2, '0')}`;
    viewerTitle.textContent = track.title;
    if (trackPlayButton) {
      trackPlayButton.dataset.trackIndex = String(index);
      const hasChapter = Number.isFinite(chapterStarts[index]);
      trackPlayButton.disabled = !hasChapter || !embedUrl;
      trackPlayButton.title = hasChapter ? 'FULL ALBUMのこの曲を再生 / 一時停止' : 'チャプター開始時刻を設定すると再生できます';
    }
    updateTrackControls(index, true);
    viewerScroll.innerHTML = renderLyricsBody(track, highlightQuery);
    viewerScroll.scrollTop = 0;
    if (highlightQuery) requestAnimationFrame(() => focusLyricHit(viewerScroll));

    if (!prefersReducedMotion) {
      viewer.classList.remove('is-changing');
      void viewer.offsetWidth;
      viewer.classList.add('is-changing');
    }
  };

  if (lyricQuery) {
    requestAnimationFrame(() => {
      if (window.matchMedia('(max-width: 760px)').matches) {
        const mobileDetails = document.querySelectorAll('.mobile-lyric-toggle')[initialTrackIndex];
        if (mobileDetails) {
          mobileDetails.open = true;
          focusLyricHit(mobileDetails);
        }
      } else {
        selectTrack(initialTrackIndex, lyricQuery);
        viewer?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'center' });
      }
    });
  }

  $('#work-tracks').addEventListener('click', event => {
    const button = event.target.closest('.lyrics-exhibit__track');
    if (!button) return;
    selectTrack(Number(button.dataset.trackIndex));
  });

  $('#work-tracks').addEventListener('keydown', event => {
    const current = event.target.closest('.lyrics-exhibit__track');
    if (!current || !['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const currentIndex = Number(current.dataset.trackIndex);
    const nextIndex = event.key === 'Home' ? 0
      : event.key === 'End' ? trackButtons.length - 1
      : event.key === 'ArrowDown' ? (currentIndex + 1) % trackButtons.length
      : (currentIndex - 1 + trackButtons.length) % trackButtons.length;
    trackButtons[nextIndex]?.focus();
    selectTrack(nextIndex);
  });

  const labels = { spotify: 'SPOTIFY', apple: 'APPLE MUSIC', amazon: 'AMAZON MUSIC', youtube: 'YOUTUBE' };
  const allowedServices = ['spotify', 'apple', 'amazon', 'youtube'];
  const links = allowedServices.map(key => [key, album.links?.[key]]).filter(([, url]) => Boolean(url));
  $('#work-links').innerHTML = links.length
    ? links.map(([key, url]) => `
      <a class="listen-service listen-service--${key}" href="${escapeHtml(url)}" target="_blank" rel="noopener">
        <span>${labels[key]}</span><b aria-hidden="true">↗</b>
      </a>`).join('')
    : '<p class="listen-now__empty">配信リンクは準備中です。</p>';

  const fullAlbumSource = album.youtubeId || album.fullAlbumYoutube || album.youtubeFullAlbum || '';
  const embedUrl = toYoutubeEmbedUrl(fullAlbumSource);
  let fullAlbumPlayer = null;
  let playerReadyPromise = null;
  let activeTrackIndex = initialTrackIndex;
  let playerTimer = 0;
  let isSeeking = false;
  let playerIsReady = false;
  const playerOrigin = location.origin && location.origin !== 'null' ? `&origin=${encodeURIComponent(location.origin)}` : '';
  $('#work-xfd').innerHTML = embedUrl
    ? `<iframe id="full-album-player" src="${escapeHtml(embedUrl)}?enablejsapi=1&playsinline=1${playerOrigin}" title="${escapeHtml(album.title)} Full Album" loading="eager" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`
    : '<div class="full-album-placeholder"><span>COMING SOON</span><p>THE FULL ALBUM FILM<br>HAS NOT YET ENTERED THE ARCHIVE.</p></div>';

  const chapterBounds = trackIndex => {
    const start = chapterStarts[trackIndex];
    if (!Number.isFinite(start)) return null;
    let end = chapterStarts[trackIndex + 1];
    if (!Number.isFinite(end)) end = albumDuration;
    if (!Number.isFinite(end) || end <= start) end = start + 1;
    return { start, end, duration: end - start };
  };

  const updateTrackControls = (trackIndex, reset = false) => {
    activeTrackIndex = trackIndex;
    const bounds = chapterBounds(trackIndex);
    const enabled = Boolean(bounds && embedUrl);
    if (trackSeek) {
      trackSeek.disabled = !enabled;
      trackSeek.min = '0';
      trackSeek.max = bounds ? String(bounds.duration) : '1';
      if (reset) trackSeek.value = '0';
    }
    if (trackTime) {
      const current = reset ? 0 : Number(trackSeek?.value || 0);
      trackTime.textContent = bounds ? `${formatClock(current)} / ${formatClock(bounds.duration)}` : '— / —';
    }
    if (trackPlayButton) {
      trackPlayButton.disabled = !enabled;
      if (reset) {
        trackPlayButton.textContent = '▶';
        trackPlayButton.setAttribute('aria-label', 'この曲を再生');
      }
    }
    mobilePlayButtons.forEach(button => {
      const index = Number(button.dataset.trackIndex);
      const mobileBounds = chapterBounds(index);
      button.disabled = !(mobileBounds && embedUrl);
      if (reset || index !== trackIndex) {
        button.textContent = '▶ 再生';
        button.setAttribute('aria-label', 'この曲を再生');
      }
    });
    mobileSeekBars.forEach(seek => {
      const index = Number(seek.dataset.trackIndex);
      const mobileBounds = chapterBounds(index);
      seek.disabled = !(mobileBounds && embedUrl);
      seek.min = '0';
      seek.max = mobileBounds ? String(mobileBounds.duration) : '1';
      if (reset && index === trackIndex) seek.value = '0';
    });
    mobileTimeLabels.forEach(label => {
      const index = Number(label.dataset.trackIndex);
      const mobileBounds = chapterBounds(index);
      const mobileSeek = mobileSeekBars.find(seek => Number(seek.dataset.trackIndex) === index);
      const current = reset && index === trackIndex ? 0 : Number(mobileSeek?.value || 0);
      label.textContent = mobileBounds ? `${formatClock(current)} / ${formatClock(mobileBounds.duration)}` : '— / —';
    });
  };

  const ensureYoutubeApi = () => new Promise(resolve => {
    if (window.YT?.Player) return resolve();
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      try { if (typeof previous === 'function') previous(); } catch (_) {}
      resolve();
    };
    if (!document.querySelector('script[data-youtube-iframe-api]')) {
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.async = true;
      script.dataset.youtubeIframeApi = 'true';
      document.head.appendChild(script);
    }
  });

  const syncTrackProgress = () => {
    window.clearTimeout(playerTimer);
    if (!fullAlbumPlayer || !window.YT?.PlayerState) return;
    try {
      const state = fullAlbumPlayer.getPlayerState();
      const current = Number(fullAlbumPlayer.getCurrentTime?.());
      const bounds = chapterBounds(activeTrackIndex);
      if (bounds && Number.isFinite(current) && !isSeeking) {
        const relative = Math.max(0, Math.min(bounds.duration, current - bounds.start));
        if (trackSeek) trackSeek.value = String(relative);
        if (trackTime) trackTime.textContent = `${formatClock(relative)} / ${formatClock(bounds.duration)}`;
        const mobileSeek = mobileSeekBars.find(seek => Number(seek.dataset.trackIndex) === activeTrackIndex);
        const mobileTime = mobileTimeLabels.find(label => Number(label.dataset.trackIndex) === activeTrackIndex);
        if (mobileSeek) mobileSeek.value = String(relative);
        if (mobileTime) mobileTime.textContent = `${formatClock(relative)} / ${formatClock(bounds.duration)}`;
        if (current >= bounds.end - 0.15 && state === YT.PlayerState.PLAYING) {
          fullAlbumPlayer.pauseVideo();
          trackPlayButton && (trackPlayButton.textContent = '▶');
        }
      }
      if (trackPlayButton) {
        const playing = state === YT.PlayerState.PLAYING;
        trackPlayButton.textContent = playing ? '❚❚' : '▶';
        trackPlayButton.setAttribute('aria-label', playing ? '一時停止' : 'この曲を再生');
      }
      mobilePlayButtons.forEach(button => {
        const index = Number(button.dataset.trackIndex);
        const playing = index === activeTrackIndex && state === YT.PlayerState.PLAYING;
        button.textContent = playing ? '❚❚ 一時停止' : '▶ 再生';
        button.setAttribute('aria-label', playing ? '一時停止' : 'この曲を再生');
      });
    } catch (_) {}
    playerTimer = window.setTimeout(syncTrackProgress, 250);
  };

  const ensurePlayer = async () => {
    if (fullAlbumPlayer) return fullAlbumPlayer;
    if (playerReadyPromise) return playerReadyPromise;
    playerReadyPromise = (async () => {
      await ensureYoutubeApi();
      return new Promise((resolve, reject) => {
        try {
          fullAlbumPlayer = new YT.Player('full-album-player', {
            events: {
              onReady: event => {
                playerIsReady = true;
                syncTrackProgress();
                resolve(event.target);
              },
              onStateChange: () => syncTrackProgress(),
              onError: reject
            }
          });
        } catch (error) { reject(error); }
      });
    })();
    return playerReadyPromise;
  };

  const playTrackChapterReady = trackIndex => {
    const bounds = chapterBounds(trackIndex);
    if (!bounds || !embedUrl || !fullAlbumPlayer || !playerIsReady) return false;
    activeTrackIndex = trackIndex;
    try {
      const player = fullAlbumPlayer;
      const state = player.getPlayerState?.();
      const current = Number(player.getCurrentTime?.());
      const insideChapter = Number.isFinite(current) && current >= bounds.start && current < bounds.end;
      if (insideChapter && state === YT.PlayerState.PLAYING) {
        player.pauseVideo();
        return true;
      }
      if (!insideChapter) {
        const mobileSeek = mobileSeekBars.find(seek => Number(seek.dataset.trackIndex) === trackIndex);
        const relative = window.matchMedia('(max-width: 760px)').matches
          ? Number(mobileSeek?.value || 0)
          : Number(trackSeek?.value || 0);
        player.seekTo(bounds.start + relative, true);
      }
      player.playVideo();
      return true;
    } catch (_) {
      return false;
    }
  };

  const playTrackChapter = async trackIndex => {
    const bounds = chapterBounds(trackIndex);
    if (!bounds || !embedUrl) return;
    if (playTrackChapterReady(trackIndex)) return;
    activeTrackIndex = trackIndex;
    try {
      const player = await ensurePlayer();
      const state = player.getPlayerState?.();
      const current = Number(player.getCurrentTime?.());
      const insideChapter = Number.isFinite(current) && current >= bounds.start && current < bounds.end;
      if (insideChapter && state === YT.PlayerState.PLAYING) {
        player.pauseVideo();
        return;
      }
      if (!insideChapter) {
        const mobileSeek = mobileSeekBars.find(seek => Number(seek.dataset.trackIndex) === trackIndex);
        const relative = window.matchMedia('(max-width: 760px)').matches
          ? Number(mobileSeek?.value || 0)
          : Number(trackSeek?.value || 0);
        player.seekTo(bounds.start + relative, true);
      }
      player.playVideo();
    } catch (_) {
      const frame = $('#full-album-player');
      if (!frame) return;
      const separator = embedUrl.includes('?') ? '&' : '?';
      frame.src = `${embedUrl}${separator}start=${Math.floor(bounds.start)}&autoplay=1&playsinline=1`;
    }
  };

  if (trackPlayButton) {
    trackPlayButton.addEventListener('click', () => { const index = Number(trackPlayButton.dataset.trackIndex); if (!playTrackChapterReady(index)) playTrackChapter(index); });
  }

  if (trackSeek) {
    const previewSeek = () => {
      const bounds = chapterBounds(activeTrackIndex);
      if (!bounds) return;
      const relative = Number(trackSeek.value || 0);
      if (trackTime) trackTime.textContent = `${formatClock(relative)} / ${formatClock(bounds.duration)}`;
    };
    trackSeek.addEventListener('pointerdown', () => { isSeeking = true; });
    trackSeek.addEventListener('input', previewSeek);
    trackSeek.addEventListener('change', async () => {
      const bounds = chapterBounds(activeTrackIndex);
      if (!bounds) return;
      const relative = Math.max(0, Math.min(bounds.duration, Number(trackSeek.value || 0)));
      try {
        const player = await ensurePlayer();
        player.seekTo(bounds.start + relative, true);
      } catch (_) {}
      isSeeking = false;
      previewSeek();
    });
    trackSeek.addEventListener('pointerup', () => { isSeeking = false; });
  }

  mobilePlayButtons.forEach(button => {
    button.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      const index = Number(button.dataset.trackIndex);
      activeTrackIndex = index;
      if (!playTrackChapterReady(index)) playTrackChapter(index);
    });
  });

  mobileSeekBars.forEach(seek => {
    const index = Number(seek.dataset.trackIndex);
    const preview = () => {
      const bounds = chapterBounds(index);
      if (!bounds) return;
      const relative = Number(seek.value || 0);
      const label = mobileTimeLabels.find(item => Number(item.dataset.trackIndex) === index);
      if (label) label.textContent = `${formatClock(relative)} / ${formatClock(bounds.duration)}`;
    };
    seek.addEventListener('pointerdown', event => { event.stopPropagation(); isSeeking = true; activeTrackIndex = index; });
    seek.addEventListener('touchstart', event => { event.stopPropagation(); isSeeking = true; activeTrackIndex = index; }, { passive: true });
    seek.addEventListener('input', event => { event.stopPropagation(); preview(); });
    seek.addEventListener('change', async event => {
      event.stopPropagation();
      const bounds = chapterBounds(index);
      if (!bounds) return;
      const relative = Math.max(0, Math.min(bounds.duration, Number(seek.value || 0)));
      activeTrackIndex = index;
      try {
        const player = await ensurePlayer();
        player.seekTo(bounds.start + relative, true);
      } catch (_) {}
      isSeeking = false;
      preview();
    });
    seek.addEventListener('pointerup', event => { event.stopPropagation(); isSeeking = false; });
    seek.addEventListener('touchend', event => { event.stopPropagation(); isSeeking = false; }, { passive: true });
  });

  updateTrackControls(initialTrackIndex, true);
  // Pre-initialize the YouTube IFrame API so mobile taps can call playVideo()
  // synchronously inside the user gesture instead of after awaiting API loading.
  if (embedUrl) ensurePlayer().catch(() => {});

  const prev = normalized[(index - 1 + normalized.length) % normalized.length];
  const next = normalized[(index + 1) % normalized.length];
  $('#work-prev').href = `detail.html?id=${encodeURIComponent(prev.id)}`;
  $('#work-prev span').textContent = prev.title;
  $('#work-next').href = `detail.html?id=${encodeURIComponent(next.id)}`;
  $('#work-next span').textContent = next.title;
  enablePageTransitions();
})();
