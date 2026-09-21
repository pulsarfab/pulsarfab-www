import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { siteUrl, sourceUrl, release, navigation } from './site.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const check = process.argv.includes('--check');
const docs = fs.readdirSync(path.join(root, 'docs/regain')).filter(f => f.endsWith('.html')).sort();
const ordered = navigation.flatMap(group => group.pages);
if (new Set(ordered.map(([file]) => file)).size !== ordered.length ||
    docs.join('|') !== ordered.map(([file]) => file).sort().join('|')) {
  throw new Error('Every documentation page must appear exactly once in scripts/site.mjs navigation.');
}
const pages = ['index.html', '404.html', 'docs/index.html', ...docs.map(file => `docs/regain/${file}`)];
const stale = [];
const escape = text => text.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const url = file => `${siteUrl}/${file === 'index.html' ? '' : file.replace(/\/index\.html$/, '/')}`;
const block = (name, content) => `<!-- ${name}:start -->\n${content}\n<!-- ${name}:end -->`;
function replace(html, name, content, file) {
  const marker = new RegExp(`<!-- ${name}:start -->[\\s\\S]*?<!-- ${name}:end -->`, 'g');
  if ([...html.matchAll(marker)].length !== 1) throw new Error(`${file}: expected one ${name} block`);
  return html.replace(marker, () => block(name, content));
}
function output(file, text) {
  const full = path.join(root, file);
  if (!fs.existsSync(full) || fs.readFileSync(full, 'utf8') !== text) {
    stale.push(file);
    if (!check) fs.writeFileSync(full, text);
  }
}
function header(file, prefix) {
  return `<a class="skip-link" href="#main">Skip to content</a>
<header class="site-header">
  <nav class="nav" aria-label="Primary navigation">
    <a class="brand" href="${prefix || './'}"><img src="${prefix}assets/logo.svg" alt=""> PulsarFab</a>
    <div class="nav-links">
      <a class="keep" href="${prefix}docs/"${file === 'docs/index.html' ? ' aria-current="page"' : ''}>Docs</a>
      <a class="keep" href="${prefix}#projects">Hardware</a>
      <a href="https://github.com/pulsarfab">GitHub</a>
      <a class="cta" href="${prefix}docs/regain/install.html"${file === 'docs/regain/install.html' ? ' aria-current="page"' : ''}>Install regain</a>
    </div>
  </nav>
</header>`;
}
function sidebar(file) {
  return `<aside class="docs-nav" aria-label="Documentation navigation">
<details class="docs-menu" open>
  <summary>Browse regain documentation</summary>
  <div class="docs-nav-sections">
  <p><a href="../">← All documentation</a></p>
${navigation.map(group => `  <h4>${group.label}</h4>\n  <ul>\n${group.pages.map(([href, label]) => `    <li><a href="${href === 'index.html' ? './' : href}"${path.basename(file) === href ? ' class="active" aria-current="page"' : ''}>${escape(label)}</a></li>`).join('\n')}\n  </ul>`).join('\n')}
  <h4>Project</h4>
  <ul>
    <li><a href="${sourceUrl}">Source &amp; protocol notes</a></li>
    <li><a href="${sourceUrl}/releases">Releases</a></li>
    <li><a href="${sourceUrl}/issues">Report an issue</a></li>
    <li><a href="https://nina-plugins.pulsarfab.com/">NINA plugin registry</a></li>
  </ul>
  </div>
</details>
<script>
  (() => {
    const menu = document.currentScript.previousElementSibling;
    const narrow = window.matchMedia('(max-width: 900px)');
    const sync = () => { menu.open = !narrow.matches; };
    sync();
    narrow.addEventListener('change', sync);
  })();
</script>
</aside>`;
}
function pageNav(file) {
  const index = ordered.findIndex(([href]) => href === path.basename(file));
  const link = (item, previous) => item ? `<a href="${item[0] === 'index.html' ? './' : item[0]}" rel="${previous ? 'prev' : 'next'}">${previous ? '← ' : ''}${escape(item[1])}${previous ? '' : ' →'}</a>` : '<span></span>';
  return `<nav class="next-prev" aria-label="Documentation pages">${link(ordered[index - 1], true)}${link(ordered[index + 1], false)}</nav>`;
}
for (const file of pages) {
  const isRegain = file.startsWith('docs/regain/');
  const prefix = file === '404.html' ? '/' : '../'.repeat(file.split('/').length - 1);
  let html = fs.readFileSync(path.join(root, file), 'utf8');
  html = replace(html, 'site-header', header(file, prefix), file);
  html = replace(html, 'release-note', isRegain ? `<div class="release-note">${release.published
    ? `regain ${release.version} · <a href="${sourceUrl}/releases/tag/v${release.version}">Read the release notes</a>`
    : `regain ${release.version} documentation · Signed release pending. <a href="${prefix}docs/regain/install.html#source">Build the tagged source</a> or view the <a href="${sourceUrl}/releases">current public release, ZWOgain ${release.previous}</a>.`}</div>` : '', file);
  html = replace(html, 'site-footer', `<footer class="footer"><div class="footer-inner">
  <span>PulsarFab · Open astronomy hardware &amp; software.</span>
  <a href="${prefix}docs/">All documentation</a>
  <a href="${prefix}docs/regain/">regain docs</a>
  <a href="https://github.com/pulsarfab/pulsarfab">Hardware source</a>
  <a href="${sourceUrl}">regain source</a>
</div></footer>`, file);
  const title = html.match(/<title>(.*?)<\/title>/)?.[1];
  const description = html.match(/<meta name="description" content="([^"]+)"/)?.[1];
  if (!title || !description) throw new Error(`${file}: missing title or description`);
  html = replace(html, 'page-meta', file === '404.html' ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${url(file)}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:url" content="${url(file)}">
  <meta property="og:image" content="${siteUrl}/assets/${isRegain ? 'regain.png' : 'logo.svg'}">
  <meta property="og:type" content="website">`, file);
  if (isRegain) {
    html = replace(html, 'docs-nav', sidebar(file), file);
    html = replace(html, 'page-nav', pageNav(file), file);
  }
  output(file, html);
}
// Old product URLs remain entry points, preserving queries and deep-link fragments.
// They are generated, noindex, and excluded from the sitemap.
const legacyGuides = ['accessories.html', 'alpaca.html', 'ascom.html', 'cameras.html', 'focuscube3.html', 'hardware.html', 'install.html', 'nina.html', 'ofp2.html', 'troubleshooting.html'];
for (const file of legacyGuides) {
  const destination = `regain/${file}`;
  output(`docs/${file}`, `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Regain documentation moved — PulsarFab</title>
  <meta name="description" content="Regain documentation now lives under /docs/regain/.">
  <meta name="robots" content="noindex">
  <link rel="canonical" href="${siteUrl}/docs/${destination}">
  <meta http-equiv="refresh" content="0;url=${destination}">
  <script>location.replace(${JSON.stringify(destination)} + location.search + location.hash);</script>
</head>
<body>
  <nav aria-label="Primary navigation"><a href="./">All documentation</a></nav>
  <main id="main"><h1>Regain documentation has moved</h1><p><a href="${destination}">Continue to the regain guide</a>.</p></main>
</body>
</html>
`);
}
// No build timestamps: generated output is identical locally and in a fresh CI checkout.
output('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.filter(f => f !== '404.html').map(f => `  <url><loc>${url(f)}</loc></url>`).join('\n')}\n</urlset>\n`);
output('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`);
if (check && stale.length) {
  console.error(`Generated output is stale: ${stale.join(', ')}. Run npm run build.`);
  process.exit(1);
}
console.log(`${check ? 'Checked' : 'Generated'} shared elements in ${pages.length} pages, sitemap.xml, and robots.txt.`);
