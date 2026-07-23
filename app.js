const commonListenLinks = {
  spotify: "https://open.spotify.com/artist/24ZhFNgFRKfS19yAisfM0Q",
  apple: "https://music.apple.com/jp/artist/%E8%B6%8A%E9%BB%92%E3%83%AA%E3%82%BF/1852020293",
  amazon: "https://music.amazon.com/artists/B0G48Q368M"
};

const albums = [
  {
    id: "velvet-dominion",
    artist: "越黒リタ",
    title: "Velvet Dominion",
    albumNumber: 1,
    release: "2025.12.13",
    story: [
      "深紅の宴が幕を開け、柔らかな支配が夜を包む。",
      "薔薇と毒、祈りと欲望が交差する、女王のための六つの夜想曲。"
    ],
    tracks: ["Queen of the Velvet Night", "Nocturne Marionette", "Ðesire", "Sanctus Ruina", "Venomous Rose", "Crimson Banquet"],
    art: "covers/velvet-dominion.png",
    accent: "crimson",
    links: commonListenLinks
  },
  {
    id: "lunar-eclat",
    artist: "越黒リタ",
    title: "Lunar Éclat",
    albumNumber: 2,
    release: "2025.12.13",
    story: [
      "月光に照らされた鏡が、忘れられた記憶を映し出す。",
      "深紅の林檎、黒い優雅さ、甘美な忘却――夜の底で交錯する、美しくも危うい六つの物語。"
    ],
    tracks: ["Mirror Elegy", "Alice in the Abyss", "Shadowed Apple", "Noir Élégance", "Noble Masquerade", "Scarlet Nepenthe"],
    art: "covers/lunar-eclat.jpg",
    accent: "blue",
    links: commonListenLinks
  },
  {
    id: "luminous-ruin",
    artist: "越黒リタ",
    title: "Luminous Ruin",
    albumNumber: 3,
    release: "2025.12.13",
    story: [
      "崩れ落ちた楽園に、機械仕掛けの祈りが響く。",
      "夢を喰らう影と、名前を失った少女。滅びの残骸は月光を受け、静かに美しく輝き始める。"
    ],
    tracks: ["Ornament of Ruin", "R", "Mechanical Prayer", "Dream Eater", "Veiled Eden", "Nameless Alice"],
    art: "covers/luminous-ruin.jpg",
    accent: "blue",
    links: commonListenLinks
  },
  {
    id: "oboromiyabi",
    artist: "越黒リタ",
    title: "朧雅",
    albumNumber: 4,
    release: "2026.01.01",
    story: [
      "朧月の下、消えかけた灯と葬送の桜が静かに揺れる。",
      "妖しく紅を纏う六つの情景が、墨染めの夜へと影を寄せる。"
    ],
    tracks: ["幻火", "葬桜", "夜纏", "妖紅", "墨染", "影寄"],
    art: "covers/oboromiyabi.jpg",
    accent: "amber",
    links: commonListenLinks
  },
  {
    id: "sugar-deception",
    artist: "越黒リタ",
    title: "$ugar Ðeception",
    albumNumber: 5,
    release: "2026.01.11",
    story: [
      "甘い微笑みの裏側で、罠と毒がきらめくステージ。",
      "愛される姿を演じながら、本当のわたしを組み立てていく六つの告白。"
    ],
    tracks: ["ファンサ×罠", "ポイズン★アイドル", "†冥土カフェ†", "月灯シンデレラ♪", "依存レッテル◆", "わたしのつくりかた"],
    art: "covers/sugar-deception.jpg",
    accent: "crimson",
    links: commonListenLinks
  },
  {
    id: "fractured-order",
    artist: "越黒リタ",
    title: "Fractured Order",
    albumNumber: 6,
    release: "2026.02.14",
    story: [
      "砕けた秩序の向こうで、鎖に閉ざされた意識が目を覚ます。",
      "甘い毒と深淵の舞踏が、崩壊そのものの輪郭を描き出す。"
    ],
    tracks: ["Broken Awakening", "Abyssal Dance", "Sweet Venom", "Bloodstained Chain", "Black Labyrinth", "The Shape of Collapse"],
    art: "covers/fractured-order.jpg",
    accent: "crimson",
    links: commonListenLinks
  },
  {
    id: "midnight-sirens",
    artist: "越黒リタ",
    title: "Midnight Sirens",
    albumNumber: 7,
    release: "2026.02.22",
    story: [
      "真夜中の月明かりに、堕ちた歌姫たちの誘惑が響く。",
      "罪と誇り、甘い囁きの果てで、選択の重さを問う六つの夜曲。"
    ],
    tracks: ["The Fallen", "Darkness Diva", "Pride of Night", "Sweet Sin Fairy", "Whisper of Temptation", "Weight of Choice"],
    art: "covers/midnight-sirens.jpg",
    accent: "purple",
    links: commonListenLinks
  },
  {
    id: "enmusubi",
    artist: "越黒リタ",
    title: "艶結ビ",
    albumNumber: 8,
    release: "2026.03.14",
    story: [
      "甘美な糸が絡み合い、冷たい楽園に逃げ場のない夢を結ぶ。",
      "見えない首輪と拒絶の距離を描く、官能的で危うい六つの告白。"
    ],
    tracks: ["官能堪能", "冷たい楽園。", "都合のいい夢", "甘い拘束", "見えない首輪", "拒絶の距離"],
    art: "covers/enmusubi.jpg",
    accent: "crimson",
    links: commonListenLinks
  },
  {
    id: "nocturnal-rite",
    artist: "越黒リタ",
    title: "Nocturnal Rite",
    albumNumber: 9,
    release: "2026.03.20",
    story: [
      "闇を纏う夜、骸の祝杯とともに禁じられた儀式が始まる。",
      "棺と王冠、蛇と蝙蝠が導く、背徳のための六つの典礼。"
    ],
    tracks: ["闇を着る", "骸の祝杯", "夜を選ぶ蝙蝠", "蛇が眠る場所", "棺と王冠", "背徳のロザリオ"],
    art: "covers/nocturnal-rite.jpg",
    accent: "blue",
    links: commonListenLinks
  },
  {
    id: "nachtgarten",
    artist: "越黒リタ",
    title: "Nachtgarten",
    albumNumber: 10,
    release: "2026.04.16",
    story: [
      "青い月の庭で、硝子の果実と夜に愛された蝶が目を覚ます。",
      "深淵に咲く花と残香を辿る、静謐な六つの幻想。"
    ],
    tracks: ["ガラスの果実", "深淵に咲く花", "夜に愛された蝶", "青薔薇の花弁", "誘いの縁", "夜の残香"],
    art: "covers/nachtgarten.jpg",
    accent: "blue",
    links: commonListenLinks
  },
  {
    id: "aeternitas",
    artist: "越黒リタ",
    title: "Aeternitas",
    albumNumber: 11,
    release: "2026.04.25",
    story: [
      "沈黙が続く限り、意識は境界を溶かし永遠の海を漂う。",
      "悪夢にも満たない静けさの先で、果てのない夜を見つめる六篇。"
    ],
    tracks: ["悪夢未満", "沈黙が続く限り", "境界融解", "意識の海", "在り続ける場所", "果てのない夜へ"],
    art: "covers/aeternitas.jpg",
    accent: "blue",
    links: commonListenLinks
  },
  {
    id: "vitia",
    artist: "越黒リタ",
    title: "ViTiA",
    albumNumber: 12,
    release: "2026.05.16",
    story: [
      "七つの罪が杯を満たし、冷たい欲望が古い聖堂を巡る。",
      "傲慢、強欲、暴食、怠惰――悪徳の名を冠した六つの肖像。"
    ],
    tracks: ["Lucifer Pride", "Cold Satan", "Asmodeus Pulse", "Mammon Weight", "Beelzebub Overdose", "Belphegor Stasis"],
    art: "covers/vitia.jpg",
    accent: "purple",
    links: commonListenLinks
  },
  {
    id: "silent-sovereign",
    artist: "越黒リタ",
    title: "Silent Sovereign",
    albumNumber: 13,
    release: "2026.05.30",
    story: [
      "静かな支配者はカードを伏せ、罪と虚像を賭場へ並べる。",
      "沈黙の多数派を従え、冷たい輝きで勝負を制する六つの駆け引き。"
    ],
    tracks: ["FIRST SIN", "False Embrace", "Silent Majority", "Cold Brilliance", "Quiet Authority", "Out of the Deck"],
    art: "covers/silent-sovereign.jpg",
    accent: "amber",
    links: commonListenLinks
  },
  {
    id: "black-coronation",
    artist: "越黒リタ",
    title: "Black Coronation",
    albumNumber: 14,
    release: "2026.06.06",
    story: [
      "硝子の聖域が軋み、神を拒む玉座に黒い王冠が掲げられる。",
      "均衡のひびから創造の裏側を覗く、戴冠のための六つの宣言。"
    ],
    tracks: ["存在圧", "硝子の聖域", "均衡のひび", "創造の裏側", "神を拒む玉座", "黒の戴冠"],
    art: "covers/black-coronation.jpg",
    accent: "crimson",
    links: commonListenLinks
  },
  {
    id: "cathedral-of-masks",
    artist: "越黒リタ",
    title: "Cathedral of Masks",
    albumNumber: 15,
    release: "2026.06.20",
    story: [
      "仮面の聖堂に、微笑のヴェールと恩寵の歌が満ちてゆく。",
      "純白の策略と退廃が交わる、沈黙の核心へ捧げる六つの聖歌。"
    ],
    tracks: ["微笑のヴェール", "恩寵のアリア", "純白のストラテジー", "退廃のセレナーデ", "沈黙のグラヴィティ", "ホロウ・コア"],
    art: "covers/cathedral-of-masks.jpg",
    accent: "amber",
    links: commonListenLinks
  },
  {
    id: "crown-of-jewel",
    artist: "越黒リタ",
    title: "Crown of Jewel",
    albumNumber: 16,
    release: "2026.07.03",
    story: [
      "砕け散る光の中で、六色の宝石がひとつの王冠を形づくる。",
      "深淵の蒼、夢見る紫、虚無の黒までを巡る煌めきの組曲。"
    ],
    tracks: ["Diamond Edge", "Ruby Heart", "Abyss Sapphire", "Emerald Eye", "Amethyst Dream", "Onyx Void"],
    art: "covers/crown-of-jewel.jpg",
    accent: "purple",
    links: commonListenLinks
  },
  {
    id: "lune-noire",
    artist: "越黒リタ",
    title: "Lune Noire",
    albumNumber: 17,
    release: "2026.07.17",
    story: [
      "黒い月が昇るとき、ふたつの蝕と深紅の本能が重なり合う。",
      "蒼い誘惑と静かな不在を抱く、月夜のための六つの夢。"
    ],
    tracks: ["Crescent Desire", "Dual Eclipse", "Lunar Ecstasy", "Azure Temptation", "Crimson Instinct", "Silent Absence"],
    art: "covers/lune-noire.jpg",
    accent: "blue",
    links: commonListenLinks
  },
  {
    id: "hollow-salvation",
    artist: "CROVEIL",
    title: "Hollow Salvation",
    release: "2026.04.16",
    order: 18,
    story: ["空洞の救済を掲げる十字架が、紫紺の廃都を照らす。", "欲望と権威、罪の王冠が咲かせる六つの毒花。"],
    tracks: ["Desire", "Nightfall Authority", "Nocturne Masquerade", "Obsidian Puppet", "Crown of Sin", "Venom Bloom"],
    art: "covers/hollow-salvation.jpg",
    accent: "purple",
    links: commonListenLinks
  },
  {
    id: "crimson-covenant",
    artist: "CROVEIL",
    title: "Crimson Covenant",
    release: "2026.05.21",
    order: 19,
    story: ["深紅の契約が交わされ、壊れた楽園にまだ声が響く。", "虚栄と証明、忘却へ沈む誓約を刻んだ六つの記録。"],
    tracks: ["Black Covenant", "Corrupted Wonderland", "Vanity Paradox", "Still Calling", "Scarlet Proof", "Crimson Oblivion"],
    art: "covers/crimson-covenant.jpg",
    accent: "purple",
    links: commonListenLinks
  },
  {
    id: "trace-of-perfume",
    artist: "越黒リタ",
    title: "Trace of Perfume",
    albumNumber: 18,
    release: "2026.08.08",
    order: 20,
    story: ["花と果実の香りがほどけ、触れないまま心の輪郭をなぞる。", "シトラスからアンバーへ移ろう、六つの香調で描く残像。"],
    tracks: ["シトラスの気配", "フローラルの鼓動", "オリエンタルの残響", "ジャスミンの微熱", "ムスクの衝動", "アンバーの余香"],
    art: "covers/trace-of-perfume.jpg",
    accent: "rose",
    links: commonListenLinks
  },
  {
    id: "fatal-allure",
    artist: "越黒リタ",
    title: "Fatal Allure",
    albumNumber: 19,
    release: "2026.08.27",
    order: 21,
    story: ["白に触れた瞬間、甘美な依存が理性の輪郭を侵していく。", "飽和する衝動と残効に溺れる、逃れられない六つの誘惑。"],
    tracks: ["白に触れた瞬間", "輪郭を侵すもの", "甘美なる依存", "飽和する衝動", "断裂する理性", "残効に溺れる"],
    art: "covers/fatal-allure.jpg",
    accent: "rose",
    links: commonListenLinks
  },
  {
    id: "dissonance-cry",
    artist: "CROVEIL",
    title: "Dissonance Cry",
    release: "",
    order: 22,
    story: ["機械仕掛けの鎮魂歌が、砕けた時計と人工の花を震わせる。", "不協和の輪を抜け、廃墟の鼓動へ辿り着く六つの残響。"],
    tracks: ["Mechanical Requiem", "Artificial Bloom", "Dissonance Loop", "Pulse of Ruin", "Abyssal Wonderland", "R'"],
    art: "covers/dissonance-cry.jpg",
    accent: "blue",
    links: commonListenLinks
  },
  {
    id: "higan-zankyo",
    artist: "CROVEIL",
    title: "彼岸残響",
    release: "",
    order: 23,
    story: ["紅い月の彼岸で、影と灯が藤の花へ滲んでゆく。", "常闇、狐火、朧月を渡る和の残響を封じた六景。"],
    tracks: ["影滲ノ灯", "影間", "常闇ノ華", "狐火誘", "朧月残影", "彼岸ノ残華"],
    art: "covers/higan-zankyo.jpg",
    accent: "purple",
    links: commonListenLinks
  },
  {
    id: "fallen-sanctuary",
    artist: "CROVEIL",
    title: "Fallen Sanctuary",
    release: "",
    order: 24,
    story: ["堕ちた聖域で、遺物と甘い幻が黒い翼を目覚めさせる。", "夜の口づけから楽園の終焉へ連なる六つの黙示。"],
    tracks: ["Relic", "Sweet Delusion", "Nocturnal Kiss", "Black Resonance", "Deep Forest", "Edenfall"],
    art: "covers/fallen-sanctuary.jpg",
    accent: "purple",
    links: commonListenLinks
  },
  {
    id: "elegy-of-night",
    artist: "越黒リタ",
    title: "Elegy of Night",
    albumNumber: 20,
    release: "",
    order: 25,
    story: ["月影に誘われた祈りが、黒薔薇の静寂へ消えてゆく。", "夜を裂く微熱と薄明を綴る、忘れられない六つの哀歌。"],
    tracks: ["消えない残響", "月影に誘われて", "白い祈り", "黒薔薇の静寂", "夜を裂く微熱", "薄明に消える"],
    art: "covers/elegy-of-night.jpg",
    accent: "blue",
    links: commonListenLinks
  },
  {
    id: "danse-macabre",
    artist: "越黒リタ",
    title: "Danse Macabre",
    albumNumber: 21,
    release: "",
    order: 26,
    story: ["月下の広間に棺が置かれ、仮面の舞踏会が静かに始まる。", "白薔薇と血染めの祝祭が終焉へ巡る、六つの輪舞曲。"],
    tracks: ["月下の舞踏会", "仮面越しのくちづけ", "白薔薇の円舞曲", "血染めの祝祭", "棺のララバイ", "終焉の輪舞曲"],
    art: "covers/danse-macabre.jpg",
    accent: "blue",
    links: commonListenLinks
  },
  {
    id: "rosarium-noir",
    artist: "越黒リタ",
    title: "Rosarium Noir",
    albumNumber: 22,
    release: "",
    order: 27,
    story: ["黒薔薇の聖堂で、硝子の楽園と真夜中の人形が目を覚ます。", "電圧を帯びた花弁と深紅の夜想曲を束ねる六つの祈り。"],
    tracks: ["Rose Riot", "Velvet Voltage", "Glass Eden", "Veil Rosary", "Midnight Doll", "Scarlet Nocturne"],
    art: "covers/rosarium-noir.jpg",
    accent: "rose",
    links: commonListenLinks
  },
  {
    id: "marionette-garden",
    artist: "越黒リタ",
    title: "Marionette Garden",
    albumNumber: 23,
    release: "",
    order: 28,
    story: [
      "月光の聖堂で、糸に繋がれた人形たちが静かに奏で始める。",
      "壊れた王冠と祈りを抱く、退廃の庭園に咲いた六つの物語。"
    ],
    tracks: ["Marionette Cry", "Lace Syndrome", "Broken Tiara", "Moonveil Garden", "Puppet Religion", "Last Marionette"],
    art: "covers/marionette-garden.jpg",
    accent: "blue",
    links: commonListenLinks
  },
  {
    id: "beautiful-nightmare",
    artist: "越黒リタ",
    title: "Beautiful Nightmare",
    albumNumber: 24,
    release: "",
    order: 29,
    story: [
      "砕けた月と無数の扉が、忘れられた名前を悪夢へ誘う。",
      "目覚めたくないほど美しい夜を巡る、六つの幻影。"
    ],
    tracks: ["Phantom Parade", "Silent Promise", "Forgotten Name", "Garden of Oblivion", "Eternal Moon", "Beautiful Lie"],
    art: "covers/beautiful-nightmare.jpg",
    accent: "blue",
    links: commonListenLinks
  },
  {
    id: "persona",
    artist: "越黒リタ",
    title: "PERSONA",
    albumNumber: 25,
    release: "",
    order: 30,
    story: [
      "五つの個性が紫の聖堂へ集い、ひとつの音像として目を覚ます。",
      "王座、残響、衝動、影、そして黒翼を刻む六つの肖像。"
    ],
    tracks: ["Crimson Throne", "Twilight Resonance", "Scarlet Ignition…", "Silent Shadow", "Butterfly Tempest", "黒翼ノ夜明ケ。"],
    art: "covers/persona.jpg",
    accent: "purple",
    links: commonListenLinks
  },
  {
    id: "vanishing-reverie",
    artist: "越黒リタ",
    title: "Vanishing Reverie",
    albumNumber: 26,
    release: "",
    order: 31,
    story: [
      "薄明と星夜の境界で、失われた夢が静かにほどけてゆく。",
      "枯れた湖と忘れられた楽園を辿る、消えゆく世界への六つの追憶。"
    ],
    tracks: ["夢の抜け殻", "沈黙の森", "枯れた湖", "忘れられた楽園", "黄昏に還るように", "消えゆく星"],
    art: "covers/vanishing-reverie.jpg",
    accent: "blue",
    links: commonListenLinks
  },
  {
    id: "yugatou",
    artist: "CROVEIL",
    title: "誘蛾灯",
    release: "",
    order: 32,
    story: [
      "月下の灯へ引き寄せられた羽が、甘い毒を纏って夜を舞う。",
      "快楽と飢え、蜜と檻の間で微睡む六つの黒い衝動。"
    ],
    tracks: ["月下毒", "快楽飢餓", "蜜の檻", "宵待ち", "蝶毒", "微睡み"],
    art: "covers/yugatou.jpg",
    accent: "purple",
    links: commonListenLinks
  }
];

