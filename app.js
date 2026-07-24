(() => {
  "use strict";

  const albums = Array.isArray(window.GALLERY_ALBUMS) ? window.GALLERY_ALBUMS : [];
  const orderedAlbums = albums.slice();
  const gallery = document.getElementById("cover-gallery");
  const archiveResults = document.getElementById("archive-results");
  const archiveCount = document.getElementById("archive-count");
  const noResults = document.getElementById("no-results");
  const modal = document.getElementById("album-modal");
  const modalScroll = modal.querySelector(".modal-scroll");
  let currentAlbum = null;
  let lastFocus = null;
  let archiveView = "grid";

  const normalize = value => String(value || "").normalize("NFKC").toLowerCase();
  const releaseValue = album => String(album.release || "").replace(/\D/g, "");

  function enterSite() {
    const entrance = document.getElementById("entrance");
    entrance.classList.add("leaving");
    document.body.classList.remove("intro-open");
    setTimeout(() => { entrance.hidden = true; }, 900);
  }

  document.getElementById("enter-gallery").addEventListener("click", enterSite);

  const menuToggle = document.getElementById("menu-toggle");
  const siteNav = document.getElementById("site-nav");
  menuToggle.addEventListener("click", () => {
    const open = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!open));
    siteNav.classList.toggle("open", !open);
  });
  siteNav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
    siteNav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  }));

  function createCoverButton(album, index) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "cover-item";
    button.dataset.albumId = album.id;
    button.style.setProperty("--tilt", `${[-2.8, 1.7, -1.2, 2.4, -.7, 1.1, -1.8, 2][index % 8]}deg`);
    button.style.setProperty("--delay", `${(index % 9) * -.48}s`);
    button.style.setProperty("--scale", `${[1, .9, 1.08, .96, 1.03, .88][index % 6]}`);
    button.setAttribute("aria-label", `${album.title} の作品詳細を開く`);
    const img = document.createElement("img");
    img.src = album.art;
    img.alt = `${album.title} ジャケット`;
    img.loading = index < 10 ? "eager" : "lazy";
    img.decoding = "async";
    button.appendChild(img);
    button.addEventListener("click", () => openAlbum(album.id));
    return button;
  }

  function renderExhibition(filter = "all") {
    const visible = orderedAlbums.filter(album => filter === "all" || album.artist === filter);
    gallery.replaceChildren(...visible.map(createCoverButton));
  }

  document.querySelectorAll("[data-exhibition-filter]").forEach(button => button.addEventListener("click", () => {
    document.querySelectorAll("[data-exhibition-filter]").forEach(item => {
      const active = item === button;
      item.classList.toggle("active", active);
      item.setAttribute("aria-selected", String(active));
    });
    renderExhibition(button.dataset.exhibitionFilter);
  }));

  function getArchiveAlbums() {
    const query = normalize(document.getElementById("archive-search").value);
    const artist = document.getElementById("archive-artist").value;
    const sort = document.getElementById("archive-sort").value;
    const filtered = orderedAlbums.filter(album => {
      const haystack = normalize([album.title, album.artist, ...(album.tracks || [])].join(" "));
      return (!query || haystack.includes(query)) && (artist === "all" || album.artist === artist);
    });
    filtered.sort((a, b) => {
      if (sort === "oldest") return releaseValue(a).localeCompare(releaseValue(b)) || (a.albumNumber || 0) - (b.albumNumber || 0);
      if (sort === "title") return String(a.title).localeCompare(String(b.title), "ja");
      if (sort === "number") return (a.albumNumber || 0) - (b.albumNumber || 0);
      return releaseValue(b).localeCompare(releaseValue(a)) || (b.albumNumber || 0) - (a.albumNumber || 0);
    });
    return filtered;
  }

  function createArchiveCard(album) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "archive-card";
    button.setAttribute("aria-label", `${album.title} の作品詳細を開く`);
    button.innerHTML = `
      <span class="archive-card-art"><img src="${album.art}" alt="${album.title} ジャケット" loading="lazy" decoding="async"></span>
      <span class="archive-card-copy">
        <small>ARCHIVE NO. ${String(album.albumNumber || 0).padStart(3, "0")}</small>
        <strong>${album.title}</strong>
        <em>${album.artist || ""}</em>
        <span class="archive-meta"><b>${album.release || "—"}</b><b>${(album.tracks || []).length} TRACKS</b></span>
      </span>`;
    button.addEventListener("click", () => openAlbum(album.id));
    return button;
  }

  function renderArchive() {
    const visible = getArchiveAlbums();
    archiveResults.className = `archive-results ${archiveView}-view`;
    archiveResults.replaceChildren(...visible.map(createArchiveCard));
    archiveCount.textContent = `${String(visible.length).padStart(2, "0")} / ${String(albums.length).padStart(2, "0")} WORKS`;
    noResults.hidden = visible.length !== 0;
  }

  ["archive-search", "archive-artist", "archive-sort"].forEach(id => {
    const element = document.getElementById(id);
    element.addEventListener(id === "archive-search" ? "input" : "change", renderArchive);
  });

  document.querySelectorAll("[data-view]").forEach(button => button.addEventListener("click", () => {
    archiveView = button.dataset.view;
    document.querySelectorAll("[data-view]").forEach(item => {
      const active = item === button;
      item.classList.toggle("active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    renderArchive();
  }));

  document.getElementById("archive-reset").addEventListener("click", () => {
    document.getElementById("archive-search").value = "";
    document.getElementById("archive-artist").value = "all";
    document.getElementById("archive-sort").value = "newest";
    renderArchive();
  });

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
    audio.controls = true;
    audio.preload = "none";
    audio.src = source;
    field.appendChild(audio);
  }

  function renderModal(album) {
    currentAlbum = album;
    const index = orderedAlbums.findIndex(item => item.id === album.id);
    document.getElementById("modal-art").src = album.art;
    document.getElementById("modal-art").alt = `${album.title} ジャケット`;
    document.getElementById("modal-accession").textContent = `ARCHIVE NO. ${String(album.albumNumber || index + 1).padStart(3, "0")}`;
    document.getElementById("modal-artist").textContent = album.artist || "";
    document.getElementById("modal-title").textContent = album.title || "Untitled";
    document.getElementById("modal-release").textContent = album.release ? `RELEASED ${album.release}` : "";

    const tracks = document.getElementById("modal-tracks");
    tracks.replaceChildren(...(album.tracks || []).map(makeTrack));
    if (!tracks.children.length) {
      const li = document.createElement("li"); li.className = "pending"; li.textContent = "Track list coming soon."; tracks.appendChild(li);
    }

    const story = document.getElementById("modal-story");
    story.replaceChildren(...(album.story || []).map(line => { const p = document.createElement("p"); p.textContent = line; return p; }));
    if (!story.children.length) {
      const p = document.createElement("p"); p.className = "pending"; p.textContent = "Story coming soon."; story.appendChild(p);
    }

    const links = document.getElementById("modal-links");
    links.replaceChildren();
    const labels = { spotify: "Spotify", apple: "Apple Music", amazon: "Amazon Music", youtube: "YouTube Music" };
    Object.entries(labels).forEach(([key, label]) => {
      const href = album.links?.[key];
      if (!href) return;
      const anchor = document.createElement("a");
      anchor.href = href; anchor.target = "_blank"; anchor.rel = "noreferrer"; anchor.textContent = `${label} ↗`;
      links.appendChild(anchor);
    });
    if (!links.children.length) {
      const p = document.createElement("p"); p.className = "pending"; p.textContent = "Streaming links coming soon."; links.appendChild(p);
    }

    renderXfd(album);
    const prev = orderedAlbums[(index - 1 + orderedAlbums.length) % orderedAlbums.length];
    const next = orderedAlbums[(index + 1) % orderedAlbums.length];
    document.querySelector("#modal-prev b").textContent = prev.title;
    document.querySelector("#modal-next b").textContent = next.title;
    document.getElementById("modal-position").textContent = `${String(index + 1).padStart(2, "0")} / ${String(orderedAlbums.length).padStart(2, "0")}`;
    modalScroll.scrollTop = 0;
  }

  function openAlbum(id) {
    const album = orderedAlbums.find(item => item.id === id);
    if (!album) return;
    lastFocus = document.activeElement;
    renderModal(album);
    modal.hidden = false;
    document.body.classList.add("modal-open");
    history.replaceState(null, "", `#archive-${encodeURIComponent(album.id)}`);
    requestAnimationFrame(() => {
      modal.classList.add("open");
      modal.querySelector(".modal-close").focus({ preventScroll: true });
    });
  }

  function closeModal() {
    modal.classList.remove("open");
    document.body.classList.remove("modal-open");
    if (location.hash.startsWith("#archive-")) history.replaceState(null, "", `${location.pathname}${location.search}#archive`);
    setTimeout(() => { modal.hidden = true; lastFocus?.focus?.(); }, 260);
  }

  document.querySelectorAll("[data-close-modal]").forEach(element => element.addEventListener("click", closeModal));
  document.getElementById("modal-prev").addEventListener("click", () => {
    const index = orderedAlbums.findIndex(item => item.id === currentAlbum?.id);
    renderModal(orderedAlbums[(index - 1 + orderedAlbums.length) % orderedAlbums.length]);
  });
  document.getElementById("modal-next").addEventListener("click", () => {
    const index = orderedAlbums.findIndex(item => item.id === currentAlbum?.id);
    renderModal(orderedAlbums[(index + 1) % orderedAlbums.length]);
  });
  document.addEventListener("keydown", event => {
    if (!document.getElementById("entrance").hidden && event.key === "Enter") enterSite();
    if (modal.hidden) return;
    if (event.key === "Escape") closeModal();
    if (event.key === "ArrowLeft") document.getElementById("modal-prev").click();
    if (event.key === "ArrowRight") document.getElementById("modal-next").click();
  });

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduced) {
    const field = document.getElementById("petal-field");
    for (let i = 0; i < 11; i++) {
      const petal = document.createElement("i");
      petal.style.cssText = `left:${4 + i * 9}%;--d:${14 + (i % 4) * 2}s;--delay:${-i * 2.1}s`;
      field.appendChild(petal);
    }
  }

  renderExhibition();
  renderArchive();
  const direct = location.hash.match(/^#archive-(.+)$/);
  if (direct) {
    document.getElementById("entrance").hidden = true;
    document.body.classList.remove("intro-open");
    requestAnimationFrame(() => openAlbum(decodeURIComponent(direct[1])));
  }
})();
