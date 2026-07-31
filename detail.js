(async () => {
  'use strict';

  const $ = selector => document.querySelector(selector);
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  const index = albums.findIndex(album => album.id === id);

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
  $('#work-release').textContent = album.release ? `RELEASE ${album.release}` : 'RELEASE TBA';
  $('#work-story').innerHTML = (album.story || []).map(paragraph => `<p>${escapeHtml(paragraph)}</p>`).join('');

  const renderLyricsBody = track => {
    const lyrics = track.lyrics.trim();
    return lyrics
      ? `<div class="track-lyrics" aria-label="${escapeHtml(track.title)} lyrics">${escapeHtml(lyrics)}</div>`
      : `<div class="lyrics-unarchived"><span>LYRICS</span><strong>NOT YET ARCHIVED</strong><p>This manuscript has not yet<br>been added to the archive.</p></div>`;
  };

  $('#work-tracks').innerHTML = `
    <div class="lyrics-exhibit">
      <div class="lyrics-exhibit__catalog" aria-label="Track list">
        <ol class="lyrics-exhibit__list" role="tablist" aria-orientation="vertical">
          ${tracks.map((track, i) => {
            const number = String(i + 1).padStart(2, '0');
            return `
              <li>
                <button class="lyrics-exhibit__track${i === 0 ? ' is-active' : ''}" type="button" role="tab"
                  id="lyrics-tab-${i}" aria-selected="${i === 0}" aria-controls="lyrics-viewer" data-track-index="${i}">
                  <span class="track-number">${number}</span>
                  <span class="track-title">${escapeHtml(track.title)}</span>
                  <span class="lyrics-exhibit__arrow" aria-hidden="true">→</span>
                </button>
              </li>`;
          }).join('')}
        </ol>
      </div>

      <section class="lyrics-exhibit__viewer" id="lyrics-viewer" role="tabpanel" aria-labelledby="lyrics-tab-0" tabindex="0">
        <header class="lyrics-exhibit__header">
          <p class="lyrics-exhibit__meta">${escapeHtml(album.title)} · TRACK 01</p>
          <h3 class="lyrics-exhibit__title">${escapeHtml(tracks[0]?.title || 'Untitled')}</h3>
        </header>
        <div class="lyrics-exhibit__scroll" id="lyrics-scroll">
          ${tracks[0] ? renderLyricsBody(tracks[0]) : ''}
        </div>
      </section>
    </div>`;

  const trackButtons = [...document.querySelectorAll('.lyrics-exhibit__track')];
  const viewer = $('#lyrics-viewer');
  const viewerTitle = viewer?.querySelector('.lyrics-exhibit__title');
  const viewerMeta = viewer?.querySelector('.lyrics-exhibit__meta');
  const viewerScroll = $('#lyrics-scroll');

  const selectTrack = index => {
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
    viewerScroll.innerHTML = renderLyricsBody(track);
    viewerScroll.scrollTop = 0;

    if (!prefersReducedMotion) {
      viewer.classList.remove('is-changing');
      void viewer.offsetWidth;
      viewer.classList.add('is-changing');
    }
  };

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
  $('#work-xfd').innerHTML = embedUrl
    ? `<iframe src="${escapeHtml(embedUrl)}" title="${escapeHtml(album.title)} Full Album" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`
    : '<div class="full-album-placeholder"><span>COMING SOON</span><p>THE FULL ALBUM FILM<br>HAS NOT YET ENTERED THE ARCHIVE.</p></div>';

  const prev = normalized[(index - 1 + normalized.length) % normalized.length];
  const next = normalized[(index + 1) % normalized.length];
  $('#work-prev').href = `detail.html?id=${encodeURIComponent(prev.id)}`;
  $('#work-prev span').textContent = prev.title;
  $('#work-next').href = `detail.html?id=${encodeURIComponent(next.id)}`;
  $('#work-next span').textContent = next.title;
  enablePageTransitions();
})();