// 発売日未定作品を先頭に、その後は発売日の新しい順で表示します。
albums.sort((a, b) => {
  if (!a.release && !b.release) return (b.order || b.albumNumber || 0) - (a.order || a.albumNumber || 0);
  if (!a.release) return -1;
  if (!b.release) return 1;
  return b.release.localeCompare(a.release) || (b.order || b.albumNumber || 0) - (a.order || a.albumNumber || 0);
});

const cover = (album, index, large = false) => `
  <button class="cover-button${large ? " cover-large" : ""}" data-album-id="${album.id}" aria-label="${album.title} の詳細を見る">
    <span class="cover-art art-${album.accent} has-image" style="background-image:url('${album.art}')"><i>${index + 1}</i><b>${album.title}</b></span>
    ${large ? "" : `<span class="hover-title">${album.title}</span>`}
  </button>`;

const latest = albums.find(album => album.release);
document.getElementById("latest-display").innerHTML = `
  ${cover(latest, 0, true)}
  <div class="latest-copy">
    <p class="artist">${latest.artist}</p><h3>${latest.title}</h3>
    <p class="release">RELEASE · ${latest.release}</p>
    <p class="story-lead">${latest.story.join(" ")}</p>
    <button class="text-link" data-album-id="${latest.id}">View the artwork <span>↗</span></button>
  </div>`;

