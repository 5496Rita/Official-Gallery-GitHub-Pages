月別トップイラスト構成
========================

フォルダ
- 00_uncategorized: 無分類
- 01_january ～ 12_december: 各月のトップイラスト

表示方法
1. monthly-hero.js をHTMLから読み込む
2. トップ画像に data-monthly-hero 属性を付ける

例（img）:
  <img data-monthly-hero alt="越黒リタ">
  <script src="monthly-hero.js"></script>

例（背景）:
  <div class="hero" data-monthly-hero></div>
  <script src="monthly-hero.js"></script>

JavaScriptがブラウザの現在月を取得し、その月のフォルダ内画像から1枚をランダム表示します。
静的なGitHub Pagesでも動作するよう、画像一覧はmonthly-hero.js内に埋め込んであります。

枚数
- 01_january: 5枚
- 02_february: 3枚
- 03_march: 3枚
- 04_april: 6枚
- 05_may: 5枚
- 06_june: 5枚
- 07_july: 2枚
- 08_august: 2枚
- 09_september: 3枚
- 10_october: 5枚
- 11_november: 3枚
- 12_december: 3枚
- 00_uncategorized: 15枚

不足
- 07_july: 2枚（目安3枚まであと1枚）
  推奨: 真夏の青空＋向日葵畑、または夜の海辺・夏の月光を強く出した横長イラスト
- 08_august: 2枚（目安3枚まであと1枚）
  推奨: 浴衣＋提灯＋屋台＋大きな打ち上げ花火の横長イラスト

注意
- 同一画像の重複配置はありません。
- 曖昧なゴシック夜景・薔薇・聖堂・ロマンス系は無理に季節へ寄せず無分類にしています。

自動切り替え
------------
- 現在月フォルダ内の画像を約7秒ごとにランダム切り替えします。
- 同じ画像が連続して表示されないようにしています。
- 切り替えは約700msのフェードです。
- 背景heroの場合は画像レイヤーだけをクロスフェードするため、上に載せた文字やボタンは消えません。

速度変更
monthly-hero.js 冒頭の以下を変更してください。
  const MONTHLY_HERO_INTERVAL_MS = 7000; // 切り替え間隔
  const MONTHLY_HERO_FADE_MS = 700;      // フェード時間

例:
  5秒ごと -> 5000
  10秒ごと -> 10000
