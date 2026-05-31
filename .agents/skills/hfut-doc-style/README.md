# HFUT 文档风格 Skill

这个 Skill 用于辅助编写、改写和审校 Survive-HFUT 的 Markdown 文档。重点是减少 AI 生成味，贴近本站现有文风。

## 快速开始

### 使用方式
```txt
$hfut-doc-style docs/待修改页面.md
```

### 核心目标
1. **消除 AI 味道**：删除 "总的来说"、"值得注意的是"、"在当今时代" 等词语
2. **保持学生指南语气**：使用 "可以参考"、"建议提前准备"、"通常"
3. **谨慎处理风险内容**：考试、处分、费用等需要引用来源

## 工作流程

1. 阅读目标页面和同目录下相近页面
2. 保留事实、链接、脚注、图片、组件和 Markdown 结构
3. 对制度、流程、费用、处分、报销、考试等内容，优先核对官方通知或已有引用
4. 修改后运行格式检查：
   ```sh
   pnpm run docs:lint
   ```
5. 人工复查最终内容，尤其是政策、年份、金额、时间、地点和办理流程

## 写作原则

### 必须做
- 删除重复铺垫
- 使用短句
- 保留具体信息
- 使用 `:::warning` 标注风险
- 使用 `<mark>` 标注重要区分

### 不要做
- 使用 AI 味道词语
- 过度加粗
- Emoji 过多
- 改变事实含义
- 完全依赖 AI 生成内容

## 详细参考

- 完整规则：[`SKILL.md`](./SKILL.md)
- 风格指南：[`references/style-guide.md`](./references/style-guide.md)
- 改写示例：[`references/rewrite-patterns.md`](./references/rewrite-patterns.md)
