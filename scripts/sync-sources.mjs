import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { games, videos } from '../src/data.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const generatedDir = path.join(root, 'src', 'generated');
const appleTarget = path.join(generatedDir, 'apple-charts.json');
const discoveryTarget = path.join(generatedDir, 'discovery-feeds.json');
const pulseTarget = path.join(generatedDir, 'game-pulse.json');
const userAgent = 'PlayScoutDataBot/1.0 (+https://jasonwaker.github.io/playscout/about/sources/)';
const country = (process.env.APPLE_COUNTRY || 'us').toLowerCase();
const limit = Math.min(Math.max(Number(process.env.APPLE_CHART_LIMIT || 25), 10), 100);
const chartPath = { free: 'topfreeapplications', paid: 'toppaidapplications', grossing: 'topgrossingapplications' };
const endpoint = type => `https://itunes.apple.com/${country}/rss/${chartPath[type]}/limit=${limit}/genre=6014/json`;
const releaseEndpoint = `https://itunes.apple.com/${country}/rss/newapplications/limit=100/genre=6014/json`;
const gamerPowerEndpoint = 'https://www.gamerpower.com/api/giveaways?sort-by=date';
const freeToGameEndpoint = 'https://www.freetogame.com/api/games?sort-by=release-date';
const knownGames = new Map([
  ['whiteout survival','whiteout-survival'],['monopoly go!','monopoly-go'],['pokémon go','pokemon-go'],['pokemon go','pokemon-go'],
  ['roblox','roblox'],['minecraft: play with friends','minecraft'],['minecraft','minecraft'],['royal match','royal-match'],
  ['bloons td 6','bloons-td-6'],['stardew valley','stardew-valley'],['kingshot','kingshot'],['plague inc.','plague-inc'],
  ['geometry dash','geometry-dash'],['candy crush saga','candy-crush-saga'],
]);

async function getJson(url) {
  const response = await fetch(url, { headers: { 'user-agent': userAgent, accept: 'application/json' } });
  if (!response.ok) throw new Error(`${url} returned HTTP ${response.status}`);
  return response.json();
}

async function readPrevious(file) {
  try { return JSON.parse(await readFile(file, 'utf8')); } catch { return null; }
}

const cleanText = value => String(value || '').replace(/\s+/g, ' ').trim();

function normalizeApple(result, rank) {
  const name = result?.['im:name']?.label;
  const images = result?.['im:image'] || [];
  return {
    id: String(result?.id?.attributes?.['im:id'] || ''),
    name,
    developer: result?.['im:artist']?.label || '',
    artworkUrl: images.at(-1)?.label || '',
    storeUrl: result?.id?.label || '',
    releaseDate: result?.['im:releaseDate']?.label || null,
    genres: [result?.category?.attributes?.label || 'Games'],
    rank,
    platform: 'iOS/iPadOS',
    storefront: 'Apple App Store',
    localSlug: knownGames.get(String(name).toLowerCase()) || null,
  };
}

async function fetchChart(type) {
  const payload = await getJson(endpoint(type));
  const results = payload?.feed?.entry;
  if (!Array.isArray(results)) throw new Error(`${type} chart response has no entries`);
  return {
    title: payload.feed.title?.label || `Top ${type} games`,
    sourceUrl: endpoint(type),
    feedUpdated: payload.feed.updated?.label || null,
    entries: results.map((item, index) => ({ ...normalizeApple(item, index + 1), discoveredVia:`Top ${type}`, sourceUrl:endpoint(type) })).filter(item => item.id && item.name),
  };
}

async function fetchReleases() {
  const payload = await getJson(releaseEndpoint);
  const entries = payload?.feed?.entry;
  if (!Array.isArray(entries)) throw new Error('new releases response has no entries');
  const gamesOnly = entries.filter(item => item?.category?.attributes?.label === 'Games').map((item, index) => ({ ...normalizeApple(item, index + 1), discoveredVia:'New applications', sourceUrl:releaseEndpoint }));
  if (!gamesOnly.length) throw new Error('new releases feed returned no Games entries');
  return { title: payload.feed.title?.label || 'New applications', sourceUrl: releaseEndpoint, feedUpdated: payload.feed.updated?.label || null, scopeNote: 'Apple New Applications feed filtered to entries whose primary category is Games.', entries: gamesOnly };
}