document.getElementById("collection-count").textContent = String(albums.length).padStart(2, "0") + " WORKS";
const ordinal = number => {
  const mod100 = number % 100;
  const suffix = mod100 >= 11 && mod100 <= 13 ? "TH" : number % 10 === 1 ? "ST" : number % 10 === 2 ? "ND" : number % 10 === 3 ? "RD" : "TH";
  return number + suffix;
};
const cardMeta = album => album.albumNumber ? `${ordinal(album.albumNumber)} ALBUM` : "CROVEIL ARCHIVE";

function renderGallery(filter = "all") {
  const visible = albums.filter(album => filter === "all" || album.artist === filter);
  document.getElementById("album-grid").innerHTML = visible.map(album => `<article class="album-card archive-card" data-artist="${album.artist}">
    ${cover(album, albums.indexOf(album))}
    <div class="card-caption"><p>${album.artist}</p><h3>${album.title}</h3><div class="work-data"><b>${cardMeta(album)}</b><time>${album.release || "DATE TBA"}</time></div></div>
  </article>`).join("");
}
renderGallery();

const exhibitionTrack = document.getElementById("exhibition-track");
const exhibitionSpace = document.getElementById("exhibition-space");
const orbitPosition = document.getElementById("orbit-position");

function renderExhibition() {
  exhibitionSpace.innerHTML = albums.map((album, index) => {
    const column = Math.floor(index / 3);
    const row = index % 3;
    const x = 70 + column * 292 + ((index * 37) % 76);
    const y = 24 + row * 195 + ((index * 53) % 54);
    const size = 150 + ((index * 29) % 68);
    const delay = -((index * 0.37) % 5).toFixed(2);
    return `
    <article class="orbit-card" style="--x:${x}px;--y:${y}px;--size:${size}px;--delay:${delay}s" data-orbit-index="${index}" data-artist="${album.artist}">
      <button class="orbit-cover" data-album-id="${album.id}" aria-label="${album.title} の詳細を見る">
        <img src="${album.art}" alt="${album.title} ジャケット" draggable="false">
      </button>
      <div class="orbit-caption">
        <p>${album.artist}</p><h3>${album.title}</h3>
        <div><b>${cardMeta(album)}</b><time>${album.release || "DATE TBA"}</time></div>
      </div>
    </article>`;
  }).join("");
  orbitPosition.textContent = `${String(albums.length).padStart(2, "0")} WORKS`;
}
renderExhibition();

