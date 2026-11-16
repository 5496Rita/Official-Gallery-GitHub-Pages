(() => {
  const JST_OFFSET = "+09:00";
  const STATUS = Object.create(null);

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

  function getStatus(album) {
    if (!album) return "released";
    const releaseAt = parseRelease(album.release);
    if (!releaseAt || Date.now() >= releaseAt.getTime()) return "released";
    return album.registrationStatus === "registered" ? "coming-soon" : "unregistered";
  }

  function labelFor(status, album) {
    if (status === "unregistered") return "UNREGISTERED";
    if (status === "coming-soon") return `COMING SOON${album && album.release ? ` — ${album.release}` : ""}`;
    return "RELEASED";
  }

  if (!Array.isArray(window.albums)) return;

  for (const album of window.albums) {
    if (!album || !album.id) continue;
    const status = getStatus(album);
    STATUS[album.id] = status;
    album.releaseStatus = status;

    if (status !== "released") {
      album.__releaseGateOriginalLinks = album.links;
      album.__releaseGateOriginalYoutubeId = album.youtubeId;
      album.links = {};
      album.youtubeId = "";
    }
  }

  window.ALBUM_RELEASE_STATUS = STATUS;
  window.getAlbumReleaseStatus = id => STATUS[id] || "released";

  const nativeFetch = window.fetch ? window.fetch.bind(window) : null;
  if (nativeFetch) {
    window.fetch = function(input, init) {
      const raw = typeof input === "string" ? input : (input && input.url) || "";
      let pathname = raw;
      try { pathname = new URL(raw, location.href).pathname; } catch (_) {}
      const match = pathname.match(/\/lyrics\/([^/?#]+)\.json$/i);
      if (match) {
        const id = decodeURIComponent(match[1]);
        const status = STATUS[id];
        if (status && status !== "released") {
          return Promise.resolve(new Response(JSON.stringify({
            locked: true,
            status,
            message: status === "unregistered" ? "UNREGISTERED" : "COMING SOON"
          }), {
            status: 403,
            headers: { "Content-Type": "application/json; charset=utf-8" }
          }));
        }
      }
      return nativeFetch(input, init);
    };
  }

  function addStyles() {
    if (document.getElementById("release-gate-styles")) return;
    const style = document.createElement("style");
    style.id = "release-gate-styles";
    style.textContent = `
      .release-gate-badge{display:inline-flex;align-items:center;gap:.45em;margin:.55rem 0 0;padding:.42rem .72rem;border:1px solid rgba(190,142,205,.45);background:rgba(20,9,25,.82);color:#eadcf0;font:600 .72rem/1.2 system-ui,sans-serif;letter-spacing:.12em;text-transform:uppercase}
      .release-gate-panel{margin:1.2rem 0 0;padding:1rem 1.1rem;border:1px solid rgba(190,142,205,.35);background:linear-gradient(135deg,rgba(26,11,31,.92),rgba(8,5,11,.94));color:#eee3f2}
      .release-gate-panel strong{display:block;margin-bottom:.4rem;font-family:"Cormorant Garamond",serif;font-size:1.2rem;letter-spacing:.08em}
      .release-gate-panel p{margin:.2rem 0;color:#cbbbcf;font-size:.86rem;line-height:1.7}
      .release-gate-locks{display:flex;flex-wrap:wrap;gap:.45rem;margin-top:.7rem}
      .release-gate-locks span{padding:.35rem .55rem;border:1px solid rgba(255,255,255,.12);font-size:.68rem;letter-spacing:.08em;color:#bfaec5}
      .release-gate-hidden{display:none!important}
      .release-gate-card-badge{position:absolute;z-index:4;top:.65rem;left:.65rem;padding:.32rem .5rem;background:rgba(7,4,9,.88);border:1px solid rgba(210,171,221,.42);color:#f0e4f3;font:600 .62rem/1 system-ui,sans-serif;letter-spacing:.1em;text-transform:uppercase;pointer-events:none}
      a[data-release-gate-card]{position:relative}
      .release-gate-film{min-height:320px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:2rem;border:1px solid rgba(190,142,205,.24);background:linear-gradient(180deg,rgba(10,5,14,.72),rgba(4,2,7,.9))}
      .release-gate-film__eyebrow{font-size:.68rem;letter-spacing:.28em;color:#9f809f;margin:0 0 1rem}
      .release-gate-film__title{font-family:"Cormorant Garamond",serif;font-size:clamp(2.5rem,6vw,5.5rem);letter-spacing:.12em;color:#ded2df;margin:0}
      .release-gate-film__copy{max-width:42rem;margin:.8rem auto 0;color:#9f8d9f;font-size:.78rem;line-height:1.8;letter-spacing:.08em}
    `;
    document.head.appendChild(style);
  }

  function renderFilmState(id, album, status) {
    const xfd = document.querySelector("#work-xfd");
    const section = document.querySelector(".work-xfd");
    if (!xfd || !section || status === "released") return;

    section.classList.remove("release-gate-hidden");
    const title = status === "unregistered" ? "UNREGISTERED" : "COMING SOON";
    const eyebrow = status === "unregistered" ? "FULL ALBUM FILM / NOT REGISTERED" : "FULL ALBUM FILM / SCHEDULED";
    const copy = status === "unregistered"
      ? "配信登録前のため、フルアルバム映像はまだ公開予定に入りません。"
      : `${album && album.release ? album.release + " に公開予定。" : "公開予定。"} リリース日になると自動で解禁されます。`;

    xfd.innerHTML = `<div class="release-gate-film" data-release-film-state="${status}"><p class="release-gate-film__eyebrow">${eyebrow}</p><h3 class="release-gate-film__title">${title}</h3><p class="release-gate-film__copy">${copy}</p></div>`;
  }

  function decorateDetail() {
    const params = new URLSearchParams(location.search);
    const id = params.get("id");
    if (!id || !STATUS[id] || STATUS[id] === "released") return;
    const album = window.albums.find(a => a && a.id === id);
    const status = STATUS[id];
    const copy = document.querySelector(".work-hero__copy");
    if (!copy) return;

    document.querySelector(".listen-now")?.classList.add("release-gate-hidden");
    document.querySelector("#work-story")?.classList.add("release-gate-hidden");

    let panel = document.querySelector(".release-gate-panel");
    if (!panel) {
      panel = document.createElement("div");
      panel.className = "release-gate-panel";
      copy.appendChild(panel);
    }
    const heading = status === "unregistered" ? "UNREGISTERED" : "COMING SOON";
    const body = status === "unregistered"
      ? "この作品はまだ配信登録前です。登録後はCOMING SOONへ切り替わり、リリース日に自動解禁されます。"
      : `${album && album.release ? album.release + " に公開予定。" : "公開予定。"} リリース日になると自動でコンテンツが解禁されます。`;
    panel.innerHTML = `<strong>${heading}</strong><p>${body}</p><div class="release-gate-locks"><span>🔒 LYRICS</span><span>🔒 LISTEN</span><span>🔒 STORY</span></div>`;

    renderFilmState(id, album, status);
  }

  function decorateCards() {
    const links = document.querySelectorAll('a[href*="detail.html?id="]');
    for (const link of links) {
      if (link.dataset.releaseGateCard) continue;
      let id = "";
      try { id = new URL(link.href, location.href).searchParams.get("id") || ""; } catch (_) {}
      const status = STATUS[id];
      if (!status || status === "released") continue;
      const album = window.albums.find(a => a && a.id === id);
      link.dataset.releaseGateCard = "1";
      const badge = document.createElement("span");
      badge.className = "release-gate-card-badge";
      badge.textContent = labelFor(status, album);
      link.appendChild(badge);
    }
  }

  function runDecorators() {
    addStyles();
    decorateDetail();
    decorateCards();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", runDecorators, { once: true });
  } else {
    runDecorators();
  }

  const observer = new MutationObserver(() => runDecorators());
  observer.observe(document.documentElement, { childList: true, subtree: true });
  setTimeout(() => observer.disconnect(), 12000);
})();
