# PlayScout 实施规格

版本：1.0  
状态：可进入开发  
产品语言：首期英文  
首发地区：美国  
目标平台：响应式 Web，优先移动端搜索流量

配套规范：界面实现遵守 `UI_DESIGN_SYSTEM.md`；页面数量、内容密度和跳转路径遵守 `ROUTE_CONTENT_MATRIX.md`；任务顺序遵守 `BUILD_BACKLOG.md`。

## 1. 交付目标

建设一个以游戏榜单为入口、以结构化游戏中心和实用攻略为核心的移动游戏内容平台。首期完成可上线的 MVP，而不是只复刻静态原型。

上线版本必须同时满足以下结果：

1. 用户可以发现正在热门、刚上线或排名快速上升的游戏。
2. 用户可以从榜单进入游戏中心，再进入具体攻略、视频、兑换码或活动页面。
3. 编辑可以管理游戏、榜单来源、内容、视频、兑换码、活动和纠错。
4. 所有对外事实可以追溯到来源、抓取时间、适用地区和最后验证时间。
5. 搜索引擎可以稳定抓取有价值的游戏页和内容页，薄页保持不索引。
6. 数据采集失败、视频失效、内容过期和排名异常能够进入后台任务队列。

## 2. 已确定的产品决策

以下决策视为首期固定范围，开发过程中无需再次讨论：

- 工作名称使用 `PlayScout`，品牌可以在上线前替换。
- 首页使用当前原型的海军蓝、青绿和荧光绿视觉方向。
- 首期英文内容面向美国用户，数据模型必须支持多地区和多语言。
- 榜单、游戏中心、攻略、视频、兑换码和最新游戏是一级产品模块。
- 新闻与评测作为内容频道上线，但不建设大型综合媒体门户。
- 用户登录、关注提醒和完整论坛放在第二阶段；首期保留入口和数据结构。
- 榜单数据与综合热度必须分开展示，不能将收入榜、下载榜和社区热度混为同一含义。
- 公开页面不得发布只有机器改写、没有新增信息的批量页面。
- 当前 `index.html`、`game.html` 和 `styles.css` 是视觉参考，不是生产代码基础。

## 3. 建议技术架构

### 3.1 应用层

- Next.js App Router、TypeScript。
- Tailwind CSS 配合少量 CSS variables 管理设计令牌。
- PostgreSQL 作为主数据库。
- Prisma ORM 管理 schema、迁移和类型。
- S3 兼容对象存储保存自有或获授权的图片、截图和投稿附件。
- 首期使用 PostgreSQL 任务表与定时任务；数据规模上升后再引入 Redis 队列。
- 内容正文保存为结构化 JSON，同时生成经过清洗的 HTML 用于服务端渲染。

### 3.2 运行单元

代码库包含四个逻辑单元，可以先部署在同一仓库：

1. `web`：公开网站与编辑后台。
2. `worker`：采集、规范化、过期检查和排行榜计算。
3. `db`：schema、迁移和种子数据。
4. `shared`：类型、验证规则、来源适配器接口和通用组件。

### 3.3 建议目录

```text
playscout/
├── AGENTS.md
├── README.md
├── package.json
├── .env.example
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   ├── admin/
│   │   ├── api/
│   │   ├── sitemap.ts
│   │   └── robots.ts
│   ├── components/
│   │   ├── layout/
│   │   ├── charts/
│   │   ├── games/
│   │   ├── content/
│   │   ├── video/
│   │   └── forms/
│   ├── lib/
│   │   ├── db/
│   │   ├── ranking/
│   │   ├── search/
│   │   ├── seo/
│   │   ├── sources/
│   │   └── validation/
│   ├── workers/
│   │   ├── importers/
│   │   ├── normalize/
│   │   ├── rankings/
│   │   └── freshness/
│   └── styles/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
└── public/
```

### 3.4 环境变量约定

`.env.example` 至少包含以下变量名和用途说明，不得填写真实密钥：

