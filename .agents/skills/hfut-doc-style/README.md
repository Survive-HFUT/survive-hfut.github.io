# HFUT 文档风格 Skill

这个 Skill 用于辅助编写、改写和审校 Survive-HFUT 的 Markdown 文档，重点是减少 AI 生成味，并尽量贴近本站现有文风。

适用场景：

- 使用 AI 新增或改写 `docs/` 下的页面
- 润色已有内容，使表达更自然、克制、严谨
- 检查加粗、`<mark>`、Emoji、提示块、脚注和引用来源是否合适
- 处理校规、考试、医保、保研、反诈等需要谨慎表述的内容

## 使用方式

在支持 Skills 的 AI 工具中，可以直接这样调用：

```txt
$hfut-doc-style docs/待修改页面.md
```

也可以描述具体目标，例如：

```txt
$hfut-doc-style docs/life/medical_insurance.md 帮我改写这一页，保留事实和链接，减少 AI 味
```

```txt
$hfut-doc-style docs/enrollment/preparation.md 检查这页有没有过度加粗、Emoji 过多或语气太 AI 的地方
```

## 推荐流程

1. 先阅读或让 AI 阅读目标页面及同目录下相近页面
2. 保留事实、链接、脚注、图片、组件和 Markdown 结构
3. 对制度、流程、费用、处分、报销、考试等内容，优先核对官方通知或已有引用
4. 修改后运行文档构建：

```sh
npm run docs:build
```

5. 人工复查最终内容，尤其是政策、年份、金额、时间、地点和办理流程

## 写作原则

- 不要完全依赖 AI 生成内容
- 不要把文章改成官方通报，也不要改成聊天口吻
- 加粗只用于真正需要重点提示的内容
- 非重点但需要突出时，可以使用 `<mark>`
- Emoji 可以少量使用，但不要为了活泼而堆叠
- 不确定的内容不要写死，可使用“通常”“可能”“以当年通知为准”或 `<Note>需要验证</Note>`

更完整的规则见：

- [`SKILL.md`](./SKILL.md)
- [`references/style-guide.md`](./references/style-guide.md)
- [`references/rewrite-patterns.md`](./references/rewrite-patterns.md)