async function syncApple() {
  const previous = await readPrevious(appleTarget);
  try {
    const [free, paid, grossing, releases] = await Promise.all([fetchChart('free'), fetchChart('paid'), fetchChart('grossing'), fetchReleases()]);
    if (!free.entries.length || !paid.entries.length || !grossing.entries.length) throw new Error('Apple feeds returned an incomplete chart set');
    releases.entries = [...new Map([...releases.entries, ...free.entries, ...paid.entries, ...grossing.entries].map(item => [item.id, item])).values()]
      .filter(item => item.releaseDate)
      .sort((a,b) => String(b.releaseDate).localeCompare(String(a.releaseDate)))
      .slice(0, 25);
    releases.sourceUrl = 'https://rss.marketingtools.apple.com/';
    releases.scopeNote = 'Recent games discovered across Apple New Applications and live US Games charts, deduplicated and sorted by the App Store release date.';
    const payload = {
      schemaVersion: 2,
      provider: 'Apple Marketing Tools RSS',
      country: country.toUpperCase(),
      platform: 'iOS/iPadOS',
      storefront: 'Apple App Store',
      fetchedAt: new Date().toISOString(),
      scopeNote: 'United States iOS/iPadOS App Store Games category (genre 6014). This dataset contains no Android rankings. Rank is the position returned by Apple.',
      charts: { free, paid, grossing },
      releases,
    };
    await writeFile(appleTarget, `${JSON.stringify(payload, null, 2)}\n`);
    console.log(`Synced ${free.entries.length} free, ${paid.entries.length} paid, ${grossing.entries.length} grossing and ${releases.entries.length} new iOS games from Apple.`);
    return payload;
  } catch (error) {
    if (previous?.charts?.free?.entries?.length && previous?.charts?.paid?.entries?.length && previous?.charts?.grossing?.entries?.length && previous?.releases?.entries?.length) {
      console.warn(`Apple sync failed; keeping cached data from ${previous.fetchedAt}: ${error.message}`);
      return previous;
    } else throw error;
  }
}

async function fetchGiveaways() {
  const payload = await getJson(gamerPowerEndpoint);
  if (!Array.isArray(payload)) throw new Error('GamerPower response has no active giveaway array');
  const today = Date.now();
  return payload.map(item => ({
    id: String(item.id), title: item.title, worth: item.worth || 'Value not listed', thumbnailUrl: item.thumbnail,
    description: cleanText(item.description), sourceUrl: item.gamerpower_url, claimUrl: item.open_giveaway_url || item.open_giveaway,
    publishedAt: item.published_date, endsAt: item.end_date, type: item.type,
    platforms: String(item.platforms || '').split(',').map(value => value.trim()).filter(Boolean),
    users: Number(item.users || 0), status: item.status,
  })).filter(item => {
    if (!item.id || !item.title || !item.thumbnailUrl || !item.sourceUrl || item.status !== 'Active') return false;
    if (!item.endsAt || /n\/a|unknown/i.test(item.endsAt)) return true;
    const endTime = new Date(item.endsAt.replace(' ', 'T') + 'Z').valueOf();
    return Number.isNaN(endTime) || endTime >= today;
  }).slice(0, 30);
}

async function fetchFreeGames() {
  const payload = await getJson(freeToGameEndpoint);
  if (!Array.isArray(payload)) throw new Error('FreeToGame response has no game array');
  return payload.slice(0, 40).map(item => ({
    id: String(item.id), title: item.title, thumbnailUrl: item.thumbnail, description: cleanText(item.short_description),
    gameUrl: item.game_url, sourceUrl: item.freetogame_profile_url, genre: item.genre, platform: item.platform,
    publisher: item.publisher, developer: item.developer, releaseDate: item.release_date,
  })).filter(item => item.id && item.title && item.thumbnailUrl && item.sourceUrl);
}

