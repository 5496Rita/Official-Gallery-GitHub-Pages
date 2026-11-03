(() => {
  const grid=document.getElementById('jacket-grid'); const buttons=[...document.querySelectorAll('[data-filter]')];
  const albums=Array.isArray(window.GALLERY_ALBUMS)?window.GALLERY_ALBUMS:[];
  const render=(filter='all')=>{ grid.replaceChildren(); albums.filter(a=>filter==='all'||a.artist===filter).forEach(album=>{
    const a=document.createElement('a'); a.className='jacket-card'; a.href=`detail.html?id=${encodeURIComponent(album.id)}&from=archive`;
    const thumb=`covers/thumbs/${encodeURIComponent(album.id)}.webp`;
    a.innerHTML=`<span class="jacket-frame"><img src="${thumb}" alt="${album.title} ジャケット" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='${album.art}'"></span><span class="jacket-meta"><strong>${album.title}</strong><small><span>${album.artist}</span><span>${album.release||''}</span></small></span>`;
    grid.appendChild(a);
  }); };
  buttons.forEach(btn=>btn.addEventListener('click',()=>{buttons.forEach(b=>b.classList.toggle('is-active',b===btn));render(btn.dataset.filter)})); render();
})();
