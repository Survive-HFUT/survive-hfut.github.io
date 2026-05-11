---
name: hfut-doc-style
description: Survive-HFUT 文档语言风格改写、审校和新增 Markdown 内容写作指南。Use when editing docs/ Markdown pages in survive-hfut, polishing AI-generated Chinese copy, reducing AI tone, aligning with docs/study/exemption.md and docs/enrollment/qa.md, applying docs/about/standard.md, or reviewing emphasis, Emoji, admonitions, citations, and wording rigor for student-facing campus documentation.
---

# HFUT Doc Style

## Workflow

1. Read the target Markdown and identify its topic risk level: casual guide, practical Q&A, policy/regulation, safety/anti-fraud, data/statistics, or historical/event record.
2. If the page is in this repository, check nearby pages in the same section before rewriting. Prefer the local section's structure unless it conflicts with this skill.
3. Use `docs/study/exemption.md`, `docs/enrollment/qa.md`, and `docs/about/standard.md` as the highest-priority style references.
4. Load `references/style-guide.md` for detailed rules before substantial rewrites or reviews.
5. When matching gforoosge's recent maintenance tone, also load `references/gforoosge-commit-voice.md`.
6. Rewrite for clarity and evidence, not for decoration. Preserve Markdown features, anchors, footnotes, tabs, components, and relative links.
7. After editing, review for AI smell, unsupported certainty, overuse of bold/Emoji, and accidental changes to factual meaning.
8. Run Markdown formatting/linting before finishing:
   `pnpm run docs:lint`.

## Core Style

- Write in neutral, rigorous Chinese with light readability. Use mild colloquial phrasing only where it helps students understand practical matters.
- Prefer short direct sentences over generic AI transitions such as “总的来说”“值得注意的是”“在当今时代”“综上所述”.
- Keep claims scoped: use “通常”“可能”“一般”“以实际通知为准” when information varies by year, campus, college, counselor, or policy update.
- Do not over-polish into officialese. The site should feel like a reliable student guide, not a press release.
- Do not become overly casual. Avoid internet slang unless the surrounding page already uses playful details blocks and the topic is low-risk.
- Prefer useful understatement over performative warmth. For example, write “可以参考”“建议提前准备”“通常” instead of repeatedly framing text as “暖心”“欢迎”“务必”“简单理解”.
- Remove duplicated setup sentences when the structure already explains the context. A template inside `:::details` usually does not need an extra paragraph explaining how to use the template.
- Keep practical reminders close to the relevant requirement. Avoid building a separate “实用提醒” section if the same points can be attached to safety, materials, 结项, or 费用 sections.
- Keep the student guide voice alive: short “如果你...”“可以...”“一般...” sentences are often better than official explanations.
- Use light jokes only as side remarks on low-risk pages. The local `!!...!!` syntax can preserve a playful aside, but never use it for policy consequences, safety, exam discipline, or financial hardship.
- Prefer deletion, splitting, and relocation over verbose rewriting. If a sentence is only a slogan, announcement, or duplicate caveat, remove it.

## Markdown Conventions

- Bold only content that needs strong attention: risks, prohibitions, hard requirements, key distinctions, deadlines, or consequences.
- Do not bold list subheadings just to simulate a label. Use plain text labels, headings, tables, or `Badge` components instead.
- Use `<mark>` for secondary emphasis when the text should stand out but is not a critical warning.
- Sentence-final punctuation is flexible. Do not mechanically add periods to every line.
- Keep heading hierarchy proportional. If a section is nested under a numbered or evidence-heavy block, prefer `####` over a sibling-level `###` unless it truly starts a new top-level subsection.
- Emoji are allowed sparingly. One appropriate Emoji in a heading, tip, or details title can work; repeated decorative Emoji usually weakens the page.
- Keep VitePress blocks (`:::tip`, `:::info`, `:::warning`, `:::details`), tabs, footnotes, and custom components intact.
- When nesting admonitions inside `:::tabs`, avoid delimiter ambiguity. Use different fence lengths, such as `::::tabs` outside and `:::info` inside, and close each with the matching number of colons.
- Use admonitions to tighten rather than decorate. A short `:::info` can replace a loose “简单理解” paragraph; a `:::warning` should state concrete risk or consequence, not general anxiety.
- Use `→` for app/menu paths such as `信息门户→缴费平台`.
- Use `《...》` for official notice titles when the link text is the title of a notice, regulation, or announcement.
- For long Q&A and directory-heavy pages, a folded `:::details 目录` with `[[toc]]` matches the local pattern.

## Evidence And Risk

- For rules, exam policies, disciplinary issues, fees, official processes, statistics, and historical events, keep or add citations when available.
- If evidence is missing, do not invent. Use `<Note>需要验证</Note>` or qualify the statement.
- For illegal, unsafe, or rule-violating behavior, keep a serious tone and state consequences plainly.
- Avoid advertisements or promotional tone, especially for campus cards, second-hand books, paid services, groups, and merchants.
- Do not over-explain sourced official lists. If a notice already defines required materials, preserve the requirements and add only the minimum interpretation needed for students not to misunderstand them.
- For unofficial groups, merchants, second-hand services, routes, and student-discovered workarounds, keep the usefulness but mark the limitation, source, or responsibility boundary.

## Campus Structure

- Prefer `:::tabs key:campus` when the answer differs by campus.
- When two or more Hefei campuses share the same answer, use `== 合肥校区`; when they differ, split into `== 屯溪路校区`, `== 翡翠湖校区`, and `== 六安路校区`.
- Do not assume 宣城校区 rules apply to all campuses. Add “宣区/宣城校区” scope near the claim.
- Put empty campus tabs only when the page structure is intentionally being reserved for later completion; otherwise avoid empty headings.

## UI And Microcopy

- For site UI text, use calm labels and avoid unnecessary calls to action. Prefer the content card itself to imply navigation instead of adding labels such as “跳转到更新章节”.
- When displaying generated or approximate times, mark approximation explicitly, such as “约 2 小时前”.
- Avoid small hover animations or decorative language that make documentation UI feel promotional.

## References

- Detailed style rules: `references/style-guide.md`
- Rewrite patterns and examples: `references/rewrite-patterns.md`
- gforoosge recent commit voice notes: `references/gforoosge-commit-voice.md`
