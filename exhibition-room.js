(() => {
  const stage=document.getElementById('floating-works');
  const button=document.getElementById('reshuffle');
  const albums=Array.isArray(window.GALLERY_ALBUMS)?window.GALLERY_ALBUMS:[];
  const desktopSpots=[
    [2,4,-7],[15,10,4],[31,2,-3],[69,3,5],[83,9,-5],
    [5,31,5],[20,37,-4],[74,32,4],[88,39,-6],
    [2,66,-4],[16,70,6],[30,62,-5],[67,66,3],[81,68,-4],
    [41,7,2],[54,71,-3],[48,80,4],[93,63,5]
  ];
  const mobileSpots=[[2,3,-5],[34,4,4],[69,5,-3],[5,26,5],[68,28,-5],[2,66,-3],[35,69,5],[69,68,-4],[18,47,3],[76,49,-3],[45,13,2],[44,78,-2]];
  const shuffle=a=>{const x=[...a];for(let i=x.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[x[i],x[j]]=[x[j],x[i]]}return x};
  function render(){
    stage.innerHTML='';
    const mobile=matchMedia('(max-width:760px)').matches;
    const spots=mobile?mobileSpots:desktopSpots;
    const count=Math.min(spots.length,albums.length);
    shuffle(albums).slice(0,count).forEach((album,i)=>{
      const el=document.createElement('a');
      el.className='float-work';
      el.href=`detail.html?id=${encodeURIComponent(album.id)}&from=exhibition`;
      const [x,y,r]=spots[i];
      el.style.left=x+'%';el.style.top=y+'%';el.style.setProperty('--rot',r+'deg');el.style.setProperty('--delay',(-Math.random()*6).toFixed(2)+'s');
      const img=`covers/thumbs/${encodeURIComponent(album.id)}.webp`;
      el.innerHTML=`<img src="${img}" alt="${album.title}" loading="eager" onerror="this.onerror=null;this.src='${album.art}'"><span>${album.title}<br>${album.artist}</span>`;
      stage.appendChild(el);
    });
  }
  button.addEventListener('click',()=>{stage.animate([{opacity:.2},{opacity:1}],{duration:450});render()});
  addEventListener('resize',()=>{clearTimeout(window.__exResize);window.__exResize=setTimeout(render,180)});
  render();
})();
