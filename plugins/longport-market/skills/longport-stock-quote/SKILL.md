---
name: longport-stock-quote
description: 通过长桥（LongPort）OpenAPI 获取港股、美股、A股的实时行情和股价信息。当用户询问股票价格、行情数据时使用。
metadata: { "openclaw": { "emoji": "📈", "requires": { "config": ["plugins.entries.longport-market.enabled"] } } }
---

# 长桥股票行情技能

当用户询问股票价格、实时行情、股票报价时，使用此技能通过长桥 OpenAPI 获取数据。

## 支持的功能

- 获取单只或多只股票的实时报价（股价、涨跌幅、成交量等）
- 支持港股（如 `0700.HK`）、美股（如 `AAPL.US`）、A股（如 `000001.SZ`）

## 使用方式

调用 `longport.getQuote` 工具，传入股票代码（symbol），格式为 `代码.市场`：

- 港股：`0700.HK`（腾讯）
- 美股：`AAPL.US`（苹果）
- A股主板：`600519.SH`（贵州茅台）、`000001.SZ`（平安银行）

## 示例

用户说"腾讯现在多少钱"→ 调用 `longport.getQuote` 查询 `0700.HK`
用户说"帮我查一下苹果股价"→ 调用 `longport.getQuote` 查询 `AAPL.US`