document.querySelector(".orbit-arrow.prev").addEventListener("click", () => exhibitionTrack.scrollBy({left:-exhibitionTrack.clientWidth * .72, behavior:"smooth"}));
document.querySelector(".orbit-arrow.next").addEventListener("click", () => exhibitionTrack.scrollBy({left:exhibitionTrack.clientWidth * .72, behavior:"smooth"}));
exhibitionTrack.addEventListener("keydown", event => {
  if (event.key === "ArrowLeft") { event.preventDefault(); exhibitionTrack.scrollBy({left:-420, behavior:"smooth"}); }
  if (event.key === "ArrowRight") { event.preventDefault(); exhibitionTrack.scrollBy({left:420, behavior:"smooth"}); }
});
exhibitionTrack.addEventListener("wheel", event => {
  if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) { event.preventDefault(); exhibitionTrack.scrollLeft += event.deltaY; }
}, {passive:false});

let dragStart = 0, scrollStart = 0, dragged = false, orbitSuppressUntil = 0;
exhibitionTrack.addEventListener("pointerdown", event => {
  dragStart = event.clientX; scrollStart = exhibitionTrack.scrollLeft; dragged = false;
  exhibitionTrack.classList.add("dragging"); exhibitionTrack.setPointerCapture(event.pointerId);
});
exhibitionTrack.addEventListener("pointermove", event => {
  if (!exhibitionTrack.hasPointerCapture(event.pointerId)) return;
  const distance = event.clientX - dragStart; if (Math.abs(distance) > 7) dragged = true;
  exhibitionTrack.scrollLeft = scrollStart - distance;
});
exhibitionTrack.addEventListener("pointerup", event => {
  if (exhibitionTrack.hasPointerCapture(event.pointerId)) exhibitionTrack.releasePointerCapture(event.pointerId);
  exhibitionTrack.classList.remove("dragging");
  if (dragged) orbitSuppressUntil = Date.now() + 300;
});

