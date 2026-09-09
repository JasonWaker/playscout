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

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`Validated ${htmlFiles.length} HTML pages, ${sitemapCount} indexed URLs, internal links and local assets.`);
