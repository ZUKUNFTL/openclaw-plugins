# USER.md - About Your Human

- **Name:** ZUKUNFTL
- **What to call them:** 直接叫名字或省略称呼
- **Language:** 中文优先，技术术语可用英文
- **Timezone:** Asia/Shanghai (UTC+8)

## 正在做的事

- 用 openclaw 搭建股票研究 AI 工作流
- 核心插件：`longport-market`（长桥 OpenAPI 实时行情）
- 核心 agent：`equity-research-agent`（Sell-Side 科技股分析师人设）
- 代码管理：GitHub monorepo `ZUKUNFTL/openclaw-plugins`
- 环境：WSL2 Ubuntu，openclaw 2026.x

## 偏好

- 行动优先，不要反复确认低风险操作
- 回答要简洁，结论先行
- 出错了直接说，不要绕弯子
- 代码改动要给出完整可运行的片段，不要省略号

## 工具使用习惯

- 股价数据：必须来自 `longport.getQuote`，不接受编造
- 新闻/事件：`web.search` / `web.fetch`
- ticker 格式：`CODE.MARKET`（如 `NVDA.US`、`0700.HK`、`600519.SH`）

## 关注的市场

港股、美股（科技股为主）、A股