```text
DATABASE_URL=
APP_URL=http://localhost:3000
AUTH_SECRET=
CRON_SECRET=

OBJECT_STORAGE_ENDPOINT=
OBJECT_STORAGE_REGION=
OBJECT_STORAGE_BUCKET=
OBJECT_STORAGE_ACCESS_KEY=
OBJECT_STORAGE_SECRET_KEY=

YOUTUBE_API_KEY=
CHART_PROVIDER_BASE_URL=
CHART_PROVIDER_API_KEY=

ANALYTICS_PROVIDER=
ANALYTICS_SITE_ID=
```

开发环境没有外部密钥时使用固定 seed 和假适配器；假数据必须带 `is_demo=true`，生产构建禁止将其显示为实时数据。

## 4. 用户角色

### 4.1 访客

- 浏览、搜索和筛选游戏及内容。
- 打开外部商店和原作者视频。
- 复制兑换码。
- 提交内容纠错和玩家分享。

### 4.2 编辑

- 新建和更新游戏、文章、视频、兑换码及活动。
- 查看来源、变更差异、过期警告和投稿。
- 审核并发布内容。
- 合并重复游戏实体。

### 4.3 管理员

- 管理来源、编辑账号、采集任务和热度算法版本。
- 处理版权下架、重定向和批量回滚。

## 5. 网站地图与路由

| 路由 | 页面 | 索引策略 |
|---|---|---|
| `/` | 首页 | index |
| `/games` | 游戏库 | index |
| `/games/[gameSlug]` | 游戏中心 | 达到发布门槛后 index |
| `/rankings` | 榜单总览 | index |
| `/rankings/[platform]/[country]/[chart]` | 榜单详情 | 有稳定数据时 index |
| `/new-games` | 最新和即将上线 | index |
| `/guides` | 攻略频道 | index |
| `/guides/[slug]` | 攻略详情 | index |
| `/news` | 新闻频道 | index |
| `/news/[slug]` | 新闻详情 | index |
| `/reviews` | 评测频道 | index |
| `/reviews/[slug]` | 评测详情 | index |
| `/videos` | 视频精选 | index |
| `/codes` | 兑换码总览 | index |
| `/codes/[gameSlug]` | 单游戏兑换码 | 有有效或历史码时 index |
| `/search` | 搜索结果 | noindex, follow |
| `/submit` | 投稿与纠错 | noindex |
| `/about/sources` | 数据来源与方法 | index |
| `/about/editorial-policy` | 编辑原则 | index |
| `/admin/*` | 编辑后台 | 禁止抓取且需要权限 |

第二阶段预留 `/contributors/[slug]`、`/tools/[slug]`、`/collections/[slug]` 和 `/account/*`。

## 5.1 首批种子游戏

种子脚本创建以下 12 个旗舰游戏实体，并允许以后通过配置替换：

1. Whiteout Survival
2. MONOPOLY GO!
3. Pokémon GO
4. Roblox
5. Minecraft
6. Royal Match
7. Bloons TD 6
8. Stardew Valley
9. Kingshot
10. Clash Royale
11. Candy Crush Saga
12. Genshin Impact

每个种子游戏至少包含：别名、平台、分类、图标占位、商店链接占位、一个榜单快照、一个内容条目和来源记录。原型素材必须标记为 `prototype_only`，不能自动进入生产发布状态。

## 6. 首页规格

首页目标是同时回答三个问题：现在什么游戏值得关注、网站刚更新了什么、用户下一步可以解决什么问题。

### 6.1 桌面端首屏

按 `50% / 22% / 28%` 三栏布局：

1. 主专题：一篇高价值编辑内容，标题最多两行。
2. 今日更新：最近 5–6 条新闻、攻略、活动或兑换码更新。
3. 实时榜单：显示前 5 名，支持免费、畅销、付费切换。

顶部结构：

- 趋势条：最多 4 个趋势词、榜单更新时间、地区选择。
- 主导航：Games、Rankings、Guides、News、Videos、Codes。
- 搜索：游戏、攻略、兑换码和视频统一搜索。

首屏之后的模块顺序：

1. Popular game hubs：6–10 款。
2. New & upcoming：新上线、即将上线和软启动。
3. Updated guides：最近重新验证的攻略。
4. Watch & learn：3–6 个具体视频。
5. Active codes：最近验证的兑换码。
6. Browse by genre：至少 8 个分类。
7. Community picks：玩家投稿和编辑精选。

