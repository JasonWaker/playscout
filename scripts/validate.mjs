import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'dist');
const errors = [];

async function files(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(entries.map(entry => entry.isDirectory() ? files(path.join(dir, entry.name)) : [path.join(dir, entry.name)]));
  return nested.flat();
}

const all = await files(out);
const htmlFiles = all.filter(file => file.endsWith('.html'));
const routes = new Set(htmlFiles.map(file => {
  const rel = path.relative(out, file).replaceAll(path.sep, '/');
  if (rel === 'index.html') return '/';
  if (rel === '404.html') return '/404.html';
  return `/${rel.replace(/index\.html$/, '')}`;
}));

for (const file of htmlFiles) {
  const rel = path.relative(out, file);
  const html = await readFile(file, 'utf8');
  const h1s = (html.match(/<h1(?:\s|>)/g) || []).length;
  if (h1s !== 1) errors.push(`${rel}: expected one h1, found ${h1s}`);
  for (const token of ['<title>', 'name="description"', 'rel="canonical"', 'application/ld+json']) {
    if (!html.includes(token)) errors.push(`${rel}: missing ${token}`);
  }
  if (/href=["']#["']/.test(html)) errors.push(`${rel}: placeholder # link`);
  const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map(match => match[1]);
  for (const link of hrefs) {
    if (/^(https?:|mailto:|tel:)/.test(link) || link.startsWith('#')) continue;
    let clean = link.split('#')[0].split('?')[0];
    clean = clean.replace(/^\/playscout/, '') || '/';
    if (/\.(css|xml|jpg|jpeg|png|svg|ico|webp)$/.test(clean)) continue;
    if (!clean.endsWith('/') && !clean.endsWith('.html')) continue;
    if (!routes.has(clean)) errors.push(`${rel}: broken internal link ${link}`);
  }
  const srcs = [...html.matchAll(/(?:src|href)="([^"]+\.(?:jpg|jpeg|png|css|js))"/g)].map(match => match[1]);
  for (const src of srcs) {
    if (src.startsWith('http')) continue;
    const clean = src.replace(/^\/playscout/, '').replace(/^\//, '');
    try { await access(path.join(out, clean)); } catch { errors.push(`${rel}: missing asset ${src}`); }
  }
}

const sitemap = await readFile(path.join(out, 'sitemap.xml'), 'utf8');
const indexedPages = htmlFiles.length - 2;
const sitemapCount = (sitemap.match(/<url>/g) || []).length;
if (sitemapCount !== indexedPages) errors.push(`sitemap: expected ${indexedPages} URLs, found ${sitemapCount}`);

const apple = JSON.parse(await readFile(path.join(root, 'src', 'generated', 'apple-charts.json'), 'utf8'));
for (const type of ['free', 'paid', 'grossing']) {
  const entries = apple?.charts?.[type]?.entries;
  if (!Array.isArray(entries) || entries.length < 10) errors.push(`apple ${type}: expected at least 10 chart entries`);
  if (entries?.some(item => !item.id || !item.name || !item.storeUrl || !item.artworkUrl || !item.rank)) errors.push(`apple ${type}: an entry is missing required fields`);
}
const releaseEntries = apple?.releases?.entries;
if (!Array.isArray(releaseEntries) || releaseEntries.length < 5) errors.push('apple releases: expected at least 5 game entries');
if (releaseEntries?.some(item => !item.id || !item.name || !item.storeUrl || !item.artworkUrl || !item.releaseDate)) errors.push('apple releases: an entry is missing required fields');
const rankingsHtml = await readFile(path.join(out, 'rankings', 'index.html'), 'utf8');
if (!rankingsHtml.includes('Last successful Apple sync:') || !rankingsHtml.includes('iOS/iPadOS only') || !rankingsHtml.includes('no Android rankings')) errors.push('rankings: Apple-only platform scope or live timestamp is not visible');
const releasesHtml = await readFile(path.join(out, 'new-games', 'index.html'), 'utf8');
if (!releasesHtml.includes('Last successful Apple sync:') || !releasesHtml.includes('iOS/iPadOS only')) errors.push('new releases: Apple-only platform scope or live timestamp is not visible');

const pulse = JSON.parse(await readFile(path.join(root, 'src', 'generated', 'game-pulse.json'), 'utf8'));
if (!Array.isArray(pulse?.items) || pulse.items.length !== 6) errors.push('Game Pulse: expected exactly 6 briefings');
if (pulse?.items?.filter(item => item.kind === 'new').length !== 3) errors.push('Game Pulse: expected exactly 3 new games');
if (pulse?.items?.filter(item => item.kind === 'hot').length !== 3) errors.push('Game Pulse: expected exactly 3 hot games');
if (pulse?.items?.some(item => !item.id || !item.name || !item.developer || !item.artworkUrl || !item.storeUrl || !item.genre || !item.intro || !item.playStyle || !Array.isArray(item.tips) || item.tips.length !== 3 || !item.video?.url || !item.video?.thumbnailUrl || !item.sourceUrl || !item.copyOrigin)) errors.push('Game Pulse: a briefing is missing required content or provenance fields');
if (pulse?.items?.filter(item => item.kind === 'hot').some(item => !item.rank)) errors.push('Game Pulse: a hot game is missing its live rank');
if (pulse?.items?.some(item => item.video?.type === 'video' && !/^https:\/\/www\.youtube\.com\/watch\?v=[\w-]+$/.test(item.video.url))) errors.push('Game Pulse: a specific video has an invalid YouTube URL');
const pulseHtml = await readFile(path.join(out, 'game-pulse', 'index.html'), 'utf8');
if (!pulseHtml.includes('<b>3</b><span>new games</span>') || !pulseHtml.includes('<b>3</b><span>hot games</span>') || !pulseHtml.includes('data-pulse-search') || !pulseHtml.includes('US iOS/iPadOS') || !pulseHtml.includes('automatically synthesized')) errors.push('Game Pulse page: edition counts, search, platform scope or synthesis disclosure is missing');
if ((pulseHtml.match(/data-pulse-card/g) || []).length !== 6) errors.push('Game Pulse page: expected 6 rendered briefing cards');

const discovery = JSON.parse(await readFile(path.join(root, 'src', 'generated', 'discovery-feeds.json'), 'utf8'));
if (!Array.isArray(discovery?.giveaways?.entries) || discovery.giveaways.entries.length < 5) errors.push('GamerPower: expected at least 5 active offers');
if (discovery?.giveaways?.entries?.some(item => !item.id || !item.title || !item.sourceUrl || !item.thumbnailUrl || !Array.isArray(item.platforms))) errors.push('GamerPower: an entry is missing required fields');
if (!Array.isArray(discovery?.freeGames?.entries) || discovery.freeGames.entries.length < 10) errors.push('FreeToGame: expected at least 10 games');
if (discovery?.freeGames?.entries?.some(item => !item.id || !item.title || !item.sourceUrl || !item.thumbnailUrl || !item.platform)) errors.push('FreeToGame: an entry is missing required fields');
const giveawaysHtml = await readFile(path.join(out, 'giveaways', 'index.html'), 'utf8');
if (!giveawaysHtml.includes('Last successful GamerPower sync:') || !giveawaysHtml.includes('GamerPower API &amp; terms')) errors.push('giveaways: source attribution or live timestamp is not visible');
const freeGamesHtml = await readFile(path.join(out, 'free-games', 'index.html'), 'utf8');
if (!freeGamesHtml.includes('Last successful FreeToGame sync:') || !freeGamesHtml.includes('PC &amp; browser')) errors.push('free games: source scope or live timestamp is not visible');

const sourcedNews = [
  ['minecraft-wilderness-bound','https://www.minecraft.net/en-us/article/drop-3-2026-name-announce'],
  ['minecraft-treasure-hunt-watch-challenge','https://www.minecraft.net/en-us/article/treasure-hunt-watch-challenge'],
  ['roblox-global-creator-impact','https://about.roblox.com/newsroom/2026/09/global-impact-of-creation-on-roblox'],
  ['roblox-fall-games-preview','https://about.roblox.com/newsroom/2026/09/roblox-fall-games-preview'],
];
for (const [slug, sourceUrl] of sourcedNews) {
  const html = await readFile(path.join(out, 'news', slug, 'index.html'), 'utf8');
  if (!html.includes('PRIMARY SOURCE') || !html.includes(sourceUrl) || !html.includes('Source checked')) errors.push(`news ${slug}: verified source disclosure is missing`);
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`Validated ${htmlFiles.length} HTML pages, ${sitemapCount} indexed URLs, internal links and local assets.`);
