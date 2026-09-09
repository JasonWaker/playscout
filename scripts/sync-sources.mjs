import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const target = path.join(root, 'src', 'generated', 'apple-charts.json');
const country = (process.env.APPLE_COUNTRY || 'us').toLowerCase();
const limit = Math.min(Math.max(Number(process.env.APPLE_CHART_LIMIT || 25), 10), 100);
const chartPath = { free: 'topfreeapplications', paid: 'toppaidapplications', grossing: 'topgrossingapplications' };
const endpoint = type => `https://itunes.apple.com/${country}/rss/${chartPath[type]}/limit=${limit}/genre=6014/json`;
const releaseEndpoint = `https://itunes.apple.com/${country}/rss/newapplications/limit=100/genre=6014/json`;
const knownGames = new Map([
  ['whiteout survival','whiteout-survival'],['monopoly go!','monopoly-go'],['pokémon go','pokemon-go'],['pokemon go','pokemon-go'],
  ['roblox','roblox'],['minecraft: play with friends','minecraft'],['minecraft','minecraft'],['royal match','royal-match'],
  ['bloons td 6','bloons-td-6'],['stardew valley','stardew-valley'],['kingshot','kingshot'],['plague inc.','plague-inc'],
  ['geometry dash','geometry-dash'],['candy crush saga','candy-crush-saga'],
]);

function normalize(result, rank) {
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
    localSlug: knownGames.get(String(name).toLowerCase()) || null,
  };
}

async function fetchChart(type) {
  const response = await fetch(endpoint(type), { headers: { 'user-agent': 'PlayScoutDataBot/1.0 (+https://jasonwaker.github.io/playscout/about/sources/)' } });
  if (!response.ok) throw new Error(`${type} chart returned HTTP ${response.status}`);
  const payload = await response.json();
  const results = payload?.feed?.entry;
  if (!Array.isArray(results)) throw new Error(`${type} chart response has no entries`);
  return {
    title: payload.feed.title?.label || `Top ${type} games`,
    sourceUrl: endpoint(type),
    feedUpdated: payload.feed.updated?.label || null,
    entries: results.map((item, index) => ({ ...normalize(item, index + 1), discoveredVia:`Top ${type}`, sourceUrl:endpoint(type) })).filter(item => item.id && item.name),
  };
}

async function fetchReleases() {
  const response = await fetch(releaseEndpoint, { headers: { 'user-agent': 'PlayScoutDataBot/1.0 (+https://jasonwaker.github.io/playscout/about/sources/)' } });
  if (!response.ok) throw new Error(`new releases returned HTTP ${response.status}`);
  const payload = await response.json();
  const entries = payload?.feed?.entry;
  if (!Array.isArray(entries)) throw new Error('new releases response has no entries');
  const gamesOnly = entries.filter(item => item?.category?.attributes?.label === 'Games').map((item, index) => ({ ...normalize(item, index + 1), discoveredVia:'New applications', sourceUrl:releaseEndpoint }));
  if (!gamesOnly.length) throw new Error('new releases feed returned no Games entries');
  return {
    title: payload.feed.title?.label || 'New applications',
    sourceUrl: releaseEndpoint,
    feedUpdated: payload.feed.updated?.label || null,
    scopeNote: 'Apple New Applications feed filtered to entries whose primary category is Games.',
    entries: gamesOnly,
  };
}

let previous = null;
try { previous = JSON.parse(await readFile(target, 'utf8')); } catch {}

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
    schemaVersion: 1,
    provider: 'Apple Marketing Tools RSS',
    country: country.toUpperCase(),
    fetchedAt: new Date().toISOString(),
    scopeNote: 'United States App Store Games category (genre 6014). Rank is the position returned by the Apple feed.',
    charts: { free, paid, grossing },
    releases,
  };
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, `${JSON.stringify(payload, null, 2)}\n`);
  console.log(`Synced ${free.entries.length} free, ${paid.entries.length} paid, ${grossing.entries.length} grossing and ${releases.entries.length} new games from Apple.`);
} catch (error) {
  if (previous?.charts?.free?.entries?.length && previous?.charts?.paid?.entries?.length && previous?.charts?.grossing?.entries?.length && previous?.releases?.entries?.length) {
    console.warn(`Apple sync failed; keeping cached data from ${previous.fetchedAt}: ${error.message}`);
  } else {
    throw error;
  }
}
