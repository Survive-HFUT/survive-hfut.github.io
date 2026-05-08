# 开发教程

:::tip

对你来说太难上手？只会写 Word 文档？没关系！

你可以通过[提交反馈](./contribute.md)的方式来参与进来🤩

:::

## 必备条件

### 基础知识

- Git 和 GitHub 的使用方法
  - 推送
  - 提交
  - 同步
  - 提交推送请求（Pull Request）
- Markdown 语法
- 基础开发知识

### 应用

- Git 或 [GitHub Desktop](https://github.com/apps/desktop)
  - 用于提交和推送更改
  - 推荐新手使用 GitHub Desktop
- [nodejs](https://nodejs.org/)
  - 提供 JavaScript 运行环境
- [pnpm](https://pnpm.io/zh/)
  - JavaScript 包管理器，安装依赖和运行脚本
- [VS Code](https://code.visualstudio.com/)
  - 推荐的代码编辑器，支持 Markdown 编辑和 Git 集成

### VS Code 插件

:::tip

非必需。但是装上可以大幅提高编写效率✨

:::

- [markdownlint](https://marketplace.visualstudio.com/items/?itemName=DavidAnson.vscode-markdownlint)
  - 用于检查 Markdown 文档的语法和风格问题
- [Markdown All in One](https://marketplace.visualstudio.com/items/?itemName=yzhang.markdown-all-in-one)
  - 提供一些快捷键和缩进辅助
- [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
  - 将此扩展作为默认的格式化工具

## 编写规范

详见[编写规范](./standard.md)

## 克隆项目

在 GitHub 上 fork 本项目到你的账户下，然后使用 Git 或 GitHub Desktop 将项目克隆到本地

```sh
git clone https://github.com/Survive-HFUT/survive-hfut.github.io.git
```

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

### 构建文档

此命令会将文档构建成静态文件，生成在`docs/.vitepress/dist`目录下

```sh
pnpm run docs:build
```

:::tip
不过通常情况下并不需要你手动这么做，因为此项目会在提交推送时自动使用 GitHub Actions 进行构建和部署
:::

本地构建完成后可以在`docs/.vitepress/dist`目录下找到生成的静态文件，或者直接访问在命令行输出如下命令来查看效果

```sh
pnpm run docs:preview
```

## 图片与性能要求

为避免站点加载变慢，涉及图片时请遵循以下要求：

- 文档内图片统一使用`.webp`格式
- 新增图片后，提交前必须检查体积，尽量避免单图过大（建议控制在几百 KB 以内）
- 优先复用已有图片，不要重复上传同内容的大图

### 常用命令

#### 全量转换为 WebP

将`docs`目录中的`jpg/jpeg/png`转换为`webp`，并自动更新文档引用：

```sh
pnpm run docs:img:webp
```

#### 批量压缩图片

按阈值压缩（会自动备份原图）：

```sh
pnpm run docs:img:compress -- --min-kb=200 --quality=76
```

#### 查看图片与构建体积报告

```sh
pnpm run docs:perf
```

### 备份说明

图片批处理脚本会把原图备份到`docs/.image-backups/`。确认无误后可按需清理备份目录，避免仓库体积持续增长。

## 提交与推送

在完成文档编辑后，你需要将更改提交到 GitHub 仓库。你可以借助 GitHub Desktop 或者直接在 VS Code 的源代码管理界面进行提交和推送

推送到 GitHub 后，你可以在 GitHub 上[发起一个 Pull Request](https://github.com/Survive-HFUT/survive-hfut.github.io/compare)来请求将你的更改合并到主分支

等待 PR 被审核和合并后，你的更改就会被部署到生产环境，其他人也可以看到你的贡献了！🎉
