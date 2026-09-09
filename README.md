# PlayScout

PlayScout is a content-rich, static-first mobile game discovery site inspired by the useful parts of editorial publishers and live chart products. It provides separate, crawlable routes for game hubs, rankings, releases, guides, news, videos, codes, search, sourcing, and editorial policy.

## What is implemented

- 46 generated HTML pages: 12 game hubs, 12 guide articles, 10 news articles, and 11 channel/policy pages plus a custom 404.
- Desktop and mobile navigation, game filtering, site search, ranking tabs, code-copy feedback, YouTube embeds, and responsive layouts.
- Unique titles, descriptions, canonicals, one H1 per page, Open Graph metadata, `Article`, `NewsArticle`, `BreadcrumbList`, `VideoObject`, `Organization`, and `WebSite` JSON-LD.
- `robots.txt`, `sitemap.xml`, RSS feed, crawlable `<a href>` links, and a GitHub Pages deployment workflow.
- Source and editorial policy pages that separate store rank, editorial heat, player experience, and first-party facts.

The Rankings and New releases pages now use Apple’s US App Store feeds. Editorial story dates, heat scores, event claims and codes remain clearly labelled preview data and must be verified before promotion.

## Local development

```bash
npm run check
npm run serve
```

Refresh the cached Apple chart snapshot with `npm run sync:data`. GitHub Actions runs this sync every six hours and deploys the generated site while retaining the last successful snapshot during a provider outage.

Open `http://localhost:4174`. Edit structured content in `src/data.mjs`, templates in `scripts/build.mjs`, presentation in `src/styles.css`, and client enhancements in `src/app.js`.

## Production content pipeline

1. Use official App Store/Google Play data or a licensed ranking provider for store facts. Respect terms, rate limits, and robots rules; do not scrape copyrighted editorial bodies.
2. Store a canonical game record plus immutable source observations containing source URL, external ID, region, platform, observed time, and rights status.
3. Fetch permitted YouTube metadata through the YouTube Data API and store the specific video ID. Embed or link to the original; never mirror the video file.
4. Source images from publisher press kits, permitted store APIs, owned captures, or licensed libraries. Keep license, attribution, and expiry fields next to each asset.
5. Send material changes to an editor, publish only complete pages, and mark stale/failed data visibly.

## Path to 100k monthly page views

- Launch with 10 flagship game clusters. Each cluster should include a game hub, beginner path, codes, event calendar, tier list, 8–12 durable guides, and 3–5 video summaries.
- Publish 3–5 verified updates daily and 15–20 evergreen guides weekly. Convert useful news into durable hub updates and internal links.
- Target intent clusters such as “game + codes”, “game + tier list”, “game + beginner guide”, “game + event”, and “best + genre + mobile”. Avoid mass-generated thin filter pages.
- Track Search Console coverage, query-to-page match, indexable page quality, returning visitors, newsletter signups, and clicks from news into evergreen pages.
- Review pages at 7, 30, and 90 days. Merge overlapping articles, update winners, and remove expired claims from current modules.

## Reference documents

The implementation plan, route matrix, visual rules, backlog, and data architecture are preserved in [`docs/`](docs/).
