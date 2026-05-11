# Rewrite Patterns

## Remove AI Framing

Before:

> 本文将从多个维度为大家详细介绍校园卡的相关内容，帮助大家更好地了解校园卡的使用方式。

After:

> 本页介绍学校发放的实体校园卡，包括用途、充值、挂失和补办方式

Why: answer scope directly; remove “多个维度”“帮助大家更好地了解”.

## Keep Rigorous Caveats

Before:

> 保研加分政策每年都会变，大家一定要去问辅导员。

After:

> 保研加分政策可能会随年份和学院调整，具体加分事宜建议以所在学院当年的通知为准，也可以询问辅导员

Why: avoid overclaiming; keep the action concrete.

## Scope Campus Claims

Before:

> 宿舍内无 WiFi 信号，但有网线接口。

After:

```md
:::tabs key:campus

== 合肥校区

宿舍内有网线接口，但无 WiFi 信号，部分宿舍可能可以连上附近食堂的 WiFi 信号

== 宣城校区

教学楼内信号通常较好，宿舍楼内无线网因宿舍离 AP 的距离不同可能有所差异，但是有网线接口

:::
```

Why: gforoosge's recent edits repeatedly avoid applying 宣城-specific information to every campus.

## Use Official Notice Titles

Before:

> [关于开展 2024 级本科生第二次转专业工作的通知](https://example.com)

After:

> [《关于开展 2024 级本科生第二次转专业工作的通知》](https://example.com)

Why: official notices and regulations are treated as document titles.

## Normalize Menu Paths

Before:

> 在 APP 中打开 我的-学生优惠资质核验专区

After:

> 在 APP 中打开 我的→学生优惠资质核验专区

Why: menu paths use `→`, which is easier to scan and consistent with local edits.

## Preserve Useful Student Voice

Before:

> 对于大一学生而言，建议综合考虑通勤效率、预算和校园管理要求后选择合适的交通方式。

After:

> 对于宣区的同学而言，校区比较大，教学楼、操场和宿舍楼的分布也不太均匀。如果每天上课都要跨过大半个校区，买一辆电动车或买骑行卡会方便不少

Why: the preferred tone is practical and grounded, not official advice.

## Prefer Understatement

Before:

> 活动现场通常备有暖心茶饮和小甜品，氛围十分轻松，欢迎同学们踊跃前来面对面反映各类问题。

After:

> 活动现场通常备有茶饮和小甜品，氛围较轻松。同学们可以借此向校区面对面反馈问题，也可以提出校区建设建议

Why: keep useful information, remove promotional warmth.

## Delete Redundant Setup

Before:

```md
<Note>下面这份模板偏通用，使用时把具体时间、对象、承诺内容、诉求和证据清单补完整即可。</Note>

:::details 投诉/反馈模板

尊敬的学校管委会：
...

:::
```

After:

```md
:::details 投诉/反馈模板

尊敬的学校管委会：
...

:::
```

Why: placeholders inside the template already explain what to replace.

## Use Info For Short Rhythm Summaries

Before:

> 简单理解：6 月主要是申报和立项，暑假开展实践，开学后集中结项和评优。具体截止时间要看当年通知，不建议按往年日期卡点准备。

After:

```md
:::info

6 月主要是申报和立项，暑假开展实践，开学后集中结项和评优

:::
```

Why: a compact info block is enough for the high-level schedule; detailed dates should remain in sourced lists or notices.

## Keep Warnings Concrete

Before:

```md
:::warning

涉及盖章、指导教师签字、保险、安全责任书、实践打卡和结项材料的要求，不要拖到最后一天处理。材料缺失可能影响立项、结项验收、第二课堂认定或评优推荐。

:::
```

After:

```md
:::warning

- 涉及盖章、指导教师签字、保险、安全责任书、实践打卡和结项材料的要求，建议提前准备
- 材料缺失可能影响立项、结项验收、第二课堂认定或评优推荐

:::
```

Why: keep the consequence, reduce scolding language, improve scanning.


## Mark Unofficial Or Unverified Claims

Before:

> 学生和教职工均可免费乘坐校车。

After:

> 学生和教职工均可免费乘坐<Note>未找到具体的官方来源</Note>

Why: useful campus knowledge can stay, but its evidence level must be visible.

## Use Playful Asides Carefully

Before:

> 慕课讨论不需要认真写，随便复制别人的评论就行。

After:

> 学生需要根据要求在学习通等平台上观看视频完成视频任务点、提交作业或讨论!!——其实就是水评论。只要把别人的话复制下来再发出来就能拿分!!

Why: on low-risk experience pages, the author sometimes keeps a joke in `!!...!!`; the factual description still comes first.

## Use Mark Instead Of Bold For Secondary Emphasis

Before:

> 搜索时**使用关键词更容易找到答案**，不要输入一整句话。

After:

> 搜索时<mark>使用关键词更容易找到答案</mark>，例如搜索`转专业`而不是`要怎么转专业`

Why: important but not a hard warning, so `<mark>` is enough.

## Reserve Bold For Critical Warnings

Before:

> **如果遇到诈骗，请及时联系辅导员或报警。**

After:

> 若无法判断或疑似被诈骗，**请及时联系辅导员、校区警务站或当地派出所**

Why: only the action is strongly emphasized.

## Avoid Bold List Labels

Before:

```md
- **核心用途**: 查询课表、成绩和考试安排
- **进入方式**: 微信搜索小程序
```

After:

```md
- 核心用途：查询课表、成绩和考试安排
- 进入方式：微信搜索小程序
```

Alternative for dense data: use a table.

## Q&A Answer Pattern

Use:

```md
#### ❔ 可以单独办理宽带吗

:::tabs key:campus
== 合肥校区

可以，具体套餐和办理方式以运营商通知为准

== 宣城校区

因宿舍未预留宽带管线接口<Note>需要验证</Note>，通常无法单独办理宽带

:::
```

Keep answers short; link to detailed pages with `:::info` when needed.

## Serious Topic Pattern

Use:

```md
:::warning

私自到校外租房居住<mark>可能违反《合肥工业大学学生违纪处分办法》规定</mark>。如确有需要，建议先和辅导员沟通并按学院要求办理

:::
```

Do not add jokes, memes, or casual exaggeration in this block.

## Light Details Pattern

Use humor only when it is clearly secondary:

```md
:::details 🤡 趣事

曾有营销号将保研率误写为 40% 以上。此类数据与实际情况差距较大，报考和升学规划时不建议参考

:::
```

The factual correction still comes first.

## UI Microcopy

Before:

```txt
3小时前
跳转到更新章节
```

After:

```txt
约 4 小时前
```

Why: rounded relative time should be marked approximate; an obvious linked card does not need a redundant navigation label.
