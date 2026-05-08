import fs from 'node:fs';
import path from 'node:path';

async function sync() {
  console.log('Syncing Issue #44 to docs/about/todo.md...');
  
  const url = 'https://api.github.com/repos/Survive-HFUT/survive-hfut.github.io/issues/44';
  const headers = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'survive-hfut-sync-script'
  };

  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(url, { 
      headers, 
      signal: controller.signal 
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 403) {
        console.warn('\n[Warning] GitHub API 额度已耗尽，跳过同步。\n');
      } else {
        console.warn(`\n[Warning] 请求失败: ${response.status} ${response.statusText}\n`);
      }
      return;
    }

    const issue = await response.json();

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
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      console.warn('\n[Warning] 同步请求超时，跳过同步。\n');
    } else {
      console.warn('\n[Warning] 同步过程中发生错误:', error.message, '\n');
    }
  }
}

// 执行并让 Node.js 自然退出，不使用 process.exit 避免触发 Windows 上的 UV 异常
sync();
