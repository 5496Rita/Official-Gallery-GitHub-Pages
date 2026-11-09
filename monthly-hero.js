// Monthly hero slideshow — Official Gallery v36
const MONTHLY_HERO_INTERVAL_MS = 7000;
const MONTHLY_HERO_FADE_MS = 700;
const MONTHLY_HERO_IMAGES = {
  "1": [
    "assets/hero-monthly/01_january/january_01.webp",
    "assets/hero-monthly/01_january/january_02.webp",
    "assets/hero-monthly/01_january/january_03.webp",
    "assets/hero-monthly/01_january/january_04.webp",
    "assets/hero-monthly/01_january/january_05.webp"
  ],
  "2": [
    "assets/hero-monthly/02_february/february_01.webp",
    "assets/hero-monthly/02_february/february_02.webp",
    "assets/hero-monthly/02_february/february_03.webp"
  ],
  "3": [
    "assets/hero-monthly/03_march/march_01.webp",
    "assets/hero-monthly/03_march/march_02.webp",
    "assets/hero-monthly/03_march/march_03.webp"
  ],
  "4": [
    "assets/hero-monthly/04_april/april_01.webp",
    "assets/hero-monthly/04_april/april_02.webp",
    "assets/hero-monthly/04_april/april_03.webp",
    "assets/hero-monthly/04_april/april_04.webp",
    "assets/hero-monthly/04_april/april_05.webp",
    "assets/hero-monthly/04_april/april_06.webp"
  ],
  "5": [
    "assets/hero-monthly/05_may/may_01.webp",
    "assets/hero-monthly/05_may/may_02.webp",
    "assets/hero-monthly/05_may/may_03.webp",
    "assets/hero-monthly/05_may/may_04.webp",
    "assets/hero-monthly/05_may/may_05.webp"
  ],
  "6": [
    "assets/hero-monthly/06_june/june_01.webp",
    "assets/hero-monthly/06_june/june_02.webp",
    "assets/hero-monthly/06_june/june_03.webp",
    "assets/hero-monthly/06_june/june_04.webp",
    "assets/hero-monthly/06_june/june_05.webp"
  ],
  "7": [
    "assets/hero-monthly/07_july/july_01.webp",
    "assets/hero-monthly/07_july/july_02.webp"
  ],
  "8": [
    "assets/hero-monthly/08_august/august_01.webp",
    "assets/hero-monthly/08_august/august_02.webp"
  ],
  "9": [
    "assets/hero-monthly/09_september/september_01.webp",
    "assets/hero-monthly/09_september/september_02.webp",
    "assets/hero-monthly/09_september/september_03.webp"
  ],
  "10": [
    "assets/hero-monthly/10_october/october_01.webp",
    "assets/hero-monthly/10_october/october_02.webp",
    "assets/hero-monthly/10_october/october_03.webp",
    "assets/hero-monthly/10_october/october_04.webp",
    "assets/hero-monthly/10_october/october_05.webp"
  ],
  "11": [
    "assets/hero-monthly/11_november/november_01.webp",
    "assets/hero-monthly/11_november/november_02.webp",
    "assets/hero-monthly/11_november/november_03.webp"
  ],
  "12": [
    "assets/hero-monthly/12_december/december_01.webp",
    "assets/hero-monthly/12_december/december_02.webp",
    "assets/hero-monthly/12_december/december_03.webp"
  ]
};

(() => {
  const candidates = MONTHLY_HERO_IMAGES[String(new Date().getMonth() + 1)] || [];
  const layers = [document.querySelector('[data-monthly-hero-layer="a"]'), document.querySelector('[data-monthly-hero-layer="b"]')];
  if (!candidates.length || layers.some(layer => !layer)) return;
  candidates.forEach(src => { const img = new Image(); img.src = src; });
  let currentIndex = Math.floor(Math.random() * candidates.length);
  let activeLayer = 0;
  const setImage = (layer, src) => {
    layer.style.setProperty('--hero-image', `url("${src}")`);
    layer.style.setProperty('--hero-pos-desktop', 'center center');
    layer.style.setProperty('--hero-pos-mobile', 'center center');
  };
  setImage(layers[0], candidates[currentIndex]);
  layers[0].style.opacity = '1';
  layers[1].style.opacity = '0';
  if (candidates.length < 2) return;
  window.setInterval(() => {
    let nextIndex = currentIndex;
    while (nextIndex === currentIndex) nextIndex = Math.floor(Math.random() * candidates.length);
    const nextLayer = activeLayer === 0 ? 1 : 0;
    setImage(layers[nextLayer], candidates[nextIndex]);
    requestAnimationFrame(() => {
      layers[nextLayer].style.opacity = '1';
      layers[activeLayer].style.opacity = '0';
    });
    window.setTimeout(() => { currentIndex = nextIndex; activeLayer = nextLayer; }, MONTHLY_HERO_FADE_MS);
  }, MONTHLY_HERO_INTERVAL_MS);
})();
