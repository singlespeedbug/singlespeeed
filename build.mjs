"use strict";
/* Singlespeeed site generator.
 * Plain Node script: takes the page content in `src/` and emits a ready-to-deploy
 * static site into `web/` (deploy output). Edit content in `src/`, re-run
 * `node build.mjs` to regenerate.
 *
 * No framework — HTML strings + a shared layout + CSS. Fast, auditable, easy to
 * hand-edit later.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SRC = path.join(ROOT, "src");
const OUT = path.join(ROOT, "web");
const ASSET_SRC = path.join(SRC, "assets");   // copied as-is into web/assets
const CONTENT_SRC = path.join(SRC, "content"); // page definitions .mjs
const PAGE_SRC = path.join(SRC, "pages");      // page HTML fragments

// ---- tone palette (light + dark) ------------------------------------------
const INDIGO = "#3b3a7a";
const AMBER = "#e8830c"; // accent: gritty city amber
const INK = "#1b1a1e";
const PAPER = "#faf8f3";
const PAPER_DARK = "#0f0f12";

// ---------- shared layout ---------------------------------------------------
function layout({ title, description, body, active, now }) {
  const nav = [
    ["/", "Home"],
    ["/rides/", "Rides"],
    ["/parts/", "Parts & Reviews"],
    ["/wheels/", "Wheel Building"],
    ["/brands/", "Brands"],
  ];
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title} — Singlespeeed</title>
<meta name="description" content="${description}">
<meta name="theme-color" content="#3b3a7a">
<meta property="og:title" content="${title} — Singlespeeed">
<meta property="og:type" content="website">
<meta property="og:url" content="https://singlespeeed.com/">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:ital,wght@0,400;0,600;0,800;0,900;1,400&family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/styles.css">
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="site-header">
  <nav class="wrap nav" aria-label="Main">
    <a class="brand" href="/">
      <img src="/assets/default-logo.png" alt="Singlespeeed logo" class="brand-mark">
      <span class="brand-name">Singlespeeed</span>
    </a>
    <ul class="nav-links">
      ${nav.map(([href, label]) => `<li><a href="${href}"${href === active ? ` aria-current="page"` : ""}>${label}</a></li>`).join("\n      ")}
    </ul>
  </nav>
</header>
<main id="main">
${body}
</main>
<footer class="site-footer">
  <div class="wrap footer-inner">
    <div>
      <p class="footer-brand">Singlespeeed</p>
      <p class="muted small">Singlespeed mountain bikes · rides · wheel building.</p>
    </div>
    <ul class="footer-links">
      <li><a href="/rides/">Rides</a></li>
      <li><a href="/parts/">Parts &amp; Reviews</a></li>
      <li><a href="/wheels/">Wheel Building</a></li>
      <li><a href="/sponsors/">Sponsors</a></li>
    </ul>
    <ul class="footer-social">
      <li><a href="https://www.instagram.com/singlespeedbug/" rel="me">Instagram</a></li>
      <li><a href="mailto:jeibi@singlespeeed.com">Email</a></li>
    </ul>
  </div>
  <p class="muted small wrap copyright">© ${new Date().getFullYear()} Singlespeeed. All rights reserved.</p>
</footer>
</body>
</html>`;
}

// ---------- page loading ----------------------------------------------------
function pageFragment(name) {
  return fs.readFileSync(path.join(PAGE_SRC, `${name}.html`), "utf8").trim();
}
function pageDef(name) {
  // content defs export an object: { title, description, fragment }
  const mod = path.join(CONTENT_SRC, `${name}.mjs`);
  if (!fs.existsSync(mod)) return { title: "Page", description: "" };
  return import("file://" + mod).then((m) => m.default);
}

// ---------- helpers ---------------------------------------------------------
function hero({ kicker, title, lede, cta, ctaHref, image }) {
  const img = image
    ? `<div class="hero-media"><img src="${image}" alt="" loading="eager"></div>`
    : "";
  return `
<section class="hero">
  ${img}
  <div class="hero-shade"></div>
  <div class="wrap hero-content">
    <p class="kicker">${kicker}</p>
    <h1>${title}</h1>
    <p class="lede">${lede}</p>
    ${cta ? `<a class="btn btn-primary" href="${ctaHref}">${cta}</a>` : ""}
  </div>
</section>`;
}

// ---------- build -----------------------------------------------------------
async function build() {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });

  // assets
  fs.cpSync(ASSET_SRC, path.join(OUT, "assets"), { recursive: true });

  // content-driven pages
  for (const name of [
    "index",
    "rides",
    "parts",
    "wheels",
    "sponsors", // page key stays "sponsors"; output goes to /brands/
  ]) {
    const def = await pageDef(name);
    const frag = pageFragment(name);
    const html = layout({
      title: def.title,
      description: def.description,
      active: name === "index" ? "/" : name === "sponsors" ? "/brands/" : `/${name}/`,
      body: frag,
      now: new Date(),
    });
    // index → web/, others → web/<seg>/. sponsors deploys to /brands/
    const seg = name === "sponsors" ? "brands" : name;
    if (name === "index") {
      fs.writeFileSync(path.join(OUT, "index.html"), html);
    } else {
      const dir = path.join(OUT, seg);
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, "index.html"), html);
    }
  }

  // SPA-friendly fallback: any other path serves index.html
  fs.copyFileSync(path.join(OUT, "index.html"), path.join(OUT, "404.html"));

  // Redirects (Cloudflare Pages _redirects) — keep old /sponsors URLs working
  fs.writeFileSync(
    path.join(OUT, "_redirects"),
    "/sponsors /brands 301\n/sponsors/ /brands/ 301\n"
  );

  console.log("Built Singlespeeed site →", OUT);
  console.log("Files:", fs.readdirSync(OUT).join(", "));
}

build().catch((e) => {
  console.error(e);
  process.exit(1);
});
