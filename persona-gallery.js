(() => {
  const root = document.querySelector('[data-gallery]');
  if (!root) return;
  const source = root.dataset.source;
  const kind = root.dataset.kind || 'illustration';
  const filters = document.querySelector('[data-filters]');
  const empty = document.querySelector('[data-empty]');
  const lightbox = document.querySelector('.pg-lightbox');
  let items = [];
  let active = 'ALL';
  const esc = s => String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const categories = () => ['ALL', ...new Set(items.flatMap(i => i.categories || (i.pair ? [i.pair] : i.type ? [i.type] : [])).filter(Boolean))];
  function drawFilters(){
    if (!filters) return;
    filters.innerHTML = categories().map(c=>`<button class="pg-filter ${c===active?'is-active':''}" data-filter="${esc(c)}">${esc(c)}</button>`).join('');
    filters.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{active=b.dataset.filter;drawFilters();draw();}));
  }
  function draw(){
    const list = active==='ALL' ? items : items.filter(i => (i.categories || (i.pair ? [i.pair] : i.type ? [i.type] : [])).includes(active));
    if (!list.length){ root.innerHTML=''; if(empty) empty.hidden=false; return; }
    if(empty) empty.hidden=true;
    root.innerHTML = list.map((i,n)=>`<article class="pg-card ${kind==='comic'?'pg-card--comic':''}">
      <img class="pg-card__image" src="${esc(i.image)}" alt="${esc(i.alt || i.title || '')}" loading="lazy" data-full="${esc(i.image)}">
      <div class="pg-card__body"><div class="pg-card__meta">${esc(i.characters || i.pair || i.type || `EPISODE ${String(n+1).padStart(3,'0')}`)}</div><h2>${esc(i.title || 'UNTITLED')}</h2><p>${esc(i.description || '')}</p></div></article>`).join('');
    root.querySelectorAll('[data-full]').forEach(img=>img.addEventListener('click',()=>{if(!lightbox)return;lightbox.querySelector('img').src=img.dataset.full;lightbox.classList.add('is-open');}));
  }
  fetch(source,{cache:'no-store'}).then(r=>r.ok?r.json():Promise.reject(r.status)).then(data=>{items=data.items||[];drawFilters();draw();}).catch(()=>{items=[];drawFilters();draw();});
  if(lightbox){const close=()=>lightbox.classList.remove('is-open');lightbox.querySelector('button').addEventListener('click',close);lightbox.addEventListener('click',e=>{if(e.target===lightbox)close();});document.addEventListener('keydown',e=>{if(e.key==='Escape')close();});}
})();
