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

  // Dense curated slots: lots of simultaneous artwork, but still avoids total chaos.
  const heroSlots = [
    [2,20,12,-8,1],[14,26,18,6,2],[31,18,10,-5,1],[43,29,22,5,3],[67,17,13,-6,2],[81,28,16,7,2],[92,18,8,-4,1],
    [5,49,17,5,2],[25,46,11,-7,1],[37,55,14,5,2],[55,48,10,-5,1],[67,53,19,6,3],[86,50,11,-4,1],
    [10,76,12,-5,1],[27,73,18,6,2],[49,78,11,-4,1],[63,72,15,5,2],[82,77,13,-6,2],[94,72,7,4,1]
  ];
  const roomSlotsA = [
    [2,12,12,-7,1],[13,19,20,5,3],[34,10,10,-5,1],[46,22,15,6,2],[65,12,21,-5,3],[87,18,10,6,1],
    [4,39,18,5,2],[25,44,11,-6,1],[38,37,16,5,2],[58,45,12,-5,1],[72,36,18,6,3],[90,43,8,-4,1],
    [2,68,13,-4,1],[16,73,17,6,2],[35,66,11,-5,1],[47,75,21,5,3],[71,69,12,-6,1],[83,76,15,4,2],[94,65,7,-3,1]
  ];
  const roomSlotsB = [
    [3,14,10,6,1],[15,10,17,-6,2],[32,22,13,5,1],[46,12,21,-5,3],[70,20,11,6,1],[82,11,16,-6,2],[94,23,7,4,1],
    [5,42,20,-4,3],[28,39,10,6,1],[40,49,15,-5,2],[59,38,13,5,1],[72,48,19,-6,3],[92,43,8,5,1],
    [3,70,12,-5,1],[18,76,18,5,2],[39,67,10,-4,1],[50,77,20,6,3],[73,68,13,-5,1],[86,76,12,5,2]
  ];
  const roomSlotsC = [
    [2,10,11,-6,1],[13,18,18,6,2],[31,9,9,-5,1],[42,21,21,5,3],[65,11,13,-6,1],[78,18,17,5,2],[94,12,7,-4,1],
    [4,37,17,5,2],[24,43,11,-5,1],[36,34,15,6,2],[54,46,20,-6,3],[77,37,11,5,1],[88,46,10,-4,1],
    [2,63,12,-4,1],[15,72,18,6,2],[35,62,10,-5,1],[47,74,22,5,3],[72,63,12,-6,1],[84,72,15,4,2],[95,61,7,-3,1],
    [8,87,10,5,1],[27,88,16,-5,2],[52,89,12,4,1],[74,88,18,-6,2]
  ];
  const mobileSlots = [
    [4,10,38,-5,3],[55,12,31,5,2],[12,28,27,4,1],[56,31,38,-4,3],
    [4,49,32,5,2],[48,51,29,-5,1],[15,68,38,-4,3],[60,70,26,5,1],[8,87,29,-5,2],[54,88,34,4,2]
  ];

  function artFor(album){ return album.art || `covers/${album.id}.jpg`; }
  function createCard(album, slot, index){
    const [x,y,size,rot,weight]=slot;
    const a=document.createElement('a');
    a.className=`album-float reveal${weight===3?' featured':''}`;
    a.href=`detail.html?id=${encodeURIComponent(album.id)}&from=exhibition`;
    a.style.left=x+'%'; a.style.top=y+'%';
    a.style.setProperty('--size',size+'vw');
    a.style.setProperty('--rot',rot+'deg');
    a.style.setProperty('--dur',(5.8+(index%7)*.72)+'s');
    a.style.setProperty('--delay',(-index*.51)+'s');
    a.dataset.depth=String(.25 + (weight*.18) + ((index%4)*.05));
    a.style.zIndex=String(10+weight*4+(index%5));
    const art=artFor(album);
    a.innerHTML=`<img src="covers/thumbs/${encodeURIComponent(album.id)}.webp" alt="${album.title}" loading="lazy" onerror="this.onerror=null;this.src='${art}'"><span class="album-label"><strong>${album.title}</strong><small>${artistOf(album)} / ENTER →</small></span>`;
    return a;
  }
  function renderInto(id, pool, desktopSlots){
    const root=$(id); if(!root) return;
    root.innerHTML='';
    const slots=matchMedia('(max-width:900px)').matches ? mobileSlots : desktopSlots;
    const base=pool.length ? pool : albums;
    if(!base.length) return;
    const source=[];
    while(source.length<slots.length) source.push(...shuffle(base));
    source.slice(0,slots.length).forEach((album,i)=>root.appendChild(createCard(album,slots[i],i)));
  }
  function observe(){
    const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('is-visible')}),{threshold:.04});
    document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
  }
  function renderAll(){
    renderInto('hero-scatter',albums,heroSlots);
    renderInto('scatter-rita',rita,roomSlotsA);
    renderInto('scatter-croveil',croveil,roomSlotsB);
    renderInto('scatter-mixed',albums,roomSlotsC);
    observe();
    updateParallax();
  }
  function reshuffle(){
    document.body.animate([{opacity:.68,filter:'blur(2px)'},{opacity:1,filter:'blur(0)'}],{duration:520,easing:'ease-out'});
    renderAll();
  }
  let ticking=false;
  function updateParallax(){
    const sy=scrollY;
    document.querySelectorAll('.album-float').forEach(el=>{
      const d=parseFloat(el.dataset.depth||'.35');
      const r=el.getBoundingClientRect();
      const center=r.top + r.height/2 - innerHeight/2;
      const offset=Math.max(-28,Math.min(28,-center*d*.045));
      el.style.setProperty('--parallax',offset.toFixed(1)+'px');
    });
    ticking=false;
  }
  addEventListener('scroll',()=>{if(!ticking){ticking=true;requestAnimationFrame(updateParallax)}},{passive:true});
  $('reshuffle')?.addEventListener('click',reshuffle);
  $('reshuffle-bottom')?.addEventListener('click',()=>{reshuffle();scrollTo({top:0,behavior:'smooth'});});
  addEventListener('resize',()=>{clearTimeout(window.__ex28);window.__ex28=setTimeout(renderAll,180)});
  renderAll();
})();
