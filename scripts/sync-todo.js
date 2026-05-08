import { Octokit } from 'octokit';
import fs from 'node:fs';
import path from 'node:path';

async function sync() {
  console.log('Syncing Issue #44 to docs/about/todo.md...');
  try {
    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });
    const { data: issue } = await octokit.rest.issues.get({
      owner: 'Survive-HFUT',
      repo: 'survive-hfut.github.io',
      issue_number: 44,
    });

    const content = `# ${issue.title}

本页面自动同步自 [GitHub Issue #44](${issue.html_url})。欢迎各位同学积极参与贡献！

> 最近同步时间：${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}

${issue.body}

---

:::tip 参与贡献
如果你有兴趣完成以上任何一项任务，欢迎参考 [参与贡献](./contribute.md) 页面了解如何提交修改！
:::
`;

    const targetPath = path.resolve('docs/about/todo.md');
    fs.writeFileSync(targetPath, content, 'utf8');
    console.log('Successfully synced TODO list!');
  } catch (error) {
    if (error.status === 403 && error.headers['x-ratelimit-remaining'] === '0') {
      console.warn('\n[Warning] GitHub API 额度已耗尽，跳过本次 TODO 同步。');
      console.warn('建议设置 GITHUB_TOKEN 环境变量以增加额度。\n');
    } else {
      console.error('Failed to sync TODO list:', error.message);
    }
    // 不要退出 1，否则会导致 docs:dev 启动失败
    process.exit(0);
  }
}

sync();
