(() => {
  // Album detail pages from EXHIBITION historically returned to index.html#exhibition.
  // Redirect that legacy return target back into the exhibition room instead.
  if (location.hash === '#exhibition') {
    try {
      const state = JSON.parse(sessionStorage.getItem('officialGalleryReturnState') || 'null');
      if (state?.from === 'exhibition' && state?.returning) {
        location.replace('exhibition.html');
        return;
      }
    } catch (_) {}
  }
  document.documentElement.classList.add('home-ready');

  function loadYouTubePlayerApi() {
    if (window.YT?.Player) return Promise.resolve(window.YT);
    if (window.__officialGalleryYouTubeApiPromise) return window.__officialGalleryYouTubeApiPromise;
    window.__officialGalleryYouTubeApiPromise = new Promise((resolve, reject) => {
      const previousReady = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (typeof previousReady === 'function') previousReady();
        resolve(window.YT);
      };
      if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
        const script = document.createElement('script');
        script.src = 'https://www.youtube.com/iframe_api';
        script.async = true;
        script.addEventListener('error', () => reject(new Error('YouTube Player API failed to load.')), { once:true });
        document.head.appendChild(script);
      }
      setTimeout(() => { if (window.YT?.Player) resolve(window.YT); }, 3000);
    });
    return window.__officialGalleryYouTubeApiPromise;
  }

  async function initFeaturedShort() {
    const section = document.getElementById('featured-short');
    const playerWrap = document.getElementById('featured-short-player');
    const soundButton = document.getElementById('featured-short-sound');
    const nextButton = document.getElementById('featured-short-next');
    if (!section || !playerWrap || !soundButton || !nextButton) return;
    try {
      const response = await fetch('data/shorts.json', { cache:'no-store' });
      if (!response.ok) throw new Error(`Shorts data request failed: ${response.status}`);
      const data = await response.json();
      const raw = Array.isArray(data) ? data : (Array.isArray(data?.items) ? data.items : []);
      const shorts = raw.filter(item => item?.id);
      if (!shorts.length) return;
      await loadYouTubePlayerApi();
      let currentIndex = Math.floor(Math.random() * shorts.length);
      let isMuted = true;
      let player;
      const updateSoundButton = () => {
        soundButton.setAttribute('aria-pressed', String(!isMuted));
        soundButton.setAttribute('aria-label', isMuted ? 'サウンドをオン' : 'サウンドをオフ');
        soundButton.innerHTML = isMuted ? '<span aria-hidden="true">🔇</span>' : '<span aria-hidden="true">🔊</span>';
      };
      const playNext = () => {
        if (!player) return;
        let next = currentIndex;
        if (shorts.length > 1) while (next === currentIndex) next = Math.floor(Math.random() * shorts.length);
        currentIndex = next;
        player.loadVideoById(shorts[currentIndex].id);
        isMuted ? player.mute() : player.unMute();
        player.playVideo();
      };
      player = new window.YT.Player(playerWrap, {
        videoId: shorts[currentIndex].id,
        playerVars:{ autoplay:1, mute:1, playsinline:1, rel:0, controls:1, modestbranding:1, origin:window.location.origin },
        events:{
          onReady:event => { event.target.mute(); event.target.playVideo(); soundButton.disabled=false; nextButton.disabled=false; updateSoundButton(); section.hidden=false; requestAnimationFrame(()=>section.classList.add('is-ready')); },
          onStateChange:event => { if (event.data === window.YT.PlayerState.ENDED) { event.target.seekTo(0,true); event.target.playVideo(); } },
          onError:playNext
        }
      });
      soundButton.addEventListener('click', () => {
        if (!player || typeof player.isMuted !== 'function') return;
        if (player.isMuted()) { player.unMute(); player.setVolume?.(100); isMuted=false; }
        else { player.mute(); isMuted=true; }
        player.playVideo(); updateSoundButton();
      });
      nextButton.addEventListener('click', playNext);
    } catch (error) { console.warn('Featured Short could not be loaded.', error); }
  }
  initFeaturedShort();
})();
