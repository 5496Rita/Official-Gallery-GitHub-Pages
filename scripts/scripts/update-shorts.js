const fs = require('node:fs');
const path = require('node:path');

const apiKey = process.env.YOUTUBE_API_KEY;
const playlistId = process.env.YOUTUBE_PLAYLIST_ID;

if (!apiKey) {
  throw new Error('YOUTUBE_API_KEY is not set. Add it to GitHub Actions repository secrets.');
}
if (!playlistId) {
  throw new Error('YOUTUBE_PLAYLIST_ID is not set.');
}

async function fetchPlaylistItems() {
  const items = [];
  let pageToken = '';

  do {
    const params = new URLSearchParams({
      part: 'snippet,contentDetails',
      maxResults: '50',
      playlistId,
      key: apiKey
    });
    if (pageToken) params.set('pageToken', pageToken);

    const response = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?${params}`);
    if (!response.ok) {
      const body = await response.text();
      throw new Error(`YouTube API request failed (${response.status}): ${body}`);
    }

    const data = await response.json();
    for (const item of data.items || []) {
      const videoId = item.contentDetails?.videoId || item.snippet?.resourceId?.videoId;
      const title = item.snippet?.title || '';
      if (!videoId || title === 'Deleted video' || title === 'Private video') continue;

      const thumbnails = item.snippet?.thumbnails || {};
      const thumbnail = thumbnails.maxres?.url
        || thumbnails.standard?.url
        || thumbnails.high?.url
        || thumbnails.medium?.url
        || thumbnails.default?.url
        || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

      items.push({
        id: videoId,
        title,
        thumbnail,
        publishedAt: item.snippet?.publishedAt || ''
      });
    }

    pageToken = data.nextPageToken || '';
  } while (pageToken);

  return items;
}

(async () => {
  const items = await fetchPlaylistItems();
  if (!items.length) {
    throw new Error('No playable videos were found in the playlist. Existing data was left unchanged.');
  }

  const output = {
    generatedAt: new Date().toISOString(),
    playlistId,
    count: items.length,
    items
  };

  const outputPath = path.resolve(process.cwd(), 'data', 'shorts.json');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
  console.log(`Updated ${outputPath} with ${items.length} videos.`);
})().catch(error => {
  console.error(error);
  process.exit(1);
});
