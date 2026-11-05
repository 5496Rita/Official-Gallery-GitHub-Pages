(() => {
  if (typeof albums === 'undefined' || !Array.isArray(albums)) return;

  const commonLinks = {
    spotify: "https://open.spotify.com/artist/24ZhFNgFRKfS19yAisfM0Q",
    apple: "https://music.apple.com/jp/artist/%E8%B6%8A%E9%BB%92%E3%83%AA%E3%82%BF/1852020293",
    amazon: "https://music.amazon.com/artists/B0G48Q368M"
  };

  const additions = [
    {
      id: "daemonia",
      artist: "CROVEIL",
      title: "Daemonia",
      reading: "デーモニア",
      release: "",
      order: 1001,
      story: [],
      tracks: [
        "ルシファーの肖像",
        "マモンの空箱",
        "アスモデウスの口づけ",
        "ベルゼブブの晩餐",
        "ベルフェゴールの夢",
        "サタンの白い翼"
      ],
      art: "covers/daemonia.jpg",
      accent: "crimson",
      youtubeId: "",
      links: commonLinks
    },
    {
      id: "glass-abyss",
      artist: "越黒リタ",
      credit: "越黒リタ feat.Suno",
      title: "Glass Abyss",
      reading: "グラス・アビス",
      release: "",
      order: 1002,
      story: [],
      tracks: [
        "Neon Trace",
        "Angel in Blue",
        "Bottom Prayer",
        "Phantom Pulse",
        "Lucent",
        "Betta Noir"
      ],
      art: "covers/glass-abyss.jpg",
      accent: "blue",
      youtubeId: "",
      links: commonLinks
    },
    {
      id: "nocturne-royale",
      artist: "CROVEIL",
      title: "NOCTURNE ROYALE",
      reading: "ノクターン・ロワイヤル",
      release: "",
      order: 1003,
      story: [],
      tracks: [
        "Death in Spades",
        "Hollow Hearts",
        "Diamond Elegy",
        "Royal Betrayal",
        "Joker's Paradox",
        "Beyond the Ace"
      ],
      art: "covers/nocturne-royale.jpg",
      accent: "crimson",
      youtubeId: "",
      links: commonLinks
    },
    {
      id: "marchen-labyrinth",
      artist: "越黒リタ",
      credit: "越黒リタ feat.Suno",
      title: "Märchen Labyrinth",
      reading: "メルヘン・ラビリンス",
      release: "",
      order: 1004,
      story: [],
      tracks: [
        "花咲く牙のワルツ",
        "灰に咲く夜想曲",
        "砂糖細工の悪夢",
        "月下の羽衣",
        "うたかたの残響",
        "白翼のエレジー"
      ],
      art: "covers/marchen-labyrinth.jpg",
      accent: "crimson",
      youtubeId: "",
      links: commonLinks
    }
  ];

  const existing = new Set(albums.map(a => a && a.id));
  for (const album of additions) {
    if (!existing.has(album.id)) albums.push(album);
  }
  window.GALLERY_ALBUMS = albums;
})();
