import { cpSync, existsSync, mkdirSync, readdirSync, renameSync, statSync, unlinkSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();
const DOCS_DIR = path.join(ROOT, 'docs');
const BACKUP_ROOT = path.join(DOCS_DIR, '.image-backups');
const TMP_DIR = path.join(BACKUP_ROOT, '.tmp');
const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png']);

const args = new Map(
  process.argv.slice(2).map((arg) => {
    const [k, ...rest] = arg.split('=');
    return [k, rest.join('=') || 'true'];
  }),
);

const quality = Number(args.get('--quality') ?? 78);
const minKB = Number(args.get('--min-kb') ?? 250);
const topN = Number(args.get('--top') ?? 0);

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

function ensureDir(p) {
  if (!existsSync(p)) mkdirSync(p, { recursive: true });
}

async function runSharp(input, output, ext) {
  const pipeline = sharp(input, { animated: false }).rotate();

  if (ext === '.jpg' || ext === '.jpeg') {
    await pipeline
      .jpeg({ quality, mozjpeg: true, progressive: true })
      .toFile(output);
    return;
  }

  if (ext === '.png') {
    await pipeline
      .png({
        quality,
        compressionLevel: 9,
        progressive: true,
        palette: true,
      })
      .toFile(output);
    return;
  }

  throw new Error(`Unsupported extension: ${ext}`);
}

function toMB(bytes) {
  return (bytes / (1024 * 1024)).toFixed(2);
}

const now = new Date();
const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
  now.getDate(),
).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(
  now.getMinutes(),
).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;

ensureDir(BACKUP_ROOT);
ensureDir(TMP_DIR);

let candidates = walkFiles(DOCS_DIR)
  .filter((f) => IMAGE_EXTS.has(path.extname(f).toLowerCase()))
  .map((f) => ({ file: f, size: statSync(f).size }))
  .filter((x) => x.size >= minKB * 1024)
  .sort((a, b) => b.size - a.size);

if (topN > 0) {
  candidates = candidates.slice(0, topN);
}

if (candidates.length === 0) {
  console.log('No matching images found.');
  process.exit(0);
}

const backupDir = path.join(BACKUP_ROOT, stamp);
ensureDir(backupDir);

let originalTotal = 0;
let compressedTotal = 0;
let changedCount = 0;

for (const item of candidates) {
  const rel = path.relative(DOCS_DIR, item.file);
  const backupPath = path.join(backupDir, rel);
  const ext = path.extname(item.file).toLowerCase();
  const tmpPath = path.join(
    TMP_DIR,
    `${path.basename(item.file, path.extname(item.file))}-${Date.now()}${path.extname(item.file)}`,
  );

  ensureDir(path.dirname(backupPath));
  cpSync(item.file, backupPath);

  try {
    await runSharp(item.file, tmpPath, ext);
  } catch {
    console.log(`skip (compress failed): ${rel}`);
    continue;
  }

  if (!existsSync(tmpPath)) {
    console.log(`skip (compress failed): ${rel}`);
    continue;
  }

  const oldSize = statSync(item.file).size;
  const newSize = statSync(tmpPath).size;

  if (newSize < oldSize) {
    renameSync(tmpPath, item.file);
    originalTotal += oldSize;
    compressedTotal += newSize;
    changedCount += 1;
    console.log(
      `ok  ${rel}  ${toMB(oldSize)}MB -> ${toMB(newSize)}MB  (-${toMB(oldSize - newSize)}MB)`,
    );
  } else {
    unlinkSync(tmpPath);
    console.log(`skip (not smaller): ${rel}`);
  }
}

if (changedCount === 0) {
  console.log(`No files replaced. Backup at: ${path.relative(ROOT, backupDir)}`);
  process.exit(0);
}

const saved = originalTotal - compressedTotal;
console.log('');
console.log(`Changed files: ${changedCount}`);
console.log(`Original total: ${toMB(originalTotal)} MB`);
console.log(`Compressed total: ${toMB(compressedTotal)} MB`);
console.log(`Saved: ${toMB(saved)} MB`);
console.log(`Backup dir: ${path.relative(ROOT, backupDir)}`);