const modal = document.getElementById("album-modal");
const panel = modal.querySelector(".modal-panel");
const art = document.getElementById("modal-art");
let currentIndex = 0;
let lastFocus = null;
const fields = {
  artist: document.getElementById("modal-artist"), title: document.getElementById("modal-title"),
  release: document.getElementById("modal-release"), story: document.getElementById("modal-story"),
  tracks: document.getElementById("modal-tracks"), links: document.getElementById("modal-links"),
  number: document.getElementById("modal-number"), coverTitle: document.getElementById("modal-cover-title"),
  position: document.getElementById("modal-position")
};

function renderModal(index) {
  currentIndex = (index + albums.length) % albums.length;
  const album = albums[currentIndex];
  fields.artist.textContent = album.artist;
  fields.title.textContent = album.title;
  const numberLabel = album.albumNumber ? ordinal(album.albumNumber) + " ALBUM · " : "";
  fields.release.textContent = numberLabel + (album.release ? "RELEASE · " + album.release : "COMING SOON");
  fields.number.textContent = String(currentIndex + 1).padStart(2, "0");
  fields.coverTitle.textContent = album.title;
  fields.position.textContent = String(currentIndex + 1).padStart(2, "0") + " / " + String(albums.length).padStart(2, "0");
  fields.story.replaceChildren(...album.story.map(line => { const p = document.createElement("p"); p.textContent = line; return p; }));
  fields.tracks.replaceChildren(...album.tracks.map((track, i) => { const li = document.createElement("li"); li.innerHTML = `<span>${String(i + 1).padStart(2, "0")}</span><b></b>`; li.querySelector("b").textContent = track; return li; }));
  fields.links.replaceChildren();
  const labels = {spotify:"Spotify", apple:"Apple Music", youtube:"YouTube Music", amazon:"Amazon Music", xfd:"XFD"};
  Object.entries(labels).forEach(([key, label]) => {
    if (!album.links[key]) return;
    const a = document.createElement("a"); a.href = album.links[key]; a.target = "_blank"; a.rel = "noreferrer"; a.textContent = label; a.insertAdjacentHTML("beforeend", "<span>↗</span>"); fields.links.appendChild(a);
  });
  if (!fields.links.children.length) { const p = document.createElement("p"); p.className = "links-pending"; p.textContent = "Streaming links coming soon."; fields.links.appendChild(p); }
  art.className = `cover-art art-${album.accent} has-image`;
  art.style.backgroundImage = `url('${album.art}')`;
  document.querySelector("#modal-prev b").textContent = albums[(currentIndex - 1 + albums.length) % albums.length].title;
  document.querySelector("#modal-next b").textContent = albums[(currentIndex + 1) % albums.length].title;
}

