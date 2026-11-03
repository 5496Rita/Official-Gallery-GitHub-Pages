(() => {
 const albums=Array.isArray(window.GALLERY_ALBUMS)?window.GALLERY_ALBUMS:[];
 const input=document.getElementById('lyrics-search'), results=document.getElementById('lyrics-results'), status=document.getElementById('lyrics-status');
 const buttons=[...document.querySelectorAll('[data-artist]')]; let artist='all'; let rows=[];
 const norm=s=>String(s||'').normalize('NFKC').toLowerCase();
 const titles=a=>(a.tracks||[]).map(t=>typeof t==='string'?{title:t,lyrics:''}:{title:t.title||'',lyrics:t.lyrics||''});
 const lyricCandidates=id=>[id, id==='yugatou'?'yugato':id==='yugato'?'yugatou':id];
 async function lyricData(album){
   const base=titles(album); let external=null;
   for(const id of lyricCandidates(album.id)){try{const r=await fetch(`lyrics/${encodeURIComponent(id)}.json?v=730`,{cache:'no-store'}); if(r.ok){external=await r.json();break}}catch(e){}}
   if(external?.tracks){const map=new Map(external.tracks.map(t=>[norm(t.title),t.lyrics||'']));base.forEach(t=>{if(!t.lyrics)t.lyrics=map.get(norm(t.title))||''});}
   return base.map((t,i)=>({album,trackNo:i+1,title:t.title,lyrics:t.lyrics||''}));
 }
 function excerpt(text,q){ if(!text)return '歌詞はアルバム詳細ページで閲覧できます。'; const flat=text.replace(/\s+/g,' '); if(!q)return flat.slice(0,100)+(flat.length>100?'…':''); const n=norm(flat), k=norm(q), i=n.indexOf(k); const start=Math.max(0,(i<0?0:i)-34); return (start?'…':'')+flat.slice(start,start+120)+(start+120<flat.length?'…':''); }
 function render(){const q=input.value.trim();const nq=norm(q);let found=rows.filter(r=>(artist==='all'||r.album.artist===artist)&&(!nq||norm(`${r.title} ${r.album.title} ${r.album.reading||''} ${r.lyrics}`).includes(nq))); status.textContent=q?`${found.length} TRACKS FOUND`:`${rows.length} TRACKS ARCHIVED — 曲名または歌詞を入力してください`;results.replaceChildren();if(!found.length){results.innerHTML='<div class="lr-empty">該当する言葉は見つかりませんでした。</div>';return}found.slice(0,q?120:24).forEach(r=>{const a=document.createElement('a');a.className='lyric-item';a.href=`detail.html?id=${encodeURIComponent(r.album.id)}&from=lyrics`;a.innerHTML=`<span class="lyric-no">${String(r.trackNo).padStart(2,'0')}</span><span class="lyric-title"><strong>${r.title}</strong><small>${r.album.title} / ${r.album.artist}</small></span><span class="lyric-excerpt">${excerpt(r.lyrics,q)}</span><span class="lyric-go">OPEN →</span>`;results.appendChild(a)});}
 Promise.all(albums.map(async a=>rows.push(...await lyricData(a)))).then(()=>{rows.sort((a,b)=>(a.album.order||0)-(b.album.order||0)||a.trackNo-b.trackNo);render()});
 input.addEventListener('input',render);buttons.forEach(b=>b.addEventListener('click',()=>{artist=b.dataset.artist;buttons.forEach(x=>x.classList.toggle('is-active',x===b));render()}));
})();
