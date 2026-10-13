# Ethanet.XYZ — project notes

Hobby blog for **EthanetXYZ** at **https://ethanet.xyz**. Static site built with **Astro**, hosted on **GitHub Pages**, posts written in a browser via **Sveltia CMS** (Git-based, commits Markdown straight to this repo).

## Decisions (agreed 2026-10-13)

| Area | Choice | Why |
|---|---|---|
| Site generator | Astro 7 (content collections, glob loader) | Fast static output, Markdown-first, typed frontmatter |
| Hosting | GitHub Pages via GitHub Actions (`.github/workflows/deploy.yml`) | Free, custom domain, builds on every push to `main` |
| Editor UI | Sveltia CMS at `/admin` (`public/admin/`) | No server needed; commits to the repo → triggers deploy |
| Design | Clean & minimal, light/dark, logo blue `#0b2be6` | Matches the logo |
| Fonts | Outfit (display/headings/nav), Inter (body), JetBrains Mono (code) — Google Fonts | Josefin Sans replaced 2026-10-13: odd metrics, too thin |
| Search | Pagefind (indexed at build time, `/search/`) | Client-side, no service |
| Extras at launch | Search, Projects page | RSS & comments (Giscus) declined for now |
| Code blocks | Expressive Code (`astro-expressive-code`) | Copy button, file titles, line marks, diffs; follows `data-theme` |
| Project stats | Build-time GitHub API (`src/lib/github.ts`) | Stars/release/language on project cards with a `repo`; daily scheduled rebuild keeps them fresh |
| Page transitions | Astro `<ClientRouter />` in Base | Scripts must bind on `astro:page-load`; theme carried over in `astro:before-swap` |

## Layout

```
src/content.config.ts      Zod schemas for categories, posts, projects  ← keep in sync with public/admin/config.yml
src/content/posts/*.md      Blog posts (filename = URL slug → /blog/<slug>/)
src/content/categories/*.json  Categories (filename = id → /category/<id>/)
src/content/projects/*.md   Projects page entries
src/lib/content.ts          getPosts() (drafts hidden in prod), getCategories(), readingTime(), slugifyTag()
src/layouts/Base.astro      <head>, SEO/OG tags, theme bootstrap, header/footer
src/components/             Header, Footer, FeaturedPost (home hero), PostCard, ProjectCard, CategoryNav, FormattedDate
src/pages/                  index, blog/, blog/[...slug], category/[category], tags/[tag], projects, about, search, 404
src/styles/global.css       Design tokens (light + dark), base, chips, grid, prose
public/admin/               Sveltia CMS (index.html + config.yml)
public/images/uploads/      CMS media uploads (served at /images/uploads/…)
public/CNAME                ethanet.xyz
public/logo.webp            Original logo (source, white background)
public/logo.png             Transparent cut-out of the logo (header, CMS)
public/favicon.png, apple-touch-icon.png, og.png   Generated from logo.webp
```

## Content model

**Post frontmatter:** `title`, `description`, `pubDate`, `updatedDate?`, `category` (category file id, e.g. `home-assistant`), `tags[]`, `heroImage?` (public path like `/images/uploads/x.jpg`), `heroAlt?`, `draft` (drafts render in `npm run dev` only), `featured` (newest featured post is the home-page hero; falls back to newest post). Posts without a cover image get a blue `.cover-fallback` panel.

**Categories:** `3d-printing`, `home-assistant`, `open-source`. Add new ones as JSON files (or from the CMS "Categories" collection) — pages and nav pick them up automatically.

**Projects:** `title`, `description`, `repo?`, `url?`, `status` (active|maintained|experimental|archived), `category?`, `tags[]`, `featured` (shows on home), `order`.

If you change a schema field, update **both** `src/content.config.ts` and `public/admin/config.yml`.

## Commands

- `npm run dev` — local dev server at http://localhost:4321 (search won't work in dev; index is built at build time)
- `npm run build` — `astro build` + Pagefind index into `dist/`
- `npm run preview` — serve `dist/` (use this to test search)
- `npx astro check` — type check

## Conventions

- Pages use `Base` layout; spacing via `.container`, `.narrow`, `.section`, `.page-head`; cards in `.grid`.
- Colors only via CSS custom properties in `global.css`; dark mode = `prefers-color-scheme` unless `data-theme` set by the toggle (stored in localStorage `theme`).
- Only the post body is indexed by Pagefind (`data-pagefind-body`); category is a Pagefind filter.
- The CMS can write empty optional fields as `''`; wrap optional schema fields in `blank()` (src/content.config.ts) so blanks don't fail the build.
- Page transitions: never bind DOM listeners at module top level; use `document.addEventListener('astro:page-load', ...)`. Inline page scripts re-run on each visit.
- Sveltia CMS is pinned to an exact version in `public/admin/index.html`; bump deliberately.

## Setup status / TODO

- [x] Create GitHub repo, push, set `backend.repo` in `public/admin/config.yml` → done: `EthanetXYZ/ethanetxyz-website`
- [x] Repo Settings → Pages → Source: **GitHub Actions**; custom domain `ethanet.xyz`, enforce HTTPS (tick "Enforce HTTPS" once DNS resolves)
- [x] DNS: apex `A` records → 185.199.108.153 / .109.153 / .110.153 / .111.153 (+ `AAAA` 2606:50c0:8000::153 …8003::153), `www` CNAME → `ethanetxyz.github.io`
- [x] CMS auth (using fine-grained PAT): fine-grained PAT (Contents read/write on this repo) **or** deploy Sveltia CMS Authenticator (Cloudflare Worker) and set `base_url`
- [ ] Fill in About page (`src/pages/about.astro`) + GitHub link
- [ ] Optional later: Unraid-hosted editor (see below), RSS (`@astrojs/rss`), Giscus comments, OG image generation

## Unraid editor option (future)

`/admin` on the public site already works from anywhere, so no server is required. If a self-hosted editor is wanted later:
1. Run a tiny nginx container on Unraid serving only `public/admin/` (same config.yml) — it still commits via the GitHub API, or
2. Build a custom Docker app (editor + image upload) that commits via the GitHub API / a deploy key.
Either way GitHub Actions remains the only thing that builds and deploys.

## Writing posts from other projects

A user-level Claude Code skill at `~/.claude/skills/ethanet-blog-post/SKILL.md` teaches every Claude Code session how to write a post for this site (frontmatter, categories, voice, public-repo safety, build + push). If you change the post schema or categories workflow here, update that skill too.