function openModal(id) {
  const index = albums.findIndex(album => album.id === id); if (index < 0) return;
  lastFocus = document.activeElement; renderModal(index); modal.hidden = false;
  requestAnimationFrame(() => { modal.classList.add("open"); panel.scrollTop = 0; modal.querySelector(".modal-close").focus(); });
  document.body.classList.add("modal-open");
}
function closeModal() {
  modal.classList.remove("open"); document.body.classList.remove("modal-open");
  setTimeout(() => { modal.hidden = true; if (lastFocus) lastFocus.focus(); }, 350);
}

document.addEventListener("click", event => { const button = event.target.closest("[data-album-id]"); if (button && Date.now() > orbitSuppressUntil) openModal(button.dataset.albumId); });
document.querySelectorAll("[data-close-modal]").forEach(button => button.addEventListener("click", closeModal));
document.getElementById("modal-prev").addEventListener("click", () => renderModal(currentIndex - 1));
document.getElementById("modal-next").addEventListener("click", () => renderModal(currentIndex + 1));
document.addEventListener("keydown", event => {
  if (modal.hidden) return;
  if (event.key === "Escape") closeModal();
  if (event.key === "ArrowLeft") renderModal(currentIndex - 1);
  if (event.key === "ArrowRight") renderModal(currentIndex + 1);
});
document.querySelectorAll(".filter").forEach(button => button.addEventListener("click", () => {
  document.querySelectorAll(".filter").forEach(item => { const active = item === button; item.classList.toggle("active", active); item.setAttribute("aria-selected", String(active)); });
  renderGallery(button.dataset.filter);
}));