async function syncDiscovery() {
  const previous = await readPrevious(discoveryTarget);
  const results = await Promise.allSettled([fetchGiveaways(), fetchFreeGames()]);
  const giveaways = results[0].status === 'fulfilled' && results[0].value.length ? results[0].value : previous?.giveaways?.entries;
  const freeGames = results[1].status === 'fulfilled' && results[1].value.length ? results[1].value : previous?.freeGames?.entries;
  if (!giveaways?.length || !freeGames?.length) {
    const reasons = results.filter(result => result.status === 'rejected').map(result => result.reason.message).join('; ');
    throw new Error(`Discovery sync incomplete and no usable cache exists: ${reasons || 'empty response'}`);
  }
  const now = new Date().toISOString();
  const payload = {
    schemaVersion: 1,
    fetchedAt: now,
    giveaways: {
      provider: 'GamerPower', sourceUrl: 'https://www.gamerpower.com/api-read', endpoint: gamerPowerEndpoint,
      fetchedAt: results[0].status === 'fulfilled' ? now : previous.giveaways.fetchedAt,
      scopeNote: 'Active giveaways, full games, in-game loot and beta access across listed platforms. Platform labels come from GamerPower; this is not a store ranking.',
      entries: giveaways,
    },
    freeGames: {
      provider: 'FreeToGame', sourceUrl: 'https://www.freetogame.com/api-doc', endpoint: freeToGameEndpoint,
      fetchedAt: results[1].status === 'fulfilled' ? now : previous.freeGames.fetchedAt,
      scopeNote: 'Free-to-play PC and browser game directory sorted by the provider release-date feed. This is not an iOS or Android chart.',
      entries: freeGames,
    },
  };
  await writeFile(discoveryTarget, `${JSON.stringify(payload, null, 2)}\n`);
  console.log(`Synced ${giveaways.length} active offers from GamerPower and ${freeGames.length} free-to-play games from FreeToGame.`);
  for (const result of results) if (result.status === 'rejected') console.warn(`One discovery source used its cached snapshot: ${result.reason.message}`);
}

const playbookByGenre = [
  [/strategy|simulation|board/i, {
    playStyle:'Progress comes from reading objectives, sequencing upgrades and protecting scarce resources for the moments that return the most value.',
    tips:['Finish the tutorial before spending premium currency.','Keep one reserve of speedups or consumables until event rules are clear.','Join an active group early and compare advice with the current game version.'],
  }],
  [/puzzle|card|trivia|word/i, {
    playStyle:'The core loop rewards pattern recognition, deliberate use of limited tools and learning why a failed attempt ran out of options.',
    tips:['Read the objective before making the first move.','Save boosters for boards where they remove a specific blocker.','After a loss, change one decision instead of repeating the same opening.'],
  }],
  [/action|adventure|role|rpg|arcade/i, {
    playStyle:'Expect short action or exploration loops that turn practice, equipment choices and route knowledge into more consistent progress.',
    tips:['Test controls and camera settings before a long session.','Upgrade the tool or ability used most often first.','Replay a short section to learn timing before using rare recovery items.'],
  }],
  [/music|rhythm/i, {
    playStyle:'Timing, pattern memory and short repeatable practice sessions drive progress more than rapid spending or long grinding sessions.',
    tips:['Calibrate audio and input timing first.','Practice difficult transitions in short loops.','Pause after repeated misses so timing does not become rushed.'],
  }],
];

