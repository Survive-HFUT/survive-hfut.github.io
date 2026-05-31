# 常见问题

## 环境搭建

### pnpm install 报错怎么办？

:::details 错误信息：pnpm: command not found

pnpm 尚未安装。执行以下命令安装：

```sh
npm install -g pnpm
```

如果 npm 也未安装，请先安装 [Node.js](https://nodejs.org/)。
:::

:::details 错误信息：ERR_PNPM_NO_GLOBAL_BIN_DIR

pnpm 找不到全局安装目录。执行以下命令设置：

```sh
pnpm setup
```

然后重启终端。
:::

:::details 错误信息：ERR_PNPM_FETCH_404

依赖包可能已更名或删除。尝试清除缓存后重装：

```sh
pnpm store prune
pnpm install
```

:::

### pnpm run docs:dev 启动失败怎么办？

:::details 错误信息：EADDRINUSE: address already in use

端口被占用。关闭占用端口的程序，或使用其他端口：

```sh
pnpm run docs:dev --port 5174
```

:::

:::details 错误信息：Module not found

依赖未安装完整。重新安装：

```sh
rm -rf node_modules
pnpm install
```

:::

### Node.js 版本要求是什么？

推荐使用 Node.js 18 或更高版本。查看当前版本：

```sh
node -v
```

如果版本过低，请前往 [Node.js 官网](https://nodejs.org/) 下载最新 LTS 版本。

## 编写内容

### Markdown 不会写怎么办？

推荐以下学习资源：

- [Markdown 官方教程](https://www.markdownguide.org/basic-syntax/)
- [菜鸟教程 Markdown](https://www.runoob.com/markdown/md-tutorial.html)
- VS Code 中按 `Ctrl` + `Shift` + `V` 预览 Markdown

### 如何添加图片？

1. 将图片放入 `docs/public/images/` 目录
2. 在 Markdown 中引用：

```md
![图片描述](/images/图片文件名.png)
```

:::warning 注意

- 图片文件名建议使用英文
- 图片大小建议不超过 1MB
- 推荐使用 WebP 或 PNG 格式
  :::

### 如何添加链接？

```md
<!-- 内部链接 -->

[页面名称](./相对路径.md)

<!-- 外部链接 -->

[网站名称](https://example.com)

<!-- 锚点链接 -->

[章节标题](#章节标题)
```

## 提交流程

### Fork 是什么？

Fork 是在你的 GitHub 账户下创建一份项目副本。你可以在自己的副本上自由修改，不影响原项目。

### Pull Request 是什么？

Pull Request（PR）是请求项目管理员将你的修改合并到主分支的机制。管理员审核后合并。

### PR 一直没被合并怎么办？

1. 检查是否有冲突需要解决
2. 检查 CI 是否通过（GitHub 页面底部会显示状态）
3. 在 PR 评论区礼貌询问进度
4. 加入[交流群](https://qm.qq.com/cgi-bin/qm/qr?_wv=1027&k=hnhYa-TdwN9v_2f4wXmayC1V0vcdNUEx&authKey=pZs4xDQrK0eFcl2oKMtHB2E9O%2FqXX8SA%2FNNELsIR9t6kgC0YKqxVTrdl9t%2FpI6nO&noverify=0&group_code=812229258)联系管理员

### 如何同步上游更新？

如果你的 fork 落后于主仓库，需要同步更新：

:::details 使用 GitHub Desktop

1. 点击「Branch」→「Merge into current branch」
2. 选择「upstream/main」
3. 点击「Merge」

:::

:::details 使用命令行

```sh
git remote add upstream https://github.com/Survive-HFUT/survive-hfut.github.io.git
git fetch upstream
git merge upstream/main
git push
```

:::

## 构建问题

### 构建失败怎么办？

:::details 错误信息包含 YAML

可能是 Markdown 文件中有 YAML 语法错误。检查 frontmatter 格式：

```md
---
title: 页面标题
description: 页面描述
---
```

:::

:::details 错误信息包含 Markdown

检查 Markdown 语法是否正确，常见问题：

- 代码块未正确闭合
- 链接格式错误
- 图片路径错误

:::

## 其他问题

### 如何报告网站 Bug？

1. 在 [GitHub Issues](https://github.com/Survive-HFUT/survive-hfut.github.io/issues/new) 提交
2. 描述问题复现步骤
3. 提供浏览器和系统信息
4. 附上截图或录屏

### 如何成为项目维护者？

1. 持续贡献优质内容
2. 积极参与 PR 审核
3. 在交流群中帮助其他贡献者
4. 联系现有管理员申请
