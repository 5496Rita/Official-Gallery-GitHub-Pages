// Monthly hero slideshow
// Add data-monthly-hero to the <img> or hero container you want to change.
// The current month's images rotate automatically with a fade transition.

const MONTHLY_HERO_INTERVAL_MS = 7000;
const MONTHLY_HERO_FADE_MS = 700;

const MONTHLY_HERO_IMAGES = {
  "1": [
    "01_january/january_01.png",
    "01_january/january_02.png",
    "01_january/january_03.png",
    "01_january/january_04.png",
    "01_january/january_05.png"
  ],
  "2": [
    "02_february/february_01.png",
    "02_february/february_02.png",
    "02_february/february_03.png"
  ],
  "3": [
    "03_march/march_01.png",
    "03_march/march_02.png",
    "03_march/march_03.png"
  ],
  "4": [
    "04_april/april_01.png",
    "04_april/april_02.png",
    "04_april/april_03.png",
    "04_april/april_04.png",
    "04_april/april_05.png",
    "04_april/april_06.png"
  ],
  "5": [
    "05_may/may_01.png",
    "05_may/may_02.png",
    "05_may/may_03.png",
    "05_may/may_04.png",
    "05_may/may_05.png"
  ],
  "6": [
    "06_june/june_01.png",
    "06_june/june_02.png",
    "06_june/june_03.png",
    "06_june/june_04.png",
    "06_june/june_05.png"
  ],
  "7": [
    "07_july/july_01.png",
    "07_july/july_02.png"
  ],
  "8": [
    "08_august/august_01.png",
    "08_august/august_02.png"
  ],
  "9": [
    "09_september/september_01.png",
    "09_september/september_02.png",
    "09_september/september_03.png"
  ],
  "10": [
    "10_october/october_01.png",
    "10_october/october_02.png",
    "10_october/october_03.png",
    "10_october/october_04.png",
    "10_october/october_05.png"
  ],
  "11": [
    "11_november/november_01.png",
    "11_november/november_02.png",
    "11_november/november_03.png"
  ],
  "12": [
    "12_december/december_01.png",
    "12_december/december_02.png",
    "12_december/december_03.png"
  ]
};

(function initMonthlyHeroSlideshow() {
  const month = new Date().getMonth() + 1;
  const candidates = MONTHLY_HERO_IMAGES[String(month)] || [];
  const target = document.querySelector('[data-monthly-hero]');

  if (!target || !candidates.length) return;

  // Preload the current month's images.
  candidates.forEach(src => {
    const img = new Image();
    img.src = src;
  });

  let currentIndex = Math.floor(Math.random() * candidates.length);

  const nextIndex = () => {
    if (candidates.length <= 1) return currentIndex;
    let index = currentIndex;
    while (index === currentIndex) {
      index = Math.floor(Math.random() * candidates.length);
    }
    return index;
  };

  if (target.tagName === 'IMG') {
    target.style.transition = `opacity ${MONTHLY_HERO_FADE_MS}ms ease`;
    target.src = candidates[currentIndex];

    if (candidates.length > 1) {
      setInterval(() => {
        const next = nextIndex();
        target.style.opacity = '0';
        setTimeout(() => {
          currentIndex = next;
          target.src = candidates[currentIndex];
          requestAnimationFrame(() => {
            target.style.opacity = '1';
          });
        }, MONTHLY_HERO_FADE_MS);
      }, MONTHLY_HERO_INTERVAL_MS);
    }
    return;
  }

  // For background heroes, use two layers so text/content does not fade out.
  const computedPosition = getComputedStyle(target).position;
  if (computedPosition === 'static') target.style.position = 'relative';
  target.style.overflow = 'hidden';

  const makeLayer = () => {
    const layer = document.createElement('span');
    Object.assign(layer.style, {
      position: 'absolute',
      inset: '0',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      transition: `opacity ${MONTHLY_HERO_FADE_MS}ms ease`,
      pointerEvents: 'none',
      zIndex: '0'
    });
    return layer;
  };

  const layerA = makeLayer();
  const layerB = makeLayer();
  layerA.style.backgroundImage = `url("${candidates[currentIndex]}")`;
  layerA.style.opacity = '1';
  layerB.style.opacity = '0';
  target.prepend(layerB);
  target.prepend(layerA);

  Array.from(target.children).forEach(child => {
    if (child !== layerA && child !== layerB) {
      const style = getComputedStyle(child);
      if (style.position === 'static') child.style.position = 'relative';
      if (!child.style.zIndex) child.style.zIndex = '1';
    }
  });

  let active = layerA;
  let standby = layerB;

  if (candidates.length > 1) {
    setInterval(() => {
      const next = nextIndex();
      standby.style.backgroundImage = `url("${candidates[next]}")`;
      standby.style.opacity = '1';
      active.style.opacity = '0';

      setTimeout(() => {
        currentIndex = next;
        const oldActive = active;
        active = standby;
        standby = oldActive;
      }, MONTHLY_HERO_FADE_MS);
    }, MONTHLY_HERO_INTERVAL_MS);
  }
})();
