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
- Understated: prefer “可以参考”“建议提前准备”“通常” to repeated enthusiasm or urgency.
- Maintainer-like: sound like a student who has used the service or read the notice, not like an official account explaining the whole background.

Avoid:

- AI boilerplate: “本文将深入探讨”“帮助大家更好地了解”“具有重要意义”“不容忽视”“综上所述”.
- Empty transitions: “首先需要明确的是”“与此同时”“另外值得一提的是” unless they genuinely organize dense information.
- Unsupported certainty: “一定”“绝对”“不会”“所有学院都” unless directly supported.
- Overfriendly chat tone: “宝子们”“冲就完了”“闭眼入”“狠狠爱了”.
- Promotional wording: “超值”“强烈推荐购买”“必买”“良心商家”.
- Ceremonial warmth when it does not add information: “暖心”“欢迎大家踊跃参与”“为同学们保驾护航”.
- Habitual urgency: “务必”“千万不要”“必须马上” unless the consequence is direct and supported.
- Grand conclusions and slogans: “具有重要意义”“为校园发展贡献力量”“开启精彩大学生活”.

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

If a page grows a long “实用提醒” or “注意事项” section, first try moving each reminder to the section where it becomes actionable. For example, safety reminders belong near offline practice/travel, material retention belongs near 结项, and fee/住宿 caveats belong near 项目对接.

The recent local maintenance pattern favors small page splits over monolithic pages. If a page mixes several independent workflows, split it into child pages or section files when the sidebar already supports that structure, such as `sports_fitness/index.md`, `running_and_fitness.md`, and `test.md`.

### Campus tabs

Use campus tabs when scope differs:

- Use `== 合肥校区` when 屯溪路、翡翠湖、六安路 share the same answer.
- Use separate tabs when location, price, address, or process differs.
- Put 宣城-specific lived details under `== 宣城校区`, not in an unscoped paragraph.
- Prefer campus order that helps comparison: 合肥校区写在宣城校区前；全部拆开时按屯溪路、翡翠湖、六安路、宣城排列.
- Avoid empty campus tabs unless the page is intentionally scaffolded for future content.

### Templates

For complaint letters, 申请表说明, or message templates:

- Put the reusable template directly inside `:::details` or a clearly named section.
- Do not add a paragraph explaining that the template is generic if the placeholders already show it.
- Keep placeholders concrete, such as `（姓名/匿名昵称）`, `（时间）`, `（证据清单）`.
- Mention anonymization only when the page expects public sharing or reposting.

### Directory and long pages

For long Q&A, lab, or practical guide pages, a folded directory can be used:

```md
:::details 目录

[[toc]]

:::
```

Do not add a directory to short pages where it creates more noise than navigation value.

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
- Do not expand every official list into a prose tutorial. Preserve the list, then add only the interpretation that changes student behavior.

### Event or dispute record

For achievement records, complaints, public disputes, and incident timelines:

- Keep source labels visible: “据会后整理”“当事人于 YYYY-MM-DD 投递”“原文”.
- Use heading levels to show nesting. Evidence subsections under one record usually use `####`, not a new sibling `###`.
- Avoid adjudicating motive or fault unless the source supports it.
- Use `<Note>` for source limitations and provenance instead of editorializing in the paragraph.

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

## Links, Names, And Paths

- Use `→` for app or menu paths: `支付宝→出行→宣城电子公交卡`.
- Use `《...》` around official notice, regulation, and announcement titles when the title itself is the link text.
- Prefer local internal links over raw external search entry points when this repository already has a relevant page or anchor.
- Add descriptive image alt text that includes campus or subject when helpful, such as `![宣区宿舍]`.
- Mark AIGC images in alt text or nearby text when they are used as illustrative assets.
- In footnotes, keep the source line and URL on separate lines with a Markdown hard break before the URL.

## Emoji And Humor

Allowed:

- One Emoji in a `details` title or light tip if it matches existing page tone.
- The `❔` marker in Q&A headings.
- Occasional jokes in `:::details` or clearly low-risk asides.
- Frontmatter titles for top-level navigation may use one fitting Emoji, following the local sidebar style.
- `!!...!!` may be used for deliberately playful or ironic asides on low-risk pages.

Avoid:

- Multiple Emoji in a row.
- Emoji in serious warning blocks.
- Humor in policy consequences, fraud prevention, safety, exam discipline, or mental/financial hardship sections.
- Main answers that depend on a joke. The useful answer should remain understandable if the joke is removed.

## Citations And Uncertainty

- Use footnotes for external facts, official notices, historical events, statistics, and quoted text.
- Do not add a footnote when a link is only an entry point or further-reading link and does not support a specific factual claim.
- Use `YYYY-MM-DD` dates in citations when available.
- If a source is unofficial, label the limitation near the claim, not only in the footnote.
- If the text is based on experience rather than a source, qualify it: “据反馈”“通常”“可能因导员/学院而异”.
- If the claim needs later verification, use `<Note>需要验证</Note>` rather than presenting it as settled.
- For student-discovered workarounds, unofficial groups, merchant/service evaluations, and campus rumors, either cite the source, move the detail to a comment, or qualify it with a visible `<Note>`.

## Compression And Deletion

Good rewriting often removes text instead of replacing every sentence:

- Delete setup sentences that only announce the next block.
- Merge repeated caveats into the claim they qualify.
- Convert long explanatory paragraphs into a short list only when the list helps scanning.
- Keep a short `:::info` for schedule summaries or high-level rhythm; use `:::warning` only when missing the item has a real consequence.
- Avoid retaining “because it sounds helpful” reminders if they duplicate official requirements already shown nearby.

## Final Review Checklist

Before finishing a rewrite:

- Does the page answer practical student questions without generic AI filler?
- Are policy and data claims sourced or qualified?
- Are bold and `<mark>` used for different levels of emphasis?
- Are list labels not unnecessarily bolded?
- Are Emoji rare and context-appropriate?
- Are original links, anchors, footnotes, tabs, admonitions, and custom components preserved?
- Did any rewrite change the factual meaning or scope?
- Did the edit delete redundant guidance where deletion is clearer than rephrasing?
