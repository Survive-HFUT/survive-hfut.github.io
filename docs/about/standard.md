# 编写规范

## 语言风格

:::warning

**不要完全依赖 AI 来生成内容**，尤其是校规校纪、考试相关规定等，需仔细核对

AI 生成的内容语气奇怪，需人工润色

:::

- 语言应中立严谨，风格可略带口语化或添加 Emoji 以避免死板，但不要太多
- 严肃话题（如校规校纪）应保持书面语，并添加通知或校规校纪引用来源
- 违反校规校纪的行为（如考试作弊、违规用电等），应严肃指出其不当之处和可能的后果

### AI 辅助写作

使用支持 Skills 的 AI 工具编写或润色文档，参考仓库内的 `hfut-doc-style` 技能：

```txt
$hfut-doc-style docs/待修改页面.md
```

该技能位于`.agents/skills/hfut-doc-style`目录下，用于减少 AI 味，并统一加粗、`<mark>`、Emoji、引用来源和提示块等写法

## 广告

任何页面**均不允许包含任意形式的广告**，包括但不限于校园卡、二手书推销

:::tip

游戏群、二手群、校园墙等联系方式可添加在[黄页§非官方](../contact/unofficial)页面

:::

## Markdown 语法规范

Markdown 文档应符合基本语法，参考[推荐规范](#推荐规范)编写，允许一定的[扩展语法](#扩展语法)

:::info 规范太多不好写？

别担心🤓👍这并不需要你过于操心

- 在提交前会自动使用[`@lint-md/cli`](https://github.com/lint-md/cli)、[`Prettier`](https://prettier.io/)自动修复部分问题
- 提交后和 PR 后会自动使用 GitHub Actions 进行文档检查
  - 等待运行结束后可以查看输出定位问题

:::

### 扩展语法

- `VitePress`提供的 [Markdown 扩展语法](https://vitepress.dev/zh/guide/markdown)
- `markdown-it`插件提供的扩展语法
  - [脚注](https://mdit-plugins.github.io/zh/footnote.html)
  - [数学公式](https://mdit-plugins.github.io/zh/katex.html)
  - [角标](https://mdit-plugins.github.io/zh/sup.html)
- [Mermaid](https://mermaid.js.org/)

### 推荐规范

- 💡[**中文技术文档的写作规范 `ruanyf/document-style-guide`**](https://github.com/ruanyf/document-style-guide)
- 💡[**中文文案排版指北 `mzlogin/chinese-copywriting-guidelines`**](https://github.com/mzlogin/chinese-copywriting-guidelines)
- [GitHub Flavored Markdown Spec（英）](https://github.github.com/gfm/)
- [GitHub 风格的 Markdown 规范（前者的非官方中文译本）](https://gfm.docschina.org/zh-hans/)

## 引用标注

引用非本站的内容（书籍文本、小红书、贴吧、政府或校方的规定或通知、新闻等），需参考`GB/T 7714-2015`《信息与文献 参考文献著录规则》或[论文中引用网页内容在文中怎么标注？](https://www.zhihu.com/question/457765989/answer/3356593666)标注引用来源

- 日期均采用`YYYY-MM-DD`格式表示，一位数的数字前需补`0`，如`2025-05-14`
- 在引用文本片段末尾添加角标，在页面末尾添加引用来源说明

### 格式

#### 电子文献

```md
[^n]:
    发布主体.标题[DB/OL]. (发布日期)\[引用日期].
    <链接>
```

#### 纸质文献

```md
[^n]: 作者.书名[M].出版地:出版者,出版年.
```

当发布日期或引用日期不明确或缺失时可省略

### 示例

```md
这是一段文本[^1]

[^1]:
    合肥工业大学.@全体 HFUTers，快来 pick 校全媒体中心！[DB/OL]. (2021-03-27)\[2024-10-03].  
    <https://mp.weixin.qq.com/s/L6Pv3mONAEVUwZ_dcDJV1g>
```

:::info 解析后如下

这是一段文本<sup><a>[1]</a></sup>

1. 合肥工业大学.@全体 HFUTers，快来 pick 校全媒体中心！ (2021-03-27)\[2024-10-03].  
   <https://mp.weixin.qq.com/s/L6Pv3mONAEVUwZ_dcDJV1g> <a>↩︎</a>

:::
