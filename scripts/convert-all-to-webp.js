import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();
const DOCS_DIR = path.join(ROOT, 'docs');
const BACKUP_ROOT = path.join(DOCS_DIR, '.image-backups');
const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png']);
const TARGET_EXT = '.webp';

function walkFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (full.includes(`${path.sep}.vitepress${path.sep}`)) continue;
      if (full.includes(`${path.sep}.image-backups${path.sep}`)) continue;
      if (full.includes(`${path.sep}public${path.sep}`)) continue;
      out.push(...walkFiles(full));
      continue;
    }
    out.push(full);
  }
  return out;
}

function ensureDir(dir) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function fmtMB(bytes) {
  return (bytes / (1024 * 1024)).toFixed(2);
}

function escRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const now = new Date();
const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
  now.getDate(),
).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(
  now.getMinutes(),
).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
const backupDir = path.join(BACKUP_ROOT, `webp-${stamp}`);
ensureDir(backupDir);

const allFiles = walkFiles(DOCS_DIR);
const imageFiles = allFiles.filter((file) =>
  IMAGE_EXTS.has(path.extname(file).toLowerCase()),
);
const mdFiles = allFiles.filter((file) => file.endsWith('.md'));

if (imageFiles.length === 0) {
  console.log('No jpg/jpeg/png files found.');
  process.exit(0);
}

let originalTotal = 0;
let webpTotal = 0;
const converted = [];

for (const imageFile of imageFiles) {
  const relFromDocs = path.relative(DOCS_DIR, imageFile);
  const ext = path.extname(imageFile);
  const base = imageFile.slice(0, -ext.length);
  const webpFile = `${base}${TARGET_EXT}`;
  const backupPath = path.join(backupDir, relFromDocs);

  ensureDir(path.dirname(backupPath));
  cpSync(imageFile, backupPath);

  await sharp(imageFile, { animated: false })
    .rotate()
    .webp({ quality: 80, effort: 5 })
    .toFile(webpFile);

  const oldSize = statSync(imageFile).size;
  const newSize = statSync(webpFile).size;
  originalTotal += oldSize;
  webpTotal += newSize;

  converted.push({
    oldAbs: imageFile,
    newAbs: webpFile,
    oldRel: relFromDocs.replaceAll('\\', '/'),
    newRel: path.relative(DOCS_DIR, webpFile).replaceAll('\\', '/'),
    oldExt: ext.toLowerCase(),
  });
}

for (const mdFile of mdFiles) {
  let text = readFileSync(mdFile, 'utf8');
  let changed = false;

  const mdDir = path.dirname(mdFile);
  for (const item of converted) {
    const oldName = path.basename(item.oldRel);
    const newName = path.basename(item.newRel);

    const localAbs = path.resolve(mdDir, oldName);
    const localAbsWithDot = path.resolve(mdDir, `./${oldName}`);

    // Fast path: only attempt replacement for files in same directory by filename.
    if (localAbs !== item.oldAbs && localAbsWithDot !== item.oldAbs) {
      // Fallback for nested relative paths.
      const relFromMd = path.relative(mdDir, item.oldAbs).replaceAll('\\', '/');
      const relPatterns = [relFromMd, `./${relFromMd}`];

      for (const relPat of relPatterns) {
        const next = relPat.replace(
          new RegExp(`${escRegex(item.oldExt)}$`, 'i'),
          TARGET_EXT,
        );
        const re = new RegExp(escRegex(relPat), 'g');
        if (re.test(text)) {
          text = text.replace(re, next);
          changed = true;
        }
      }
      continue;
    }

    const re = new RegExp(escRegex(oldName), 'g');
    if (re.test(text)) {
      text = text.replace(re, newName);
      changed = true;
    }
  }

  if (changed) {
    writeFileSync(mdFile, text, 'utf8');
  }
}

for (const item of converted) {
  unlinkSync(item.oldAbs);
}

console.log(`Converted files: ${converted.length}`);
console.log(`Original total: ${fmtMB(originalTotal)} MB`);
console.log(`WebP total: ${fmtMB(webpTotal)} MB`);
console.log(`Saved: ${fmtMB(originalTotal - webpTotal)} MB`);
console.log(`Backup dir: ${path.relative(ROOT, backupDir)}`);