function pulseCopy(item, meta) {
  const description = cleanText(meta?.description);
  const inferredGenre = [
    [/puzzle|escape room|riddle|mystery/i,'Puzzle'],[/role.playing|\brpg\b/i,'Role Playing'],[/strategy|tactical|build and manage/i,'Strategy'],
    [/adventure|story.driven/i,'Adventure'],[/rhythm|music/i,'Music'],[/action|battle|combat/i,'Action'],[/casual|relax/i,'Casual'],
  ].find(([pattern]) => pattern.test(description))?.[1];
  const genre = meta?.genres?.find(value => value !== 'Games') || (meta?.primaryGenreName !== 'Games' ? meta?.primaryGenreName : null) || inferredGenre || item.genres?.find(value => value !== 'Games') || 'Games';
  const guide = playbookByGenre.find(([pattern]) => pattern.test(`${genre} ${meta?.genres?.join(' ') || ''}`))?.[1] || {
    playStyle:'Start with the tutorial and first complete play loop, then decide whether the game rewards skill, collection, planning or repeated short sessions.',
    tips:['Complete one full session before making purchases.','Check settings, accessibility and account-link options early.','Treat community tips as version-specific until reproduced in your game.'],
  };
  const developer = meta?.artistName || item.developer || 'its developer';
  const descriptor = genre === 'Games' ? 'game' : `${/^[aeiou]/i.test(genre) ? 'an' : 'a'} ${genre.toLowerCase()} title`;
  return {
    genre,
    intro:`${item.name} is ${descriptor} from ${developer}. This briefing uses current App Store metadata to explain what to inspect before investing time or money.`,
    playStyle:guide.playStyle,
    tips:guide.tips,
  };
}

async function fetchAppleMetadata(items) {
  const ids = items.map(item => item.id).filter(Boolean);
  if (!ids.length) return new Map();
  try {
    const payload = await getJson(`https://itunes.apple.com/lookup?id=${ids.join(',')}&country=${country}`);
    return new Map((payload.results || []).map(item => [String(item.trackId), item]));
  } catch (error) {
    console.warn(`Apple metadata enrichment failed: ${error.message}`);
    return new Map();
  }
}

async function fetchYoutubeStats(items) {
  const key = process.env.YOUTUBE_API_KEY;
  const ids = items.map(item => item.video?.id).filter(Boolean);
  if (!key || !ids.length) return new Map();
  try {
    const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${ids.join(',')}&key=${encodeURIComponent(key)}`;
    const payload = await getJson(url);
    return new Map((payload.items || []).map(item => [item.id, { views:Number(item.statistics?.viewCount || 0), likes:Number(item.statistics?.likeCount || 0), channel:item.snippet?.channelTitle || null }]));
  } catch (error) {
    console.warn(`YouTube statistics enrichment failed: ${error.message}`);
    return new Map();
  }
}

async function findYoutubeVideo(item) {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return null;
  try {
    const query = `${item.name} gameplay tips guide`;
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoEmbeddable=true&safeSearch=moderate&maxResults=3&order=relevance&q=${encodeURIComponent(query)}&key=${encodeURIComponent(key)}`;
    const payload = await getJson(url);
    const result = (payload.items || []).find(entry => entry.id?.videoId && entry.snippet?.title);
    if (!result) return null;
    return {
      type:'video', id:result.id.videoId, title:cleanText(result.snippet.title),
      channel:cleanText(result.snippet.channelTitle), duration:null,
      url:`https://www.youtube.com/watch?v=${result.id.videoId}`,
      thumbnailUrl:result.snippet.thumbnails?.high?.url || result.snippet.thumbnails?.medium?.url || `https://i.ytimg.com/vi/${result.id.videoId}/hqdefault.jpg`,
    };
  } catch (error) {
    console.warn(`YouTube match failed for ${item.name}: ${error.message}`);
    return null;
  }
}

