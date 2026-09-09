# PlayScout dynamic data sources

## Integrated now

### Apple Marketing Tools RSS

- Purpose: US **iOS/iPadOS App Store** Games category Top Free, Top Paid and Top Grossing charts, plus newly released games. Apple rows never represent Android or Google Play rankings.
- Authentication: none.
- Fields used: App Store ID, name, developer, release date, category, icon, store URL and category chart position. The new-applications feed is additionally filtered by the returned primary category because Apple currently includes mixed categories in that feed.
- Update: GitHub Actions runs every six hours and at every push.
- Accuracy note: ranking feeds are scoped to the App Store Games genre (`6014`). New releases combine the New Applications feed with newly dated entries found in live game charts, deduplicate by App Store ID, and sort by Apple’s release date. The page displays its country, source and fetch time.
- Endpoints follow Apple’s category RSS format, for example `https://itunes.apple.com/us/rss/topfreeapplications/limit=25/genre=6014/json`.
- Official tool: <https://rss.marketingtools.apple.com/>

The updater keeps the last successful snapshot when Apple is temporarily unavailable. It never replaces an outage with zero ranks.

### GamerPower API

- Purpose: active game giveaways, full games, loot, DLC and beta access across GamerPower's labelled platforms, including selected Android and iOS offers as well as PC and consoles.
- Authentication: none.
- Fields used: offer ID, title, value, image, short description, platform labels, publish/end time, popularity count and source/claim links.
- Update: every six hours and at every push.
- Publication constraint: the API permits personal and commercial use with an active link attribution to GamerPower. PlayScout links every card to the original GamerPower page and does not claim ownership of the data.
- Official documentation: <https://www.gamerpower.com/api-read>

This feed is an offer tracker, not a popularity or store ranking. Platform labels are shown per offer.

### FreeToGame API

- Purpose: recent free-to-play PC and browser game discovery.
- Authentication: none.
- Fields used: game ID, title, thumbnail, short description, genre, platform, publisher, developer, release date and source links.
- Update: every six hours and at every push.
- Scope: the current endpoint describes PC and browser titles. It is never presented as an iOS or Google Play chart.
- Publication constraint: FreeToGame requires an active source link. PlayScout links the channel and every catalog card back to FreeToGame.
- Official documentation: <https://www.freetogame.com/api-doc>

The public pages keep GamerPower, FreeToGame and Apple observations in separate modules. They are not merged into a synthetic cross-store rank.

## Recommended next connectors

| Source | Best use | Access | Publication constraint |
|---|---|---|---|
| Google Play ranking provider (Appfigures, 42matters or licensed equivalent) | A separate Android Top Free, Paid and Grossing chart | Paid access/token | Must be displayed as Google Play data with its own country, fetch time and license; never infer it from Apple |
| Apple iTunes Search API | App metadata lookup and ID matching | No key | Promotional assets must follow Apple’s usage terms and link to the store |
| YouTube Data API v3 | Validate specific video IDs, titles, channels, thumbnails, duration and embeddability | API key; quota | Keep videos hosted by YouTube and attribute the channel |
| Appfigures Public Data API | iOS + Google Play ranks, reviews, ratings and history | Paid credits + authentication | Public display/resale requires an appropriate commercial agreement |
| data.ai / Sensor Tower / AppMagic | Download and revenue estimates, cross-store market intelligence | Commercial contract | Display rights depend on the license; label values as estimates |
| RAWG API | Broad game identity, platforms, screenshots and discovery metadata | API key | Mobile coverage varies; follow attribution and image terms |
| IGDB API | Game identity, release dates, companies and media | Twitch application credentials | Review Twitch/IGDB usage and attribution requirements |
| Publisher RSS / official patch notes | News discovery and update verification | RSS or permitted fetch | Store title, short source excerpt and link; write original summaries |

## Data contract

Every changing observation should store `provider`, `sourceUrl`, `externalId`, `country`, `platform`, `observedAt`, `sourceUpdatedAt`, `rightsStatus`, `rawValue`, and `normalizedValue`. A failed refresh keeps the last successful snapshot, exposes its age, and never resets rankings to zero.

## Required secrets for future adapters

- `YOUTUBE_API_KEY`
- `APPFIGURES_CLIENT_KEY` and an OAuth/PAT secret appropriate to the account
- Optional commercial-provider credentials

Secrets belong in GitHub Actions secrets and must never be committed to this repository.
