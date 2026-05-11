# gforoosge Commit Voice Notes

Source range: commits authored by `gforoosge <182950587+gforoosge@users.noreply.github.com>` from 2026-04-28 through 2026-05-11, excluding merge commits as independent voice evidence unless the merge introduced visible local style.

## High-Level Pattern

- Writes as a practical student maintainer: useful first, concise, often in the second person “你”.
- Keeps some local humor and campus slang, but tries to isolate it from policy, safety, and evidence-heavy content.
- Uses citations and `<Note>` when claims are official, historical, controversial, or experience-based.
- Reorganizes pages aggressively: split large pages, move content to more relevant pages, delete repeated caveats, and shorten page intros.
- Uses campus tabs heavily and scopes claims by campus instead of assuming 宣城校区 details apply everywhere.
- Prefers Markdown structure that helps scanning: short lists, tables, folded TOC, `:::tip`/`:::info`/`:::warning`, and nested lists.
- Normalizes presentation details: official notice titles in `《》`, app paths with `→`, meaningful image alt text, footnote hard breaks, and frontmatter titles with a single Emoji for navigation.

## Per-Commit Reading

- `a25d8c6` 日常更新文档: broadened the site from “肥宣” toward “合工大学生”; added disclaimers and student-facing practical edits; used `→` for app paths; split long fee/rule sentences into lists; kept light jokes but softened some harsh phrasing.
- `128ba93` 补充各校区的介绍: added campus history with citations; corrected campus taxonomy; used tables for campus metadata; moved toward official names plus aliases.
- `a398b39` 添加群号: simplified unofficial group tables and changed responsibility wording to “与编者无关”; useful but explicitly unofficial.
- `c30bb2d` 小修小补: rewrote README into a clearer project intro; reduced repo setup detail from the landing README; made contribution entry points obvious; added practical second-hand book advice with caveats.
- `73ae120` 修改不同校区之间的差异描述: established campus-tab discipline; merged identical Hefei answers as `合肥校区`; scoped 宣区-only network, dorm, and traffic details; added standard writing rules about neutrality, school rules, consequences, and no ads.
- `d8561b9` 补充景明湖、城市介绍: split city attractions from city overview; kept scenic/local observations; used citations for city/campus facts; converted some strikethrough jokes into `!!...!!`.
- `0328f20` 修复语法错误: syntax-only maintenance; reinforces that Markdown correctness matters.
- `8abebdc` 修复一些引用的语法错误: fixed footnote hard breaks and punctuation; source formatting is part of style, not afterthought.
- `2f069b6` 添加图片注释: improved image alt text and replaced fragile custom image components; image captions should identify the subject/campus.
- `66a17d2` 补充校车、校运会、开发教程等内容: moved detailed development instructions into a dedicated page; kept contributor onboarding friendly; added `<Note>未找到具体的官方来源</Note>` for unsourced campus transport details; used official notice links with `《》`.
- `f6889c9` 补充肥区校历: introduced campus-specific calendars and route links; folded long Q&A TOC into `:::details`; removed some overly meme-like military-training wording.
- `b791a38` 部分选项卡顺序不正确: order of campus tabs is meaningful and should be kept consistent.
- `14a062b` 修复一些 typo: cleaned link spacing and labels such as `关于§参与进来`; small typography edits are part of polish.
- `5470228` 文件名错误: path correctness matters; avoid breaking links during renames.
- `8c68673` 补充校内赛事: shortened feedback page to essential channels; removed over-instruction; reduced bold label lists; moved official process details into cleaner lists; used `:::info` instead of decorative tips for formal references.
- `4fbb70f` 重构部分 ts 代码: added AI-warning language to writing standards; marked AIGC images; added contribution guidance; used one Emoji in friendly contributor text.
- `b90c3cd` impl #45: moved保研加分 caveat from contest page to exemption page where it belongs; placement should follow the user's task context.
- `c8722d7` 添加 Emoji: added single Emoji frontmatter titles for top-level navigation; removed duplicate `#` title when frontmatter title carries the section identity.
- `c7168ff` 新增最近修改页面: added a minimal page with component only; no explanatory filler when the component is self-explanatory.
- `6514a11` 添加 author map: author display should normalize aliases through data helpers where available.
- `d2b9fcc` 更新运动会、选修课和考试: split选修课 types into subheadings; used internal anchors; kept risk warning for online考试; added technical route for题库 but still warned about source mismatch.
- `1956137` 修复回到顶部样式不正确和默认主题错误: UI fixes should preserve theme consistency and avoid visual glitches.
- `9d902c4` 拆分宿舍界面: split dorm content into child pages; moved warnings near the relevant workflow; used danger for communal hygiene and electrical risk; kept “可能被骂一顿” style only for low-risk lived experience.
- `8ed82f9` 添加页面主题切换动画: UI enhancement is allowed when it is lightweight and respects reduced motion.
- `048df50` 因 SSG 导致不生效和报错: browser-only UI code must guard SSG with `inBrowser` or lifecycle checks.
- `8a24320` 重构医保和体育健身部分文档: split体育健身 into index/running/test; preserved official requirements with footnotes; used tabs for campus-specific报销材料 and时间; moved video into details.
- `6e80438` 完善其他页面: replaced `<Note>可能需要更多信息</Note>` with a real citation where available; added courier practical details; commented out unsafe joke in Q&A; tightened sports page links.
- `8321f87` footnote link style: long URLs in footnotes must not break layout.
- `ff04b58` KaTeX overflow: mathematical blocks should scroll instead of breaking the page.
- `c956727` 略微更改语气: reduced over-explanation, changed evidence headings to nested levels, removed redundant template instructions, converted schedule summary to `:::info`, softened warnings, and deleted whole sections that duplicated nearby requirements.
- `c7531c7` 添加 markdown 过滤: recent-update excerpts should strip Markdown/admonition syntax; content written for pages should degrade cleanly in previews.
- `2d55a4d` 更新 recentChanges.data.ts: preview filtering should remove admonition headers and custom `!!` markers, which confirms `!!...!!` is treated as presentational aside syntax.

## Practical Rewrite Rules Derived From These Commits

- Start with the answer or definition; avoid “本文介绍”.
- Use campus tabs before adding prose caveats when differences are structural.
- Prefer “通常”“可能”“据说”“目前”“以通知为准” for variable campus practices.
- Use `!!...!!` only when the surrounding page is already light and the joke is removable.
- For low-risk pages, “你可以...” and “如果你...” are acceptable and often more local than officialese.
- For high-risk pages, keep jokes out, cite the source, and name consequences plainly.
- If a claim comes from a student report, merchant dispute, group chat, or workaround, cite it, qualify it, or move details into a comment.
- Place detailed how-to content on the page where the user will need it; do not leave broad “实用提醒” blocks at the end.
- Use `:::details 目录` on long pages; do not force TOC into short pages.
- Keep official notice titles in `《》`; use bare descriptive text for internal page links.
- Use `→` for UI paths and anchors for internal cross-references.
- Use meaningful image alt text and mark AIGC images when relevant.
- For UI copy, keep labels short and self-evident; remove redundant navigation prompts.
