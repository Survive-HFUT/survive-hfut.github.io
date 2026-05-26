# Cloudflare Worker: 事件信息收集 Webhook

## **仅起草，未测试**

接收 [WPS 表单](https://f.kdocs.cn/g/uqYZZmxz/)（可一键复制表单）的「数据推送」，自动创建 GitHub Issue，再由 `.github/workflows/ongoing-event-bot.yml` 转 PR 更新 `docs/.vitepress/data/ongoing.json`。

## 触发链路

```text
WPS 表单 → 数据推送 (POST) → Cloudflare Worker → GitHub Issue (打 ongoing-event label)
  → GitHub Actions (issues: labeled) → ongoing-event-bot.js → GitHub PR → 更新 ongoing.json
```

## 部署前配置

通过 `wrangler secret put` 设置以下 secret：

| Secret | 说明 |
| --- | --- |
| `GITHUB_TOKEN` | GitHub Personal Access Token，需有 `issues: write` 权限 |
| `GITHUB_REPO` | 仓库名，默认 `Survive-HFUT/survive-hfut.github.io`，一般不填 |
| `WEBHOOK_SECRET` | URL 参数 `secret` 校验值，防止未授权调用 |

## 字段映射

WPS 表单推送的 JSON 字段名可能与代码默认值不一致。在 `wrangler.toml` 的 `[vars]` 中调整 `FIELD_*`，支持按序兜底：

| 变量 | 默认查找顺序 |
| --- | --- |
| `FIELD_TITLE` | `title` → `事件标题` → `事项名称` → `field_1` |
| `FIELD_CAMPUS` | `campus` → `适用校区` → `field_2` |
| `FIELD_START` | `start` → `开始日期` → `开始日期/时间` → `field_3` |
| `FIELD_END` | `end` → `结束日期` → `结束日期/时间` → `field_4` |
| `FIELD_HREF` | `href` → `详情链接` → `相关链接` → `field_5` |
| `FIELD_NOTE` | `note` → `页面备注` → `备注` → `field_6` |

如果 WPS 表单的字段 API Code 不是上表中的默认值，修改 `FIELD_* = "实际字段名"` 即可。

## 限流与去重

Worker 内置多层防护，依赖 Cloudflare KV：

| 层级 | 维度 | 限制 | KV Key 示例 |
| --- | --- | --- | --- |
| 全局限流 | 所有请求 | 10 分钟 ≤ 20 次 | `rate:10m:{window}` |
| 全局限流 | 所有请求 | 1 小时 ≤ 60 次 | `rate:1h:{window}` |
| 全局限流 | 所有请求 | 1 天 ≤ 200 次 | `rate:1d:{window}` |
| 事件指纹去重 | `title + campus + start + end + href` | 24 小时 1 次 | `fp:event:{sha256}` |
| 链接去重 | `href` | 24 小时 1 次 | `fp:href:{sha256}` |
| 弱去重 | `title + start + end` | 24 小时 1 次 | `fp:title-date:{sha256}` |
| WPS 提交 ID 去重 | `submission_id / record_id / entry_id` | 永久 1 次 | `wps:{id}` |

### 创建 KV 命名空间

```bash
npx wrangler kv:namespace create "KV"
npx wrangler kv:namespace create "KV" --preview
```

将输出的 `id` 和 `preview_id` 填入 `wrangler.toml` 的 `[[kv_namespaces]]`。

## 绑定测试

1. 部署 Worker 后获得 URL（形如 `https://survive-hfut-ongoing-webhook.xxx.workers.dev`）。
2. 登录 [WPS 表单](https://f.wps.cn) → 进入「事件信息收集表单」→ 设置 → 数据推送 → 填入 URL → 验证绑定。
3. 提交一份测试数据，查看 Worker 日志：

   ```bash
   npx wrangler tail
   ```

   日志会输出 `rawBody`（原始载荷前 2000 字符）和 `fieldMapping`（当前使用的字段名），据此调整 `FIELD_*` 映射。

## 参考

- [WPS 开放平台 — 事件订阅 / Webhook 开发说明](https://365.kdocs.cn/l/cr5IRaHlD79D)
