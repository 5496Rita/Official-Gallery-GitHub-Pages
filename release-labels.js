(() => {
  const JST_OFFSET = "+09:00";

  function parseRelease(value) {
    if (!value || typeof value !== "string") return null;
    const m = value.trim().match(/^(\d{4})[.\/-](\d{1,2})[.\/-](\d{1,2})$/);
    if (!m) return null;
    const yyyy = m[1];
    const mm = String(m[2]).padStart(2, "0");
    const dd = String(m[3]).padStart(2, "0");
    const d = new Date(`${yyyy}-${mm}-${dd}T00:00:00${JST_OFFSET}`);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  function isPreRelease(album) {
    const releaseAt = parseRelease(album && album.release);
    return !!(releaseAt && Date.now() < releaseAt.getTime());
  }

  const list = (typeof albums !== "undefined" && Array.isArray(albums))
    ? albums
    : (Array.isArray(window.albums) ? window.albums : []);
  if (!list.length) return;

  const byId = new Map(list.filter(a => a && a.id).map(a => [a.id, a]));

  const style = document.createElement("style");
  style.textContent = `
    a[data-release-label]{position:relative}
    .release-label{position:absolute;z-index:4;top:.62rem;left:.62rem;padding:.32rem .52rem;background:rgba(7,4,9,.9);border:1px solid rgba(210,171,221,.44);color:#f0e4f3;font:600 .62rem/1 system-ui,sans-serif;letter-spacing:.08em;pointer-events:none}
  `;
  document.head.appendChild(style);

  document.querySelectorAll('a[href*="detail.html?id="]').forEach(link => {
    let id = "";
    try { id = new URL(link.href, location.href).searchParams.get("id") || ""; } catch (_) {}
    const album = byId.get(id);
    if (!album || !isPreRelease(album)) return;
    link.dataset.releaseLabel = "1";
    const badge = document.createElement("span");
    badge.className = "release-label";
    badge.textContent = "リリース前";
    link.appendChild(badge);
  });
})();
