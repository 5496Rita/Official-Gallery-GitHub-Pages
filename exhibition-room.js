(() => {
  const albums = Array.isArray(window.GALLERY_ALBUMS)
    ? window.GALLERY_ALBUMS.filter(a => a?.id && a?.title)
    : [];
  const $ = id => document.getElementById(id);
  const shuffle = list => {
    const a=[...list];
    for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}
    return a;
  };
  const artistOf = a => String(a.artist || a.project || '').toUpperCase().includes('CROVEIL') ? 'CROVEIL' : '越黒リタ';
  const rita = albums.filter(a => artistOf(a) !== 'CROVEIL');
  const croveil = albums.filter(a => artistOf(a) === 'CROVEIL');

  // Carefully designed slots: random-looking, but avoids destructive overlap.
  const heroSlots = [
    [5,39,11,-7,1],[18,31,19,7,2],[38,45,10,-5,1],[52,34,13,4,2],[66,28,20,7,3],[84,39,9,-5,1],
    [9,67,13,5,2],[28,72,10,-4,1],[43,64,16,6,3],[61,70,11,-6,2],[78,66,14,4,2],[89,73,8,-3,1]
  ];
  const roomSlotsA = [
    [4,24,14,-7,2],[20,18,21,5,3],[45,27,11,-5,1],[60,16,16,6,2],[80,24,12,-4,1],
    [10,51,10,4,1],[29,49,15,-6,2],[49,55,20,5,3],[73,48,11,-5,1],[86,55,9,5,1],
    [4,76,16,-4,2],[25,78,10,5,1],[41,74,13,-5,2],[62,79,17,4,3],[83,77,11,-4,1]
  ];
  const roomSlotsB = [
    [7,20,10,5,1],[19,28,16,-6,2],[38,18,12,4,1],[53,27,20,-5,3],[78,17,13,7,2],
    [4,49,18,-4,3],[27,53,10,6,1],[42,47,15,-5,2],[65,53,12,5,1],[81,48,16,-6,2],
    [12,77,11,-5,1],[31,73,19,5,3],[56,78,10,-4,1],[70,71,14,6,2],[87,78,9,-5,1]
  ];
  const roomSlotsC = [
    [3,18,12,-5,1],[17,15,17,6,2],[38,22,10,-6,1],[52,14,20,5,3],[78,20,12,-5,1],[89,14,8,4,1],
    [8,41,18,4,3],[30,44,10,-5,1],[44,37,15,6,2],[65,44,18,-6,3],[86,40,10,5,1],
    [4,66,11,-4,1],[20,70,15,6,2],[39,65,20,-5,3],[64,72,11,5,1],[79,66,16,-6,2],[91,73,8,4,1]
  ];
  const mobileSlots = [
    [7,19,34,-5,2],[54,18,29,5,2],[18,37,26,4,1],[58,40,34,-4,3],
    [5,59,31,5,2],[49,61,28,-5,1],[17,78,34,-4,3],[60,80,25,5,1]
  ];

  function artFor(album){ return album.art || `covers/${album.id}.jpg`; }
  function createCard(album, slot, index){
    const [x,y,size,rot,weight]=slot;
    const a=document.createElement('a');
    a.className=`album-float reveal${weight===3?' featured':''}`;
    a.href=`detail.html?id=${encodeURIComponent(album.id)}&from=exhibition`;
    a.style.left=x+'%';
    a.style.top=y+'%';
    a.style.setProperty('--size',size+'vw');
    a.style.setProperty('--rot',rot+'deg');
    a.style.setProperty('--dur',(6.5+(index%5)*.9)+'s');
    a.style.setProperty('--delay',(-index*.63)+'s');
    a.style.zIndex=String(10+weight*3+(index%4));
    const art=artFor(album);
    a.innerHTML=`<img src="covers/thumbs/${encodeURIComponent(album.id)}.webp" alt="${album.title}" loading="lazy" onerror="this.onerror=null;this.src='${art}'"><span class="album-label"><strong>${album.title}</strong><small>${artistOf(album)} / ENTER →</small></span>`;
    return a;
  }

  function renderInto(id, pool, desktopSlots){
    const root=$(id); if(!root) return;
    root.innerHTML='';
    const slots=matchMedia('(max-width:900px)').matches ? mobileSlots : desktopSlots;
    const picks=shuffle(pool.length ? pool : albums);
    const needed=slots.length;
    const source=[];
    while(source.length<needed && picks.length){ source.push(...shuffle(picks)); }
    source.slice(0,needed).forEach((album,i)=>root.appendChild(createCard(album,slots[i],i)));
  }

  function observe(){
    const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('is-visible')}),{threshold:.08});
    document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
  }

  function renderAll(){
    renderInto('hero-scatter',albums,heroSlots);
    renderInto('scatter-rita',rita,roomSlotsA);
    renderInto('scatter-croveil',croveil,roomSlotsB);
    renderInto('scatter-mixed',albums,roomSlotsC);
    observe();
  }

  function reshuffle(){
    document.body.animate([{opacity:.72},{opacity:1}],{duration:420});
    renderAll();
  }
  $('reshuffle')?.addEventListener('click',reshuffle);
  $('reshuffle-bottom')?.addEventListener('click',()=>{reshuffle();scrollTo({top:0,behavior:'smooth'});});
  addEventListener('resize',()=>{clearTimeout(window.__ex8);window.__ex8=setTimeout(renderAll,180)});
  renderAll();
})();
