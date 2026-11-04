(() => {
  const corridor = document.getElementById('encounter-corridor');
  const wall = document.getElementById('constellation-wall');
  const button = document.getElementById('reshuffle');
  const albums = Array.isArray(window.GALLERY_ALBUMS) ? window.GALLERY_ALBUMS.filter(a => a?.id && a?.title) : [];
  const shuffle = a => { const x=[...a]; for(let i=x.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [x[i],x[j]]=[x[j],x[i]]; } return x; };
  const accentFor = album => album.artist === 'CROVEIL' ? '64,70,145' : '145,52,96';
  const copyFor = album => album.artist === 'CROVEIL'
    ? '静かな威圧感と深い闇。孤高、崩壊、信仰、欲望が冷たい音像の中で輪郭を持つ。'
    : '耽美、ゴシック、誘惑、孤独、祈り。美しさと危うさが同じ夜の中で咲く。';

  function encounterTemplate(album, index){
    const art = album.art || `covers/${album.id}.jpg`;
    return `<article class="encounter" style="--accent:${accentFor(album)}">
      <div class="encounter-bg" style="background-image:url('${art}')"></div>
      <div class="encounter-cover-wrap reveal">
        <div class="encounter-frame"><img src="covers/thumbs/${encodeURIComponent(album.id)}.webp" alt="${album.title}" loading="lazy" onerror="this.onerror=null;this.src='${art}'"></div>
      </div>
      <div class="encounter-copy reveal">
        <div class="encounter-no">ENCOUNTER ${String(index+1).padStart(2,'0')}</div>
        <div class="encounter-artist">${album.artist || ''}</div>
        <h2 class="encounter-title">${album.title}</h2>
        <div class="encounter-reading">${album.reading || ''}</div>
        <div class="encounter-lines"><span></span><span></span><span></span></div>
        <p class="encounter-text">${copyFor(album)}</p>
        <a class="encounter-link" href="detail.html?id=${encodeURIComponent(album.id)}&from=exhibition">ENTER THIS ALBUM →</a>
      </div>
    </article>`;
  }

  function renderCorridor(){
    const picks = shuffle(albums).slice(0, Math.min(9, albums.length));
    corridor.innerHTML = picks.map(encounterTemplate).join('');
  }

  const desktopSpots = [[2,8,-6],[19,17,4],[39,5,-3],[66,8,5],[81,20,-5],[6,48,5],[27,58,-4],[49,42,4],[72,54,-6],[86,63,4],[15,77,-3],[58,75,5]];
  const mobileSpots = [[2,3,-5],[35,6,4],[68,4,-3],[6,28,4],[54,26,-4],[4,57,-3],[36,61,5],[69,55,-4],[17,79,3],[59,78,-2]];
  function renderWall(){
    wall.innerHTML='';
    const mobile = matchMedia('(max-width:900px)').matches;
    const spots = mobile ? mobileSpots : desktopSpots;
    shuffle(albums).slice(0,Math.min(spots.length,albums.length)).forEach((album,i)=>{
      const [x,y,r]=spots[i];
      const a=document.createElement('a');
      a.className='const-card';
      a.href=`detail.html?id=${encodeURIComponent(album.id)}&from=exhibition`;
      a.style.left=x+'%'; a.style.top=y+'%'; a.style.setProperty('--rot',r+'deg'); a.style.setProperty('--delay',(-Math.random()*6).toFixed(2)+'s');
      const art=album.art||`covers/${album.id}.jpg`;
      a.innerHTML=`<img src="covers/thumbs/${encodeURIComponent(album.id)}.webp" alt="${album.title}" loading="lazy" onerror="this.onerror=null;this.src='${art}'"><span>${album.title}<br>${album.artist||''}</span>`;
      wall.appendChild(a);
    });
  }

  function observe(){
    const io = new IntersectionObserver(entries=>entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('is-visible'); }),{threshold:.18});
    document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
  }

  function renderAll(){ renderCorridor(); renderWall(); observe(); }
  button?.addEventListener('click',()=>{ corridor.animate([{opacity:.25},{opacity:1}],{duration:520}); renderAll(); corridor.scrollIntoView({behavior:'smooth',block:'start'}); });
  addEventListener('resize',()=>{ clearTimeout(window.__exResize); window.__exResize=setTimeout(renderWall,180); });
  renderAll();
})();
