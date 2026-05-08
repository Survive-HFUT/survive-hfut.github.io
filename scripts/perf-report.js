import { readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const DOCS_DIR = path.join(ROOT, 'docs');
const DIST_CHUNKS_DIR = path.join(DOCS_DIR, '.vitepress', 'dist', 'assets', 'chunks');
const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif']);

function walkFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (fullPath.includes(`${path.sep}.vitepress${path.sep}`)) continue;
      if (fullPath.includes(`${path.sep}.image-backups${path.sep}`)) continue;
      out.push(...walkFiles(fullPath));
    } else {
      out.push(fullPath);
    }
  }
  return out;
}

function toMB(bytes) {
  return (bytes / (1024 * 1024)).toFixed(2);
}

function topNBySize(files, n = 15) {
  return files
    .map((file) => ({ file, size: statSync(file).size }))
    .sort((a, b) => b.size - a.size)
    .slice(0, n);
}

const allDocsFiles = walkFiles(DOCS_DIR);
const imageFiles = allDocsFiles.filter((file) =>
  IMAGE_EXTS.has(path.extname(file).toLowerCase()),
);
const imageTotalSize = imageFiles.reduce((sum, file) => sum + statSync(file).size, 0);
const topImages = topNBySize(imageFiles, 20);

let chunkFiles = [];
try {
  chunkFiles = readdirSync(DIST_CHUNKS_DIR)
    .map((name) => path.join(DIST_CHUNKS_DIR, name))
    .filter((file) => statSync(file).isFile() && file.endsWith('.js'));
} catch {
  chunkFiles = [];
}
const topChunks = topNBySize(chunkFiles, 20);

console.log('=== Survive HFUT Performance Snapshot ===');
console.log(`Images count: ${imageFiles.length}`);
console.log(`Images total size: ${toMB(imageTotalSize)} MB`);
console.log('');
console.log('Top 20 images by size:');
for (const item of topImages) {
  const rel = path.relative(ROOT, item.file);
  console.log(`- ${toMB(item.size)} MB  ${rel}`);
}

console.log('');
if (topChunks.length === 0) {
  console.log('No dist chunk data found. Run `npm run docs:build` first.');
} else {
  console.log('Top 20 JS chunks by size:');
  for (const item of topChunks) {
    const rel = path.relative(ROOT, item.file);
    console.log(`- ${toMB(item.size)} MB  ${rel}`);
  }
}
