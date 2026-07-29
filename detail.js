(() => {
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
  const tracks = (album.tracks || []).map(normalizeTrack);
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

  $('#work-tracks').innerHTML = tracks.map((track, i) => {
    const number = String(i + 1).padStart(2, '0');
    const lyrics = track.lyrics.trim();
    const body = lyrics
      ? `<div class="track-lyrics" aria-label="${escapeHtml(track.title)} lyrics">${escapeHtml(lyrics)}</div>`
      : `<div class="lyrics-unarchived"><span>LYRICS</span><strong>NOT YET ARCHIVED</strong><p>This manuscript has not yet<br>been added to the archive.</p></div>`;
    return `
      <li class="track-accordion">
        <button class="track-accordion__toggle" type="button" aria-expanded="false" aria-controls="track-panel-${i}" id="track-toggle-${i}">
          <span class="track-number">${number}</span>
          <span class="track-title">${escapeHtml(track.title)}</span>
          <span class="track-toggle-mark" aria-hidden="true"></span>
        </button>
        <div class="track-accordion__panel" id="track-panel-${i}" role="region" aria-labelledby="track-toggle-${i}" hidden>
          <div class="track-accordion__inner">${body}</div>
        </div>
      </li>`;
  }).join('');

  $('#work-tracks').addEventListener('click', event => {
    const button = event.target.closest('.track-accordion__toggle');
    if (!button) return;
    const panel = document.getElementById(button.getAttribute('aria-controls'));
    const expanded = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!expanded));
    button.closest('.track-accordion')?.classList.toggle('is-open', !expanded);
    if (prefersReducedMotion) {
      panel.hidden = expanded;
      return;
    }
    if (!expanded) {
      panel.hidden = false;
      panel.style.height = '0px';
      requestAnimationFrame(() => { panel.style.height = `${panel.scrollHeight}px`; });
      panel.addEventListener('transitionend', () => { panel.style.height = 'auto'; }, { once: true });
    } else {
      panel.style.height = `${panel.scrollHeight}px`;
      requestAnimationFrame(() => { panel.style.height = '0px'; });
      panel.addEventListener('transitionend', () => {
        panel.hidden = true;
        panel.style.height = '';
      }, { once: true });
    }
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
