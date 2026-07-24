(() => {
  'use strict';

  const $ = selector => document.querySelector(selector);
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  const index = albums.findIndex(album => album.id === id);

  const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  })[char]);

  const ordinal = value => {
    const mod100 = value % 100;
    if (mod100 >= 11 && mod100 <= 13) return `${value}th`;
    return `${value}${({ 1: 'st', 2: 'nd', 3: 'rd' })[value % 10] || 'th'}`;
  };

  const toYoutubeEmbedUrl = value => {
    if (!value) return '';
    try {
      const url = new URL(value);
      if (url.hostname.includes('youtu.be')) {
        return `https://www.youtube.com/embed/${url.pathname.slice(1)}`;
      }
      if (url.hostname.includes('youtube.com')) {
        if (url.pathname.startsWith('/embed/')) return value;
        const videoId = url.searchParams.get('v');
        if (videoId) return `https://www.youtube.com/embed/${videoId}`;
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
  document.title = `${album.title} — 越黒リタ Official Gallery`;
  document.body.dataset.accent = album.accent || 'blue';
  $('#detail-main').hidden = false;
  $('#work-cover').src = album.art;
  $('#work-cover').alt = `${album.title} cover`;
  $('#work-kicker').textContent = `${album.artist} · ${ordinal(album.artistWorkNumber)} ALBUM`;
  $('#work-title').textContent = album.title;
  $('#work-release').textContent = album.release ? `RELEASE ${album.release}` : 'RELEASE TBA';

  $('#work-tracks').innerHTML = (album.tracks || []).map((track, i) => `
    <li>
      <span class="track-number">${String(i + 1).padStart(2, '0')}</span>
      <span class="track-title">${escapeHtml(track)}</span>
    </li>`).join('');

  const labels = {
    spotify: 'SPOTIFY',
    apple: 'APPLE MUSIC',
    amazon: 'AMAZON MUSIC'
  };
  const allowedServices = ['spotify', 'apple', 'amazon'];
  const links = allowedServices
    .map(key => [key, album.links?.[key]])
    .filter(([, url]) => Boolean(url));

  $('#work-links').innerHTML = links.length
    ? links.map(([key, url]) => `
      <a class="listen-service listen-service--${key}" href="${escapeHtml(url)}" target="_blank" rel="noopener">
        <span>${labels[key]}</span><b aria-hidden="true">↗</b>
      </a>`).join('')
    : '<p class="listen-now__empty">配信リンクは準備中です。</p>';

  const xfdUrl = album.xfd || album.youtubeXfd || '';
  const embedUrl = toYoutubeEmbedUrl(xfdUrl);
  $('#work-xfd').innerHTML = embedUrl
    ? `<iframe src="${escapeHtml(embedUrl)}" title="${escapeHtml(album.title)} XFD" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`
    : '<div class="xfd-placeholder"><span>XFD</span><p>クロスフェード動画は準備中です。</p></div>';

  const prev = normalized[(index - 1 + normalized.length) % normalized.length];
  const next = normalized[(index + 1) % normalized.length];
  $('#work-prev').href = `detail.html?id=${encodeURIComponent(prev.id)}`;
  $('#work-prev span').textContent = prev.title;
  $('#work-next').href = `detail.html?id=${encodeURIComponent(next.id)}`;
  $('#work-next span').textContent = next.title;
})();
