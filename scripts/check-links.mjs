import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
function htmlFiles(directory) {
  return fs.readdirSync(path.join(root, directory), { withFileTypes: true }).flatMap(entry =>
    entry.isDirectory() ? htmlFiles(`${directory}/${entry.name}`) : entry.name.endsWith('.html') ? [`${directory}/${entry.name}`] : []);
}
const pages = ['index.html', '404.html', ...htmlFiles('docs')];
const errors = [];
const cache = new Map();
function read(file) {
  if (!cache.has(file)) cache.set(file, fs.readFileSync(file, 'utf8'));
  return cache.get(file);
}
for (const file of pages) {
  const full = path.join(root, file);
  const html = read(full);
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
  if (new Set(ids).size !== ids.length) errors.push(`${file}: duplicate HTML IDs`);
  for (const pattern of [/<html lang="en">/, /<title>.+<\/title>/, /<meta name="description" content="[^"]+"/, /<main\b[^>]*id="main"/, /aria-label="Primary navigation"/]) {
    if (!pattern.test(html)) errors.push(`${file}: missing required landmark or metadata ${pattern}`);
  }
  for (const match of html.matchAll(/<img\b[^>]*>/g)) {
    if (!/\balt="[^"]*"/.test(match[0])) errors.push(`${file}: image without alt text`);
  }
  if (file.startsWith('docs/regain/') && !html.includes(`<link rel="canonical" href="https://pulsarfab.com/${file.replace(/\/index\.html$/, '/')}">`)) errors.push(`${file}: wrong scoped canonical URL`);
  for (const [, raw] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (/^(?:https?:|mailto:|data:)/.test(raw)) continue;
    const [targetPath, fragment] = raw.split('#');
    const clean = targetPath.split('?')[0];
    let target = clean ? (clean.startsWith('/') ? path.join(root, clean) : path.resolve(path.dirname(full), clean)) : full;
    if (!target.startsWith(root + path.sep) && target !== root) { errors.push(`${file}: link outside site ${raw}`); continue; }
    if (fs.existsSync(target) && fs.statSync(target).isDirectory()) target = path.join(target, 'index.html');
    if (!fs.existsSync(target)) { errors.push(`${file}: missing ${raw}`); continue; }
    if (fragment && target.endsWith('.html')) {
      const targetIds = [...read(target).matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
      if (!targetIds.includes(decodeURIComponent(fragment))) errors.push(`${file}: missing fragment ${raw}`);
    }
  }
}
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log(`Checked links, fragments, images, IDs, and landmarks in ${pages.length} HTML pages.`);
