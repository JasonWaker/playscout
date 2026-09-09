# PlayScout development guide

- Read `docs/IMPLEMENTATION_SPEC.md`, `docs/UI_DESIGN_SYSTEM.md`, and `docs/ROUTE_CONTENT_MATRIX.md` before changing public pages.
- Keep every primary navigation item on a distinct, crawlable URL. Never use placeholder `#` links.
- Render core content into HTML at build time. JavaScript may enhance filtering, search, tabs, copy actions, and menus.
- Structured data must describe content that is visibly present on the page.
- Third-party facts need a source URL and verification time before production indexing.
- Do not copy article bodies, publisher screenshots, or video files. Embed or link to permitted originals.
- Run `npm run check` after changes. The validator checks metadata, headings, internal links, image files, sitemap coverage, and content depth.
