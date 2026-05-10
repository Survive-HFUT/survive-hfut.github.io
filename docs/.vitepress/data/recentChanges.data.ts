import simpleGit from 'simple-git';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const DOCS_PREFIX = 'docs/';
const MD_SUFFIX = '.md';
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');

function normalizePath(filePath: string): string {
  return filePath.replace(/\\/g, '/').trim();
}

function extractFiles(output: string): string[] {
  return output
    .split(/\r?\n/)
    .map((line) => normalizePath(line))
    .filter((line) => line.length > 0);
}

function isDocsMarkdown(filePath: string): boolean {
  return filePath.startsWith(DOCS_PREFIX) && filePath.endsWith(MD_SUFFIX);
}

function parseDate(dateValue: string): Date | null {
  const parsed = new Date(dateValue);
  return isNaN(parsed.getTime()) ? null : parsed;
}

export default {
  async load() {
    try {
      const git = simpleGit({ baseDir: repoRoot });
      const log = await git.log();
      const fileUpdates = new Map<string, Date>();

      for (const commit of log.all) {
        if (fileUpdates.size >= 30) {
          break;
        }

        const updatedAt = parseDate(commit.date);

        if (!updatedAt) {
          continue;
        }

        const output = await git.show([
          commit.hash,
          '--name-only',
          '--pretty=format:',
        ]);

        for (const filePath of extractFiles(output)) {
          if (fileUpdates.size >= 50) {
            break;
          }

          if (isDocsMarkdown(filePath)) {
            if (!fileUpdates.has(filePath)) {
              fileUpdates.set(filePath, updatedAt);
            }
          }
        }
      }

      return Array.from(fileUpdates, ([path, updatedAt]) => ({
        path,
        updatedAt,
      }))
        .toSorted((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
        .map(({ path, updatedAt }) => ({
          path,
          updatedAt: updatedAt.toISOString(),
        }));
    } catch (error) {
      console.warn('[recent-changes] Failed to read git history.', error);
      return [];
    }
  },
};