async function syncPulse(apple) {
  const previous = await readPrevious(pulseTarget);
  try {
    const newest = apple.releases.entries.slice(0, 3).map(item => ({ ...item, kind:'new' }));
    const used = new Set(newest.map(item => item.id));
    const hottest = apple.charts.grossing.entries.filter(item => !used.has(item.id)).slice(0, 3).map(item => ({ ...item, kind:'hot' }));
    const selected = [...newest, ...hottest];
    if (newest.length !== 3 || hottest.length !== 3) throw new Error('Could not select three new and three hot games');
    const metadata = await fetchAppleMetadata(selected);
    const catalog = new Map(games.map(item => [item.slug, item]));
    const videoMap = new Map(videos.map(item => [item.game, item]));
    const previousItems = new Map((previous?.items || []).map(item => [item.id, item]));
    const searchedVideos = new Map((await Promise.all(selected.map(async item => {
      if (item.localSlug && videoMap.has(item.localSlug)) return [item.id, null];
      const cached = previousItems.get(`${item.kind}-${item.id}`)?.video;
      if (cached?.type === 'video') return [item.id, cached];
      return [item.id, await findYoutubeVideo(item)];
    }))).filter(([,video]) => video));
    const items = selected.map(item => {
      const meta = metadata.get(item.id);
      const copy = pulseCopy(item, meta);
      const local = item.localSlug ? catalog.get(item.localSlug) : null;
      const knownVideo = item.localSlug ? videoMap.get(item.localSlug) : null;
      const video = knownVideo ? {
        type:'video', id:knownVideo.id, title:knownVideo.title, channel:knownVideo.channel,
        duration:knownVideo.duration, url:`https://www.youtube.com/watch?v=${knownVideo.id}`,
        thumbnailUrl:`https://i.ytimg.com/vi/${knownVideo.id}/hqdefault.jpg`,
      } : searchedVideos.get(item.id) || {
        type:'search', id:null, title:`Find ${item.name} gameplay and player tips`, channel:'YouTube search', duration:null,
        url:`https://www.youtube.com/results?search_query=${encodeURIComponent(`${item.name} gameplay tips guide`)}`,
        thumbnailUrl:item.artworkUrl,
      };
      return {
        id:`${item.kind}-${item.id}`, kind:item.kind, name:item.name, developer:item.developer,
        artworkUrl:meta?.artworkUrl512 || meta?.artworkUrl100 || item.artworkUrl, storeUrl:item.storeUrl, localSlug:item.localSlug,
        genre:copy.genre, releaseDate:item.releaseDate, rank:item.kind === 'hot' ? item.rank : null,
        rating:meta?.averageUserRating ? Number(meta.averageUserRating.toFixed(1)) : null,
        ratingCount:Number(meta?.userRatingCount || 0), contentRating:meta?.trackContentRating || null,
        intro:local?.summary || copy.intro, playStyle:copy.playStyle, tips:copy.tips, video,
        sourceProvider:'Apple App Store', sourceUrl:item.sourceUrl || item.storeUrl,
        sourceObservedAt:apple.fetchedAt,
        copyOrigin:'Automatically synthesized from current Apple metadata and PlayScout genre playbooks; verify version-specific mechanics in game.',
      };
    });
    const stats = await fetchYoutubeStats(items);
    for (const item of items) if (item.video.id && stats.has(item.video.id)) item.video = { ...item.video, ...stats.get(item.video.id) };
    const payload = {
      schemaVersion:1,
      date:new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date()),
      generatedAt:new Date().toISOString(),
      sourceObservedAt:apple.fetchedAt,
      scopeNote:'Daily editorial briefing: three recent US iOS releases and three current US iOS grossing-chart games. Facts remain linked to Apple; practical tips are automatically synthesized and labelled.',
      items,
    };
    await writeFile(pulseTarget, `${JSON.stringify(payload, null, 2)}\n`);
    console.log('Generated Game Pulse with 3 new and 3 hot game briefings.');
    return payload;
  } catch (error) {
    if (previous?.items?.length === 6) {
      console.warn(`Game Pulse generation failed; keeping cached edition from ${previous.generatedAt}: ${error.message}`);
      return previous;
    }
    throw error;
  }
}

await mkdir(generatedDir, { recursive: true });
const apple = await syncApple();
await Promise.all([syncDiscovery(), syncPulse(apple)]);