### 6.2 首页数据规则

- 主专题必须有图片、标题、内容类型、更新时间和适用版本。
- 今日更新按 `published_at` 与 `last_verified_at` 的较新值排序。
- 首页榜单不得使用手工硬编码数据。
- 视频卡片只允许具体视频链接，不允许链接到搜索结果页。
- 同一游戏在首屏最多出现两次，避免内容单一。
- 广告位首期仅保留布局插槽，不加载真实广告脚本。

## 7. 游戏库与游戏中心

### 7.1 游戏库

筛选条件：

- 平台：iOS、Android、Steam、Roblox。
- 分类、商业模式、上线状态、国家可用性。
- 免费、付费、含内购。
- 编辑评分、商店评分、热度变化。

排序：热门、最新上线、最近更新、评分、名称。

列表卡片显示：图标、名称、类型、平台、价格、评分、当前排名和热度变化。

### 7.2 游戏中心发布门槛

满足以下条件才允许搜索引擎索引：

- 有唯一游戏实体和至少一个有效商店链接。
- 有简介、平台、发行商、分类、图标和来源。
- 有至少一篇编辑内容、一个有效视频或一个有数据的榜单记录。
- 页面没有来源冲突或待处理版权状态。

不满足门槛时页面可以存在，但返回 `noindex, follow`。

### 7.3 游戏中心模块

- 游戏名称、图标、发行商、平台、评分、商业模式和商店按钮。
- 当前版本、最近更新、地区可用性和版本历史。
- Start here：新手第一天、前七天和回流玩家路线。
- Guides：角色、装备、关卡、活动、资源和 FAQ。
- Rankings：当前名次、7日趋势和历史最高排名。
- Events：正在进行、即将开始和历史活动。
- Codes：有效、待复核和过期记录。
- Videos：具体视频、作者、时长、语言和关键步骤。
- Player tips：玩家方案、证据、版本和编辑状态。
- Trust：来源、编辑、最后验证和纠错入口。

## 8. 榜单产品

### 8.1 榜单类型

必须以不同页面或清晰标签分隔：

1. Store Charts：商店原始免费、付费和畅销排名。
2. Community Heat：视频增长、直播和社区讨论信号。
3. PlayScout Hot：外部信号与站内行为的组合热度。

### 8.2 榜单筛选

- 平台、设备、国家、分类、榜单类型。
- 当前、24 小时、7 天和 30 天。
- 新上榜、升幅、降幅和持续上榜。

### 8.3 榜单行数据

- 当前名次、上期名次、变化值。
- 游戏图标、名称、发行商、分类。
- 当前评分和价格。
- 上榜时长、最高名次和 7 日迷你趋势图。
- 数据来源和抓取时间。

### 8.4 综合热度算法

首版公式：

```text
hot_score =
  store_score * 0.35 +
  search_score * 0.25 +
  video_score * 0.20 +
  community_score * 0.10 +
  onsite_score * 0.10
```

实现要求：

- 每个信号先按平台、地区和时间窗口归一化到 0–100。
- 信号缺失时重新分配现有信号权重，并降低 `confidence_score`。
- 每次计算保存 `algorithm_version`、原始分项和计算时间。
- 单一信号出现异常突增时触发审核，不直接推到榜首。
- 页面显示“热度”，不得暗示为下载量或收入。

## 9. 内容类型与模板

### 9.1 攻略

必填：目标问题、直接答案、适用版本、作者、验证人、来源、步骤、更新时间。

可选：目录、材料表、阵容表、视频、FAQ、相关工具。

### 9.2 Tier List

必填：评价维度、适用模式、版本、排序理由和至少一个证据来源。只有字母等级和角色名的页面不得发布。

### 9.3 兑换码

必填：兑换码、奖励、地区、平台、来源、发现时间、最后验证时间和状态。

状态：`active`、`unverified`、`expired`、`region_limited`。

### 9.4 活动

必填：开始和结束时间、时区、地区、奖励摘要、参与条件和官方来源。

