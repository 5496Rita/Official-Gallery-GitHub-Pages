(() => {
  "use strict";
  const albums = Array.isArray(window.GALLERY_ALBUMS) ? window.GALLERY_ALBUMS : [];
  const gallery = document.getElementById("cover-gallery");
  const count = document.getElementById("collection-count");
  const modal = document.getElementById("album-modal");
  const modalScroll = modal.querySelector(".modal-scroll");
  let visibleAlbums = albums.slice();
  let currentAlbum = null;
  let lastFocus = null;

  const byNewest = (a, b) => String(b.release).localeCompare(String(a.release)) || (b.albumNumber || 0) - (a.albumNumber || 0);
  const orderedAlbums = albums.slice();

  function renderGallery(filter = "all") {
    visibleAlbums = orderedAlbums.filter(a => filter === "all" || a.artist === filter);
    gallery.replaceChildren();
    count.textContent = `${String(visibleAlbums.length).padStart(2, "0")} WORKS`;

    visibleAlbums.forEach((album, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "cover-item";
      button.dataset.albumId = album.id;
      button.style.setProperty("--tilt", `${[-2.4, 1.5, -1, 2.2, -.8, 1.1][index % 6]}deg`);
      button.style.setProperty("--delay", `${(index % 8) * -.42}s`);
      button.setAttribute("aria-label", `${album.title} の作品詳細を開く`);

      const img = document.createElement("img");
      img.src = album.art;
      img.alt = `${album.title} ジャケット`;
      img.loading = index < 8 ? "eager" : "lazy";
      img.decoding = "async";
      button.appendChild(img);
      button.addEventListener("click", () => openAlbum(album.id));
      gallery.appendChild(button);
    });
  }

  function makeTrack(track, index) {
    const li = document.createElement("li");
    const number = document.createElement("span");
    number.textContent = String(index + 1).padStart(2, "0");
    const title = document.createElement("b");
    title.textContent = track;
    li.append(number, title);
    return li;
  }

  function renderXfd(album) {
    const field = document.getElementById("modal-xfd");
    field.replaceChildren();
    const source = album.xfd || album.links?.xfd || "";
    if (!source) {
      const p = document.createElement("p");
      p.className = "pending";
      p.textContent = "Crossfade coming soon.";
      field.appendChild(p);
      return;
    }
    const match = source.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{11})/);
    if (match) {
      const iframe = document.createElement("iframe");
      iframe.src = `https://www.youtube-nocookie.com/embed/${match[1]}`;
      iframe.title = `${album.title} Crossfade`;
      iframe.loading = "lazy";
      iframe.allowFullscreen = true;
      field.appendChild(iframe);
      return;
    }
    const audio = document.createElement("audio");
    audio.controls = true; audio.preload = "none"; audio.src = source;
    field.appendChild(audio);
  }

  function renderModal(album) {
    currentAlbum = album;
    const index = orderedAlbums.findIndex(a => a.id === album.id);
    document.getElementById("modal-art").src = album.art;
    document.getElementById("modal-art").alt = `${album.title} ジャケット`;
    document.getElementById("modal-accession").textContent = `ARCHIVE NO. ${String(album.albumNumber || index + 1).padStart(3, "0")}`;
    document.getElementById("modal-artist").textContent = album.artist || "";
    document.getElementById("modal-title").textContent = album.title || "Untitled";
    document.getElementById("modal-release").textContent = album.release ? `RELEASED ${album.release}` : "";

    const tracks = document.getElementById("modal-tracks");
    tracks.replaceChildren(...(album.tracks || []).map(makeTrack));
    if (!tracks.children.length) { const li = document.createElement("li"); li.className = "pending"; li.textContent = "Track list coming soon."; tracks.appendChild(li); }

    const story = document.getElementById("modal-story");
    story.replaceChildren(...(album.story || []).map(line => { const p = document.createElement("p"); p.textContent = line; return p; }));
    if (!story.children.length) { const p = document.createElement("p"); p.className = "pending"; p.textContent = "Story coming soon."; story.appendChild(p); }

    const links = document.getElementById("modal-links");
    links.replaceChildren();
    const labels = { spotify: "Spotify", apple: "Apple Music", amazon: "Amazon Music", youtube: "YouTube Music" };
    Object.entries(labels).forEach(([key, label]) => {
      const href = album.links?.[key]; if (!href) return;
      const a = document.createElement("a"); a.href = href; a.target = "_blank"; a.rel = "noreferrer"; a.textContent = `${label} ↗`; links.appendChild(a);
    });
    if (!links.children.length) { const p = document.createElement("p"); p.className = "pending"; p.textContent = "Streaming links coming soon."; links.appendChild(p); }

    renderXfd(album);
    const prev = orderedAlbums[(index - 1 + orderedAlbums.length) % orderedAlbums.length];
    const next = orderedAlbums[(index + 1) % orderedAlbums.length];
    document.querySelector("#modal-prev b").textContent = prev.title;
    document.querySelector("#modal-next b").textContent = next.title;
    document.getElementById("modal-position").textContent = `${String(index + 1).padStart(2, "0")} / ${String(orderedAlbums.length).padStart(2, "0")}`;
    modalScroll.scrollTop = 0;
  }

  function openAlbum(id) {
    const album = orderedAlbums.find(a => a.id === id);
    if (!album) return;
    lastFocus = document.activeElement;
    renderModal(album);
    modal.hidden = false;
    document.body.classList.add("modal-open");
    history.replaceState(null, "", `#archive-${encodeURIComponent(album.id)}`);
    requestAnimationFrame(() => { modal.classList.add("open"); modal.querySelector(".modal-close").focus({ preventScroll: true }); });
  }

  function closeModal() {
    modal.classList.remove("open");
    document.body.classList.remove("modal-open");
    if (location.hash.startsWith("#archive-")) history.replaceState(null, "", `${location.pathname}${location.search}#gallery`);
    setTimeout(() => { modal.hidden = true; lastFocus?.focus?.(); }, 260);
  }

  document.querySelectorAll("[data-close-modal]").forEach(el => el.addEventListener("click", closeModal));
  document.getElementById("modal-prev").addEventListener("click", () => {
    const i = orderedAlbums.findIndex(a => a.id === currentAlbum?.id); renderModal(orderedAlbums[(i - 1 + orderedAlbums.length) % orderedAlbums.length]);
  });
  document.getElementById("modal-next").addEventListener("click", () => {
    const i = orderedAlbums.findIndex(a => a.id === currentAlbum?.id); renderModal(orderedAlbums[(i + 1) % orderedAlbums.length]);
  });
  document.addEventListener("keydown", e => {
    if (modal.hidden) return;
    if (e.key === "Escape") closeModal();
    if (e.key === "ArrowLeft") document.getElementById("modal-prev").click();
    if (e.key === "ArrowRight") document.getElementById("modal-next").click();
  });

  document.querySelectorAll(".filter").forEach(button => button.addEventListener("click", () => {
    document.querySelectorAll(".filter").forEach(item => { const active = item === button; item.classList.toggle("active", active); item.setAttribute("aria-selected", String(active)); });
    renderGallery(button.dataset.filter);
  }));

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduced) {
    const field = document.getElementById("petal-field");
    for (let i = 0; i < 9; i++) { const p = document.createElement("i"); p.style.cssText = `left:${5 + i * 11}%;--d:${14 + (i % 4) * 2}s;--delay:${-i * 2.3}s`; field.appendChild(p); }
  }

  renderGallery();
  const direct = location.hash.match(/^#archive-(.+)$/);
  if (direct) requestAnimationFrame(() => openAlbum(decodeURIComponent(direct[1])));
})();
