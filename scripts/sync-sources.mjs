import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const generatedDir = path.join(root, 'src', 'generated');
const appleTarget = path.join(generatedDir, 'apple-charts.json');
const discoveryTarget = path.join(generatedDir, 'discovery-feeds.json');
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
  } catch (error) {
    if (previous?.charts?.free?.entries?.length && previous?.charts?.paid?.entries?.length && previous?.charts?.grossing?.entries?.length && previous?.releases?.entries?.length) {
      console.warn(`Apple sync failed; keeping cached data from ${previous.fetchedAt}: ${error.message}`);
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

await mkdir(generatedDir, { recursive: true });
await Promise.all([syncApple(), syncDiscovery()]);