### 9.5 评测

必填：测试平台、测试版本、测试时长、作者、优点、缺点、结论和评分维度。

### 9.6 新闻

必须链接原始公告或一手来源。只复述其他媒体报道的稿件需要人工确认新增价值。

### 9.7 视频精选

只收录具体视频，保存视频 ID、频道、标题、时长、发布日期、语言、字幕状态、嵌入状态和最后检查时间。页面同时提供编辑摘要与关键时间点。

## 10. 数据模型

字段类型由 ORM 实现确定；以下表名和关键关系不可随意省略。

### 10.1 游戏实体

`games`

- `id`, `slug`, `name`, `normalized_name`
- `summary`, `description`
- `developer_id`, `publisher_id`
- `primary_genre_id`, `release_status`
- `release_date`, `cover_asset_id`, `icon_asset_id`
- `editorial_score`, `content_rating`
- `index_status`, `created_at`, `updated_at`

`game_aliases`：别名、旧名称、不同语言名称。  
`companies`：开发商和发行商。  
`platforms`：iOS、Android、Steam、Roblox。  
`genres`、`tags`、`game_tags`：分类和多对多标签。

### 10.2 商店与版本

`store_listings`

- `game_id`, `platform_id`, `region`
- `external_id`, `store_url`
- `price_amount`, `currency`, `has_iap`
- `store_rating`, `rating_count`
- `release_date`, `current_version`
- `availability_status`, `last_seen_at`

唯一键：`platform_id + region + external_id`。

`game_versions`

- `game_id`, `platform_id`, `version`
- `released_at`, `release_notes`, `source_record_id`

### 10.3 来源与素材

`source_records`

- `id`, `source_type`, `publisher`
- `source_url`, `external_id`
- `retrieved_at`, `published_at`
- `usage_basis`, `region`, `language`
- `content_hash`, `raw_payload`
- `verification_status`, `verified_by`, `last_verified_at`

`assets`

- `id`, `kind`, `url`, `storage_key`
- `owner_name`, `source_record_id`, `usage_basis`
- `width`, `height`, `alt_text`
- `license_notes`, `status`

### 10.4 榜单

`ranking_snapshots`

- `id`, `platform_id`, `region`, `device`
- `chart_type`, `genre_id`, `captured_at`
- `source_record_id`, `status`

`ranking_entries`

- `snapshot_id`, `game_id`, `rank`
- `previous_rank`, `best_rank`, `days_charted`
- `price_amount`, `store_rating`

唯一键：`snapshot_id + rank`；同时约束同一快照中游戏唯一。

`heat_metrics`

- `game_id`, `region`, `window`
- `store_score`, `search_score`, `video_score`
- `community_score`, `onsite_score`
- `hot_score`, `confidence_score`
- `algorithm_version`, `calculated_at`

### 10.5 内容

`content_items`

- `id`, `slug`, `type`, `title`, `dek`
- `body_json`, `rendered_html`
- `status`, `language`, `region`
- `author_id`, `reviewer_id`
- `game_version`, `published_at`, `updated_at`
- `last_verified_at`, `next_review_at`
- `seo_title`, `seo_description`, `canonical_url`

`content_games`：内容与一个或多个游戏关联。  
`content_sources`：内容与来源记录关联。  
`content_revisions`：保存正文、字段变更、操作者和时间。  
`redirects`：旧 URL 和合并实体的 301 规则。

### 10.6 视频、兑换码和活动

`videos`

- `game_id`, `provider`, `provider_video_id`
- `channel_id`, `channel_name`, `title`
- `duration_seconds`, `language`, `has_captions`
- `published_at`, `embed_allowed`, `last_checked_at`
- `editor_summary`, `key_moments_json`, `source_record_id`

`redeem_codes`

- `game_id`, `code`, `reward_text`
- `platform_id`, `region`, `status`
- `starts_at`, `expires_at`, `last_verified_at`
- `source_record_id`, `verified_by`

`game_events`

- `game_id`, `name`, `slug`
- `starts_at`, `ends_at`, `timezone`
- `region`, `requirements`, `reward_summary`
- `status`, `source_record_id`, `last_verified_at`

