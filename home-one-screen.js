(() => {
  // Randomized hero: only curated images suitable for the top page.
  const heroArt = document.querySelector('.hero-art');
  const heroCandidates = [
    { src:'assets/hero-main.png', pos:'30% center' },
    { src:'illustration-media/illustration-17.webp', pos:'50% center' },
    { src:'illustration-media/illustration-28.webp', pos:'50% center' },
    { src:'illustration-media/illustration-27.webp', pos:'50% center' }
  ];
  if (heroArt) {
    const chosen = heroCandidates[Math.floor(Math.random() * heroCandidates.length)];
    const img = new Image();
    img.onload = () => {
      heroArt.style.opacity = '0';
      requestAnimationFrame(() => {
        heroArt.style.backgroundImage = `url("${chosen.src}")`;
        heroArt.style.backgroundPosition = chosen.pos;
        requestAnimationFrame(() => heroArt.style.opacity = '1');
      });
    };
    img.onerror = () => { heroArt.style.backgroundImage = "url('assets/hero-main.png')"; };
    img.src = chosen.src;
  }

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
    const ambient = document.getElementById('short-ambient');
    const sidePanel = document.querySelector('.side-panel');
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
      const updateAmbient = () => {
        const id = shorts[currentIndex]?.id;
        if (!id || !ambient) return;
        ambient.style.backgroundImage = `url("https://i.ytimg.com/vi/${id}/hqdefault.jpg")`;
        sidePanel?.classList.add('has-short');
      };
      const updateSoundButton = () => {
        soundButton.setAttribute('aria-pressed', String(!isMuted));
        soundButton.setAttribute('aria-label', isMuted ? 'サウンドをオン' : 'サウンドをオフ');
        soundButton.innerHTML = isMuted ? '<span aria-hidden="true">SOUND OFF</span>' : '<span aria-hidden="true">SOUND ON</span>';
      };
      const playNext = () => {
        if (!player) return;
        let next = currentIndex;
        if (shorts.length > 1) while (next === currentIndex) next = Math.floor(Math.random() * shorts.length);
        currentIndex = next;
        updateAmbient();
        player.loadVideoById(shorts[currentIndex].id);
        isMuted ? player.mute() : player.unMute();
        player.playVideo();
      };
      updateAmbient();
      player = new window.YT.Player(playerWrap, {
        videoId: shorts[currentIndex].id,
        playerVars:{ autoplay:1, mute:1, playsinline:1, rel:0, controls:1, modestbranding:1, origin:window.location.origin },
        events:{
          onReady:event => {
            event.target.mute(); event.target.playVideo();
            soundButton.disabled=false; nextButton.disabled=false; updateSoundButton();
            section.hidden=false; requestAnimationFrame(()=>section.classList.add('is-ready'));
          },
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
