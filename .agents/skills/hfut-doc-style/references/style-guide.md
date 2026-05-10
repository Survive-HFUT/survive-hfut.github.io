# Style Guide

## Priority Sources

Use these repository files as the main style anchors:

- `docs/study/exemption.md`: balanced handling of policy, statistics, caveats, footnotes, tips, warnings, and limited humor.
- `docs/enrollment/qa.md`: concise Q&A style, practical student-facing answers, tabs, `<mark>`, short explanations, and internal links.
- `docs/about/standard.md`: official writing rules for neutrality, rigor, citations, advertising, Markdown, and AI-generated copy.

When older pages conflict with these files, follow these priority sources.

## Voice

Target voice: reliable senior student guide with documentation discipline.

Characteristics:

- Direct: answer the user's likely question quickly before adding caveats.
- Concrete: give numbers, locations, app names, document names, and steps when known.
- Scoped: say where a statement applies, especially campus, year, college, grade, or scenario.
- Calm: avoid fearmongering, sales tone, and emotional praise.
- Lightly human: occasional phrases such as “简单来说”“还行”“入乡随俗” are acceptable on low-risk pages, but should not dominate.

Avoid:

- AI boilerplate: “本文将深入探讨”“帮助大家更好地了解”“具有重要意义”“不容忽视”“综上所述”.
- Empty transitions: “首先需要明确的是”“与此同时”“另外值得一提的是” unless they genuinely organize dense information.
- Unsupported certainty: “一定”“绝对”“不会”“所有学院都” unless directly supported.
- Overfriendly chat tone: “宝子们”“冲就完了”“闭眼入”“狠狠爱了”.
- Promotional wording: “超值”“强烈推荐购买”“必买”“良心商家”.

## Topic Risk Levels

### Low-risk practical content

Examples:宿舍体验、食堂、交通、软件入口、生活技巧。

- Can be concise and slightly relaxed.
- Can include personal-observation language: “大部分”“一般”“可能”“据反馈”.
- Prefer practical answer plus caveat.

### Medium-risk procedural content

Examples:报到流程、校园卡、选课、转专业、医保报销、学生票。

- Use numbered steps when the order matters.
- Mention required materials and failure cases.
- Add “以当年通知/系统页面为准” where rules change.
- Link to official or existing internal page when available.

### High-risk policy/safety content

Examples:考试、处分、校规、反诈、违规用电、校外租房、保研、入党、费用。

- Prefer written Chinese and citations.
- Preserve official terms exactly.
- Do not joke about consequences.
- Use `:::warning` for risk and consequences.
- Use `<mark>` for important distinctions inside a paragraph; use bold for the consequence or hard requirement.

## Structure Patterns

### Guide page

Use a title, short lead, then sections by user task or scenario. Put prerequisites before steps. Put caveats near the step they affect.

### VitePress nesting

When nesting admonitions inside tabs, use different fence lengths to avoid ambiguous closing:

```md
::::tabs key:campus
== 宣城校区

:::info 关于“重复参保”的处理

提示内容

:::

::::
```

Do not use `:::tabs` outside and `:::info` inside in the same block unless the close positions are unambiguous.

### Q&A page

Follow `docs/enrollment/qa.md`:

- `##` for broad category.
- `###` for subcategory when needed.
- `#### ❔ 问题` for individual questions.
- Answer directly in one or a few short paragraphs.
- Use `:::info` to point to detailed pages.
- Use tabs for campus-specific answers.

### Policy/statistics page

Follow `docs/study/exemption.md`:

- Start with definition or scope.
- Separate official requirements, interpretation, data, and related notices.
- Put unofficial or uncertain data in warnings.
- Keep footnotes near claims.
- Use details blocks for side stories or humor, not the main rule.

## Emphasis Rules

Use bold for:

- Mandatory or prohibited actions.
- Hard thresholds, deadlines, consequences.
- Critical distinctions likely to be misunderstood.
- The core warning in a warning block.

Use `<mark>` for:

- Search keywords.
- Names that need visual attention but are not warnings.
- Secondary reminders inside longer sentences.
- Contrastive terms such as “校园卡” vs “校园流量卡”.

Avoid:

- Bold list labels such as `- **核心用途**:` unless preserving an existing format in a page that consistently uses it.
- Stacking `<mark>**...**</mark>` unless the content is both visually highlighted and truly critical.
- Full paragraphs in bold.

## Emoji And Humor

Allowed:

- One Emoji in a `details` title or light tip if it matches existing page tone.
- The `❔` marker in Q&A headings.
- Occasional jokes in `:::details` or clearly low-risk asides.

Avoid:

- Multiple Emoji in a row.
- Emoji in serious warning blocks.
- Humor in policy consequences, fraud prevention, safety, exam discipline, or mental/financial hardship sections.

## Citations And Uncertainty

- Use footnotes for external facts, official notices, historical events, statistics, and quoted text.
- Do not add a footnote when a link is only an entry point or further-reading link and does not support a specific factual claim.
- Use `YYYY-MM-DD` dates in citations when available.
- If a source is unofficial, label the limitation near the claim, not only in the footnote.
- If the text is based on experience rather than a source, qualify it: “据反馈”“通常”“可能因导员/学院而异”.
- If the claim needs later verification, use `<Note>需要验证</Note>` rather than presenting it as settled.

## Final Review Checklist

Before finishing a rewrite:

- Does the page answer practical student questions without generic AI filler?
- Are policy and data claims sourced or qualified?
- Are bold and `<mark>` used for different levels of emphasis?
- Are list labels not unnecessarily bolded?
- Are Emoji rare and context-appropriate?
- Are original links, anchors, footnotes, tabs, admonitions, and custom components preserved?
- Did any rewrite change the factual meaning or scope?