### 10.7 投稿与运营

`submissions`：投稿类型、内容、原始链接、授权确认、状态和处理人。  
`corrections`：目标页面、问题、证据、处理结果和公开说明。  
`contributors`：显示名称、简介、外部主页和信誉分。  
`jobs`：任务类型、参数、状态、尝试次数、计划时间和错误摘要。  
`audit_logs`：后台关键操作的操作者、对象、动作和时间。

## 11. 数据采集系统

### 11.1 来源优先级

1. 官方 API、官方商店、发行商新闻稿和媒体包。
2. 有明确许可的商业数据服务。
3. 官方社交账号和社区 API。
4. 编辑实测和取得授权的玩家投稿。

不得将第三方文章正文、攻略图片或视频文件直接复制到本站。

### 11.2 适配器接口

每个来源实现统一接口：

```ts
interface SourceAdapter<TInput, TRaw, TNormalized> {
  sourceType: string;
  fetch(input: TInput): Promise<TRaw>;
  validate(raw: TRaw): Promise<void>;
  normalize(raw: TRaw): Promise<TNormalized>;
  persist(data: TNormalized, context: ImportContext): Promise<ImportResult>;
}
```

所有任务必须可重试、幂等，并记录来源请求时间和 payload 哈希。

### 11.3 处理流程

```text
fetch
  → save raw source record
  → schema validation
  → normalize fields
  → resolve game entity
  → compare with current value
  → persist new snapshot/revision
  → run anomaly rules
  → publish or send to review queue
```

### 11.4 更新频率

- 美国核心 App Store 榜单：每 2 小时。
- 其他地区榜单：每 6–24 小时，按流量动态调整。
- 游戏元数据和版本：每天一次。
- 重点游戏官方公告：每 1–3 小时。
- 视频可用性：重点视频每天，其余每周。
- 兑换码：重点游戏每 6 小时并支持人工即时复核。
- 活动：每 12 小时检查，临近开始或结束时提高频率。
- 内容过期检查：每天一次。

### 11.5 异常规则

- 单次排名变化超过 100 位。
- 游戏实体无法匹配或同时匹配多个候选。
- 评分、价格或发行商突然为空。
- 兑换码来源被删除或连续两次验证失败。
- 视频禁止嵌入、删除或转为私密。
- 同一来源连续三次失败。

异常数据保留原始记录，不覆盖上一个可信发布值。

## 12. 内部 API

首期公开页面通过服务端函数直接读取数据库；以下 API 供客户端交互、后台和任务使用。

### 12.1 公开读取

```text
GET /api/search?q=&type=&platform=&limit=
GET /api/rankings?platform=&region=&chart=&genre=&window=
GET /api/games/[slug]/codes
GET /api/games/[slug]/events
GET /api/games/[slug]/videos
```

### 12.2 投稿

```text
POST /api/submissions
POST /api/corrections
```

要求：schema 验证、速率限制、反垃圾字段、文本长度限制和 URL 白名单检查。

### 12.3 后台

```text
POST /api/admin/content/[id]/publish
POST /api/admin/content/[id]/verify
POST /api/admin/codes/[id]/verify
POST /api/admin/games/merge
POST /api/admin/jobs/[id]/retry
```

所有后台写操作必须鉴权并写入 `audit_logs`。

### 12.4 核心返回结构

接口字段使用 camelCase；数据库字段可以使用 snake_case。时间返回 ISO 8601 UTC 字符串。

