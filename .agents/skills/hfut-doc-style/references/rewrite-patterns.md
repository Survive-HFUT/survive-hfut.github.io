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
