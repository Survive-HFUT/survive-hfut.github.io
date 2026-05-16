# Cloudflare Worker: 事件信息收集 Webhook

接收 [WPS 表单](https://f.kdocs.cn/g/uqYZZmxz/) 的「数据推送」，自动创建 GitHub Issue，再由 `.github/workflows/ongoing-event-bot.yml` 转 PR 更新 `docs/.vitepress/data/ongoing.json`。

## 触发链路

```
WPS 表单 → 数据推送 (POST) → Cloudflare Worker → GitHub Issue (打 ongoing-event label)
  → GitHub Actions (issues: labeled) → ongoing-event-bot.js → GitHub PR → 更新 ongoing.json
```

## 部署前配置

通过 `wrangler secret put` 设置以下 secret：

| Secret | 说明 |
|---|---|
| `GITHUB_TOKEN` | GitHub Personal Access Token，需有 `issues: write` 权限 |
| `GITHUB_REPO` | 仓库名，默认 `survive-hfut/survive-hfut`，一般不填 |

## 字段映射

WPS 表单推送的 JSON 字段名可能与代码默认值不一致。在 `wrangler.toml` 的 `[vars]` 中调整 `FIELD_*`，支持按序兜底：

| 变量 | 默认查找顺序 |
|---|---|
| `FIELD_TITLE` | `title` → `事项名称` → `field_1` |
| `FIELD_CAMPUS` | `campus` → `适用校区` → `field_2` |
| `FIELD_START` | `start` → `开始日期/时间` → `field_3` |
| `FIELD_END` | `end` → `结束日期/时间` → `field_4` |
| `FIELD_HREF` | `href` → `相关链接` → `field_5` |
| `FIELD_NOTE` | `note` → `备注` → `field_6` |

如果 WPS 表单的字段 API Code 不是上表中的默认值，修改 `FIELD_* = "实际字段名"` 即可。

## 绑定测试

1. 部署 Worker 后获得 URL（形如 `https://survive-hfut-ongoing-webhook.xxx.workers.dev`）。
2. 登录 [WPS 表单](https://f.wps.cn) → 进入「事件信息收集表单」→ 设置 → 数据推送 → 填入 URL → 验证绑定。
3. 提交一份测试数据，查看 Worker 日志：
   ```bash
   npx wrangler tail
   ```
   日志会输出 `rawBody`（原始载荷前 2000 字符）和 `fieldMapping`（当前使用的字段名），据此调整 `FIELD_*` 映射。
