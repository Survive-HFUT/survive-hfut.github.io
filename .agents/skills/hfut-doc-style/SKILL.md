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
5. Rewrite for clarity and evidence, not for decoration. Preserve Markdown features, anchors, footnotes, tabs, components, and relative links.
6. After editing, review for AI smell, unsupported certainty, overuse of bold/Emoji, and accidental changes to factual meaning.
7. Run Markdown formatting/linting before finishing:
   `pnpm run docs:lint"`.

## Core Style

- Write in neutral, rigorous Chinese with light readability. Use mild colloquial phrasing only where it helps students understand practical matters.
- Prefer short direct sentences over generic AI transitions such as “总的来说”“值得注意的是”“在当今时代”“综上所述”.
- Keep claims scoped: use “通常”“可能”“一般”“以实际通知为准” when information varies by year, campus, college, counselor, or policy update.
- Do not over-polish into officialese. The site should feel like a reliable student guide, not a press release.
- Do not become overly casual. Avoid internet slang unless the surrounding page already uses playful details blocks and the topic is low-risk.

## Markdown Conventions

- Bold only content that needs strong attention: risks, prohibitions, hard requirements, key distinctions, deadlines, or consequences.
- Do not bold list subheadings just to simulate a label. Use plain text labels, headings, tables, or `Badge` components instead.
- Use `<mark>` for secondary emphasis when the text should stand out but is not a critical warning.
- Sentence-final punctuation is flexible. Do not mechanically add periods to every line.
- Emoji are allowed sparingly. One appropriate Emoji in a heading, tip, or details title can work; repeated decorative Emoji usually weakens the page.
- Keep VitePress blocks (`:::tip`, `:::info`, `:::warning`, `:::details`), tabs, footnotes, and custom components intact.
- When nesting admonitions inside `:::tabs`, avoid delimiter ambiguity. Use different fence lengths, such as `::::tabs` outside and `:::info` inside, and close each with the matching number of colons.

## Evidence And Risk

- For rules, exam policies, disciplinary issues, fees, official processes, statistics, and historical events, keep or add citations when available.
- If evidence is missing, do not invent. Use `<Note>需要验证</Note>` or qualify the statement.
- For illegal, unsafe, or rule-violating behavior, keep a serious tone and state consequences plainly.
- Avoid advertisements or promotional tone, especially for campus cards, second-hand books, paid services, groups, and merchants.

## References

- Detailed style rules: `references/style-guide.md`
- Rewrite patterns and examples: `references/rewrite-patterns.md`
