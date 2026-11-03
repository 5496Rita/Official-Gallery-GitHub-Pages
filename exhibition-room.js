(() => {
 const stage=document.getElementById('floating-works'), button=document.getElementById('reshuffle');
 const albums=Array.isArray(window.GALLERY_ALBUMS)?window.GALLERY_ALBUMS:[];
 const pick=()=>{const copy=[...albums].sort(()=>Math.random()-.5);return copy.slice(0,Math.min(10,copy.length))};
 const spots=[[4,13,-5],[21,18,5],[74,12,-4],[84,34,6],[6,61,4],[24,70,-5],[67,68,4],[84,72,-6],[43,8,3],[45,73,-3]];
 function render(){stage.innerHTML='';pick().forEach((a,i)=>{const el=document.createElement('a');el.className='float-work';el.href=`detail.html?id=${encodeURIComponent(a.id)}&from=exhibition`;const [x,y,r]=spots[i%spots.length];el.style.left=x+'%';el.style.top=y+'%';el.style.transform=`rotate(${r}deg)`;const img=`covers/thumbs/${encodeURIComponent(a.id)}.webp`;el.innerHTML=`<img src="${img}" alt="${a.title}" onerror="this.onerror=null;this.src='${a.art}'"><span>${a.title}<br>${a.artist}</span>`;stage.appendChild(el)})}
 button.addEventListener('click',render);render();
})();
