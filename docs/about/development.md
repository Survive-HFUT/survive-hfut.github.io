# 开发教程

:::tip

对你来说太难上手？只会写 Word 文档？没关系！

- 新手推荐先阅读[参与进来](./contribute.md#快速入门)
- 也可以通过[提交反馈](./contribute#方式二:提交反馈)参与进来🤩

:::

## 必备条件

### 基础知识

| 知识     | 说明         | 学习资源                                             |
| -------- | ------------ | ---------------------------------------------------- |
| Git      | 版本控制工具 | [Git 官方教程](https://git-scm.com/docs/gittutorial) |
| GitHub   | 代码托管平台 | [GitHub Docs](https://docs.github.com/zh)            |
| Markdown | 文档标记语言 | [Markdown 指南](https://www.markdownguide.org/)      |

### 应用

| 应用           | 用途                       | 下载地址                                    |
| -------------- | -------------------------- | ------------------------------------------- |
| GitHub Desktop | Git 图形化工具（推荐新手） | [下载](https://github.com/apps/desktop)     |
| Git            | 命令行 Git 工具            | [下载](https://git-scm.com/)                |
| Node.js        | JavaScript 运行环境        | [下载](https://nodejs.org/)                 |
| pnpm           | 包管理器                   | [安装指南](https://pnpm.io/zh/installation) |
| VS Code        | 代码编辑器                 | [下载](https://code.visualstudio.com/)      |

### VS Code 插件

:::tip
非必需，但是装上可以大幅提高编写效率🚀
:::

- [markdownlint](https://marketplace.visualstudio.com/items/?itemName=DavidAnson.vscode-markdownlint)
    - 用于检查 Markdown 文档的语法和风格问题
- [Markdown All in One](https://marketplace.visualstudio.com/items/?itemName=yzhang.markdown-all-in-one)
    - 提供一些快捷键和缩进辅助
- [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
    - 将此扩展作为默认的格式化工具

## 项目结构

```text
survive-hfut/
├── docs/                    # 文档目录
│   ├── .vitepress/          # VitePress 配置
│   ├── about/               # 关于页面
│   ├── campus/              # 校区相关
│   ├── enrollment/          # 入学相关
│   ├── life/                # 生活相关
│   ├── study/               # 学习相关
│   ├── contact/             # 黄页
│   ├── public/images/       # 图片资源
│   └── index.md             # 首页
├── .agents/                 # AI 技能配置
└── package.json             # 项目配置
```

## 编写规范

详见[编写规范](./standard.md)

## 克隆项目

1. 在 GitHub 上 [Fork 项目](https://github.com/Survive-HFUT/survive-hfut.github.io/fork)
2. 打开 GitHub Desktop
3. 点击「File」→「Clone repository」
4. 选择你 fork 的项目
5. 选择本地保存路径
6. 点击「Clone」

## 命令行操作

在 VS Code 中打开项目文件夹后，可以使用内置的终端（默认快捷键`Ctrl`+`J`）来执行以下命令：

### 安装依赖

用于安装项目所需的依赖包，确保文档能够正确构建和预览

```sh
pnpm install
```

:::tip
运行其他命令之前都需要先执行这个命令来安装依赖，之后如果有新的依赖需要安装也需要重新执行一次
:::

### 运行即时预览

此命令会启动一个本地开发服务器，并在浏览器中打开文档预览界面。你可以在编辑 Markdown 文件时实时看到更改的效果

```sh
pnpm run docs:dev
```

浏览器会自动打开 `http://localhost:5173`，修改文件后页面会自动刷新。

### 构建文档

此命令会将文档构建成静态文件，生成在`docs/.vitepress/dist`目录下

```sh
pnpm run docs:build
```

:::tip
通常情况下不需要手动构建，项目会在提交推送时自动使用 GitHub Actions 进行构建和部署
:::

本地构建完成后可以在`docs/.vitepress/dist`目录下找到生成的静态文件，或者直接访问在命令行输出如下命令来查看效果

```sh
pnpm run docs:preview
```

### 格式检查

提交前建议运行格式检查：

```sh
pnpm dlx markdownlint-cli2 --fix "*.{md,markdown}" "**/*.md" "!node_modules/**"
```

## 提交与推送

:::tip
如果你打算添加共同作者（Co-Author）的话，建议使用 GitHub 所提供的邮箱地址进行更改
:::

### 使用 GitHub Desktop

1. 在 GitHub Desktop 中查看变更文件列表
2. 填写提交说明（如「修复错别字」「添加食堂信息」）
3. 点击「Commit to main」
4. 点击「Push origin」推送到 GitHub

### 使用命令行

```sh
git add .
git commit -m "你的提交说明"
git push origin main
```

## 创建 Pull Request

1. 推送到 GitHub 后，访问你的 fork 页面
2. 点击「Contribute」→「Open pull request」
3. 填写 PR 标题和描述
4. 点击「Create pull request」

:::info 等待审核
PR 创建后，管理员会审核你的修改。审核通过后会自动合并并部署。
:::

## 页面维护

- `正在发生` 的内容来自 `docs/.vitepress/helpers/ongoing.ts`
- 新增事项时，直接往 `events` 数组里补一条即可，日期统一使用 `YYYY-MM-DD`
- 改完后建议执行一次 `pnpm run docs:build`，确认页面仍可正常构建

## 常见问题

详见[常见问题](./faq.md)
