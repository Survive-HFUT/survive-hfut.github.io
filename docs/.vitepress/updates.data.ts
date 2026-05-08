import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

export interface UpdateInfo {
  path: string;
  title: string;
  author: string;
  authorEmail: string;
  date: string;
  hash: string;
}

export default {
  load() {
    try {
      // Get the last 10 commits with changed files
      // %H: commit hash, %an: author name, %ae: author email, %ad: author date, %s: subject
      // Use --max-count and handle potential empty/shallow clones
      const log = execSync('git log -n 10 --pretty=format:"%H|%an|%ae|%ad|%s" --name-only', { 
        encoding: 'utf-8',
        stdio: ['ignore', 'pipe', 'ignore'] // Ignore stderr to avoid noise
      });
      
      if (!log) return [];

      const lines = log.split('\n');
      const updates: UpdateInfo[] = [];
      let currentCommit: any = null;

      for (const line of lines) {
        if (line.includes('|')) {
          const [hash, author, email, date, subject] = line.split('|');
          currentCommit = { hash, author, email, date };
        } else if (line.trim() && line.endsWith('.md')) {
          const filePath = line.trim();
          if (filePath.startsWith('docs/')) {
            const fullPath = path.resolve(process.cwd(), filePath);
            if (fs.existsSync(fullPath)) {
              let title = '';
              const content = fs.readFileSync(fullPath, 'utf-8');
              const titleMatch = content.match(/^#\s+(.*)/m);
              if (titleMatch) {
                title = titleMatch[1];
              } else {
                title = path.basename(filePath, '.md');
              }

              // Avoid duplicates in the same list
              if (!updates.find(u => u.path === filePath)) {
                updates.push({
                  path: '/' + filePath.replace(/^docs\//, '').replace(/\.md$/, ''),
                  title,
                  author: currentCommit?.author || 'Unknown',
                  authorEmail: currentCommit?.email || '',
                  date: currentCommit?.date || new Date().toISOString(),
                  hash: currentCommit?.hash || '000000'
                });
              }
            }
          }
        }
        if (updates.length >= 10) break;
      }

      return updates;
    } catch (e) {
      // Return empty array instead of crashing the build
      return [];
    }
  }
};