```ts
type RankingItem = {
  rank: number;
  previousRank: number | null;
  change: number | null;
  bestRank: number | null;
  daysCharted: number | null;
  game: {
    id: string;
    slug: string;
    name: string;
    iconUrl: string | null;
    developerName: string | null;
    primaryGenre: string | null;
  };
  price: { amount: number; currency: string } | null;
  storeRating: number | null;
  trend: Array<{ capturedAt: string; rank: number }>;
};

type RankingsResponse = {
  context: {
    platform: string;
    region: string;
    device: string | null;
    chart: "free" | "paid" | "grossing";
    genre: string | null;
  };
  source: {
    publisher: string;
    sourceUrl: string;
    capturedAt: string;
  };
  items: RankingItem[];
  nextCursor: string | null;
};

type GameHubResponse = {
  game: {
    id: string;
    slug: string;
    name: string;
    summary: string;
    iconUrl: string | null;
    platforms: string[];
    genres: string[];
    currentVersion: string | null;
    lastVerifiedAt: string | null;
  };
  listings: Array<{
    platform: string;
    region: string;
    storeUrl: string;
    price: { amount: number; currency: string } | null;
    rating: number | null;
  }>;
  startHere: ContentCard[];
  guides: ContentCard[];
  currentRanking: RankingItem | null;
  activeCodes: CodeCard[];
  upcomingEvents: EventCard[];
  videos: VideoCard[];
  relatedGames: GameCard[];
};

type SearchResponse = {
  query: string;
  groups: {
    games: GameCard[];
    guides: ContentCard[];
    codes: CodeCard[];
    videos: VideoCard[];
  };
  total: number;
};
```

`ContentCard`、`CodeCard`、`EventCard`、`VideoCard` 和 `GameCard` 在 `src/shared/contracts.ts` 中定义并由页面与 API 共同使用。

## 13. 搜索

首期使用 PostgreSQL 全文检索与模糊匹配。

搜索权重：

1. 游戏精确名称和别名。
2. 标题精确短语。
3. 游戏名称与内容类型组合。
4. 正文和摘要。

搜索结果分组显示 Games、Guides、Codes、Videos，并支持平台和内容类型筛选。没有结果时显示相关热门游戏和建议关键词。

## 14. 编辑后台

必须完成以下页面：

- Dashboard：采集状态、待审核、过期内容、视频失效和异常榜单。
- Games：游戏实体、商店记录、别名、来源和合并。
- Content：文章状态、版本、作者、复核日期和发布预览。
- Rankings：来源快照、异常和重跑。
- Codes：有效性、地区、来源和批量复核。
- Events：时间、时区、来源和状态。
- Videos：嵌入状态、频道、游戏关联和编辑摘要。
- Submissions：玩家投稿、授权记录和处理结果。
- Sources：来源状态、抓取频率和最近错误。

编辑工作流：`idea → assigned → drafting → fact_check → ready → published → stale → archived`。

## 15. SEO 规则

### 15.1 标题模板

```text
游戏中心：{Game Name} Guides, Codes, Tier Lists & Updates | PlayScout
榜单：Top {Chart Type} {Platform} Games in {Country} – {Date} | PlayScout
攻略：{Primary Query} – {Game Version} | PlayScout
兑换码：{Game Name} Codes – Verified {Month Year} | PlayScout
```

### 15.2 技术要求

- 公开内容服务端渲染。
- 分类型生成 sitemap，单个文件不超过 50,000 URL。
- 地区筛选页只有具备独立数据和需求时才允许索引。
- 搜索、排序组合、后台和预览页面保持 noindex。
- 游戏别名、合并页面和旧文章生成 301。
- 分页有稳定 URL，禁止无限滚动成为唯一浏览方式。
- 支持 `Game`、`Article`、`VideoObject`、`BreadcrumbList` 等与页面真实内容一致的结构化数据。

### 15.3 内链规则

- 榜单行必须链接游戏中心。
- 游戏中心链接核心新手攻略、当前活动、兑换码和视频。
- 攻略链接适用游戏中心、前置攻略和下一步攻略。
- 新闻中的游戏实体至少链接一次游戏中心。
- 每个索引页从其他已索引页面获得至少一个入口。

## 16. 分析与增长指标

### 16.1 关键事件

```text
ranking_filter_changed
ranking_game_opened
game_store_clicked
guide_started
guide_completed
video_opened
code_copied
search_submitted
search_result_opened
correction_submitted
community_submission_started
```

### 16.2 核心指标

- 自然搜索点击与索引页面数量。
- 进入游戏中心后继续浏览率。
- 榜单到游戏中心点击率。
- 攻略完成率和相关攻略点击率。
- 兑换码复制率。
- 视频打开率和失效率。
- 更新后 7/28 天流量变化。
- 每个内容集群的产出成本和 PV。

