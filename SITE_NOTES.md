# Singlespeeed.com — Site Notes & Rebuild Context

_Last updated: 2026-09-14_

## Goal
Rebuild singlespeeed.com as a clean, modern site using Cloudflare Pages,
with Claude Code (this session) driving the build/deploy workflow.

## Current live site (backed up in `legacy-backup/`)
- **Pages (4):**
  - `Singlespeeed.html` (Home) — title "Singlespeeed"
  - `About.html` — title "About"
  - `Contact.html` — title "A.S.S."
  - `Page-1.html` — title "Page 1"
- **Purpose:** Personal / brand hub. Primary CTA is a link-out to
  Instagram (`https://www.instagram.com/singlespeedbug/`). Minimal on-site
  content; the "site" mainly funnels to Instagram.
- **Design language:** Bold, high-engagement, mostly black/dark with vivid
  accent colors (blue / red / gold splashes). Huge 6rem display headings,
  centered hero section over a full-bleed photo (`sklar1.jpeg`, iPhone shot).
  Navigation is minimal (dropdown menu).
- **Tech:** Static HTML + Nicepage CSS/JS + jQuery 1.9.1 (legacy, heavy).
  Deployed as Cloudflare Pages with SPA fallback (any unknown path serves
  `index.html` — verified).
- **Domains:** `singlespeeed.pages.dev` + custom `singlespeeed.com`,
  both bound to the same Pages project (`singlespeeed`).

## Backed-up assets (in `legacy-backup/`)
- HTML: `index.html`, `Singlespeeed.html`, `About.html`, `Contact.html`, `Page-1.html`
- CSS: `nicepage.css` (1.2MB), `Singlespeeed.css` (page design)
- JS: `nicepage.js`, `jquery-1.9.1.min.js`
- Images: `sklar1.jpeg` (hero bg), `default-logo.png`
- NOTE: Cloudflare SPA fallback means probing unknown HTML paths returns
  index.html (200), so a recoverable page list is limited to what's above.

## Deploy environment
- Cloudflare account: `Jeibi@singlespeeed.com's Account`
  (id `f92ae55610a086d760b633217898ff1a`)
- Pages project: `singlespeeed` (production branch `main`)
- Credentials: wrangler OAuth token via `wrangler login`
  (stored at `~/.config/.wrangler/config/default.toml`); expires, re-login as needed.
- Tooling: wrangler 4.131.2 (project-local), Node 25, npm 11, git, gh CLI.

## Workflow chosen
1. Snapshot live site (done) → `legacy-backup/`
2. Verify custom-domain binding in this account (in progress)
3. Clarify content/design with user
4. Scaffold new static site + preview locally (`wrangler pages dev`)
5. Deploy to preview URL (`.pages.dev`) for review
6. On approval, deploy production branch so `singlespeeed.com` serves the new site
