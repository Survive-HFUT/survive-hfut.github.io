import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const DOCS_DIR = path.join(ROOT, 'docs');

function walkFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (full.includes(`${path.sep}.vitepress${path.sep}`)) continue;
      if (full.includes(`${path.sep}.image-backups${path.sep}`)) continue;
      out.push(...walkFiles(full));
      continue;
    }
    out.push(full);
  }
  return out;
}

function isRemote(url) {
  return /^([a-z]+:)?\/\//i.test(url) || url.startsWith('data:');
}

function rewriteIfWebpExists(url, mdDir) {
  if (isRemote(url)) return url;
  if (!/\.(png|jpe?g)([?#].*)?$/i.test(url)) return url;

  const [base, suffix = ''] = url.split(/([?#].*)/);
  const nextBase = base.replace(/\.(png|jpe?g)$/i, '.webp');
  const target = path.resolve(mdDir, nextBase);
  if (!existsSync(target) || !statSync(target).isFile()) return url;
  return `${nextBase}${suffix}`;
}

const mdFiles = walkFiles(DOCS_DIR).filter((f) => f.endsWith('.md'));
let changedFiles = 0;
let replaced = 0;

for (const mdFile of mdFiles) {
  const mdDir = path.dirname(mdFile);
  let text = readFileSync(mdFile, 'utf8');
  let localReplaced = 0;

  text = text.replace(/!\[[^\]]*]\(([^)]+)\)/g, (m, url) => {
    const next = rewriteIfWebpExists(url.trim(), mdDir);
    if (next !== url.trim()) {
      localReplaced += 1;
      return m.replace(url, next);
    }
    return m;
  });

  text = text.replace(/<img\s+[^>]*src=["']([^"']+)["'][^>]*>/gi, (m, url) => {
    const next = rewriteIfWebpExists(url.trim(), mdDir);
    if (next !== url.trim()) {
      localReplaced += 1;
      return m.replace(url, next);
    }
    return m;
  });

  text = text.replace(/^(\[[^\]]+]:\s*)(\S+)\s*$/gm, (m, prefix, url) => {
    const next = rewriteIfWebpExists(url.trim(), mdDir);
    if (next !== url.trim()) {
      localReplaced += 1;
      return `${prefix}${next}`;
    }
    return m;
  });

  if (localReplaced > 0) {
    writeFileSync(mdFile, text, 'utf8');
    changedFiles += 1;
    replaced += localReplaced;
  }
}

console.log(`Changed markdown files: ${changedFiles}`);
console.log(`Replaced references: ${replaced}`);