100k 月 PV 的规划基线仍为约 72,000 月访问乘以 1.4 页/访问。该目标用于资源配置，不作为结果承诺。

## 17. 性能、可访问性与安全

- 公开页面移动端 p75 目标：LCP ≤ 2.5 秒、INP ≤ 200 毫秒、CLS ≤ 0.1。
- 首屏图片使用响应式尺寸、现代格式、尺寸占位和延迟加载策略。
- 榜单服务端输出首屏内容，筛选后再客户端更新。
- 所有按钮和输入可用键盘操作，有可见焦点和清晰标签。
- 图片必须有语义化 alt；装饰图片使用空 alt。
- 色彩对比满足 WCAG AA。
- 外部投稿内容进行 HTML 清洗；URL、文件类型和文件大小严格校验。
- 机密只放环境变量；`.env.example` 只保留变量名和说明。
- 对搜索、投稿、后台登录和任务重试进行速率限制。

## 18. 测试策略

### 18.1 单元测试

- 榜单变化计算和综合热度公式。
- 缺失热度信号的权重重分配。
- slug、别名和游戏实体匹配。
- 兑换码状态与活动时间状态。
- 索引门槛、canonical 和 SEO 标题生成。

### 18.2 集成测试

- 来源 payload 到数据库记录的完整导入。
- 重复运行同一采集任务不产生重复快照。
- 失败任务重试与异常队列。
- 发布、复核、过期和归档状态迁移。
- 游戏合并后的内容、榜单与重定向完整性。

### 18.3 端到端测试

至少覆盖：

1. 首页切换榜单并进入游戏中心。
2. 游戏中心进入攻略、复制兑换码和打开视频。
3. 搜索游戏别名并找到正确实体。
4. 编辑创建草稿、增加来源、预览并发布。
5. 采集异常在后台出现并可重试。

## 19. 上线验收标准

### 功能

- 所有 P0 页面完成桌面和移动布局。
- 所有一级导航进入独立页面，主要用户路径没有 `#` 占位和重复跳转首页。
- 页面内容入口数量达到 `ROUTE_CONTENT_MATRIX.md` 的基线。
- 榜单筛选使用真实数据库数据并显示更新时间。
- 游戏、攻略、视频、兑换码和活动关系正确。
- 编辑后台能够完成从草稿到发布的完整流程。
- 搜索支持名称、别名和内容标题。

### 内容与数据

- 至少 12 个旗舰游戏中心。
- 至少 300 个基础游戏实体。
- 至少 150 个经过编辑或人工验证的内容页。
- 至少一个真实榜单来源和一个具体视频来源完成自动更新。
- 任意公开事实页面均能定位到来源和最后验证时间。

### 质量

- 没有断开的站内核心链接。
- 没有搜索结果链接代替具体视频链接。
- 没有无来源的兑换码或活动时间。
- sitemap、robots、canonical 和结构化数据通过检查。
- 核心流程端到端测试通过。
- 无阻断级可访问性问题。

## 20. 明确不属于首期范围

- 完整论坛、私信和实时聊天。
- 原生 iOS 或 Android 应用。
- 用户上传并托管完整视频。
- 付费订阅系统。
- 多语言内容发布后台。
- 自建搜索集群。
- 大规模推荐算法和用户画像。

## 21. 原型对应关系

- `index.html`：首页视觉和主要内容模块参考。
- `game.html`：游戏中心视觉和导航参考。
- `prototype-home.jpg`、`prototype-game.jpg`：桌面端验收基准图。
- 生产实现应保留品牌气质和信息层级，并按本规格增加今日更新、游戏库入口、真实视频链接、榜单来源和后台工作流。

## 22. 完成定义

某个任务只有同时满足以下条件才算完成：

1. 功能在真实页面可操作，不依赖写死演示数据。
2. 数据验证、错误状态、空状态和加载状态完整。
3. 对应测试通过。
4. 移动端和桌面端均完成检查。
5. 新增环境变量、迁移和运行方法写入 README。
6. 没有留下无法追踪的 TODO；未实现范围进入 backlog 并说明原因。
