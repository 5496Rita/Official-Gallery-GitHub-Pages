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

  // Wall-like layouts: one strong centerpiece plus many surrounding frames.
  const heroSlots = [
    [4,25,12,-3,1],[15,18,16,2,2],[31,29,10,-2,1],[42,24,25,0,3],[70,18,15,3,2],[86,28,10,-2,1],
    [7,55,10,2,1],[22,58,13,-2,1],[36,60,16,2,2],[59,58,11,-2,1],[73,55,17,2,2],[90,59,8,-2,1],
    [14,80,13,-2,1],[31,78,9,2,1],[46,82,14,-2,2],[64,79,12,2,1],[80,81,11,-2,1]
  ];
  const roomSlotsA = [
    [3,15,12,-2,1],[14,22,19,2,2],[35,13,10,-2,1],[45,23,24,0,3],[72,14,14,2,2],[88,20,9,-2,1],
    [6,46,16,2,2],[27,49,10,-2,1],[41,52,14,2,2],[59,48,10,-2,1],[72,47,18,2,2],[91,50,7,-2,1],
    [4,74,11,-2,1],[18,78,15,2,2],[38,73,10,-2,1],[50,79,20,0,3],[74,74,12,2,1],[87,79,10,-2,1]
  ];
  const roomSlotsB = [
    [4,17,10,2,1],[16,13,17,-2,2],[34,22,12,2,1],[46,14,23,0,3],[72,22,12,-2,1],[84,14,15,2,2],
    [5,47,19,-2,2],[29,44,10,2,1],[41,51,14,-2,2],[59,45,11,2,1],[72,52,18,-2,2],[91,47,7,2,1],
    [8,75,11,2,1],[21,79,16,-2,2],[40,72,10,2,1],[51,80,20,0,3],[75,73,11,-2,1],[87,79,10,2,1]
  ];
  const roomSlotsC = [
    [3,12,11,-2,1],[15,18,17,2,2],[33,10,9,-2,1],[43,20,24,0,3],[70,12,13,2,1],[82,18,16,-2,2],[94,12,6,2,1],
    [4,39,16,2,2],[24,44,10,-2,1],[38,36,14,2,2],[55,46,20,0,3],[78,38,11,-2,1],[89,46,9,2,1],
    [3,65,11,-2,1],[17,72,17,2,2],[36,64,9,-2,1],[47,75,21,0,3],[72,65,12,2,1],[84,73,14,-2,2],
    [9,91,10,2,1],[27,90,15,-2,2],[52,92,11,2,1],[74,90,17,-2,2]
  ];
  const mobileSlots = [
    [5,10,38,-2,3],[56,12,31,2,2],[12,28,27,2,1],[55,31,38,-2,3],
    [5,50,32,2,2],[48,52,29,-2,1],[13,69,38,-2,3],[60,71,26,2,1],[8,88,29,-2,2],[55,89,34,2,2]
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
    a.style.setProperty('--dur',(6.3+(index%6)*.72)+'s');
    a.style.setProperty('--delay',(-index*.49)+'s');
    a.dataset.depth=String(.22 + (weight*.18) + ((index%3)*.05));
    a.style.zIndex=String(10+weight*4+(index%4));
    const art=artFor(album);
    a.innerHTML=`<img src="covers/thumbs/${encodeURIComponent(album.id)}.webp" alt="${album.title}" loading="lazy" onerror="this.onerror=null;this.src='${art}'"><span class="album-label"><strong>${album.title}</strong><small>${artistOf(album)} / ENTER →</small></span>`;
    return a;
  }
  function renderInto(id,pool,desktopSlots){
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
    observe(); updateParallax();
  }
  function reshuffle(){
    document.body.animate([{opacity:.70,filter:'blur(1.5px)'},{opacity:1,filter:'blur(0)'}],{duration:500,easing:'ease-out'});
    renderAll();
  }
  let ticking=false;
  function updateParallax(){
    document.querySelectorAll('.album-float').forEach(el=>{
      const d=parseFloat(el.dataset.depth||'.35');
      const r=el.getBoundingClientRect();
      const center=r.top+r.height/2-innerHeight/2;
      const offset=Math.max(-24,Math.min(24,-center*d*.038));
      el.style.setProperty('--parallax',offset.toFixed(1)+'px');
    });
    ticking=false;
  }
  addEventListener('scroll',()=>{if(!ticking){ticking=true;requestAnimationFrame(updateParallax)}},{passive:true});
  $('reshuffle')?.addEventListener('click',reshuffle);
  $('reshuffle-bottom')?.addEventListener('click',()=>{reshuffle();scrollTo({top:0,behavior:'smooth'});});
  addEventListener('resize',()=>{clearTimeout(window.__ex29);window.__ex29=setTimeout(renderAll,180)});
  renderAll();
})();
