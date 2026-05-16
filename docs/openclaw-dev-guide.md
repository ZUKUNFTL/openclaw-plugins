# OpenClaw 开发指南：Skill / Tool / Agent Prompt

> 基于当前项目：[ZUKUNFTL/openclaw-plugins](https://github.com/ZUKUNFTL/openclaw-plugins)  
> 本机路径：`~/openclaw-plugins/`

---

## 一、核心概念

### Skill（技能）

Skill 是告诉 AI **"什么情况下该做什么"** 的 Markdown 说明书，不含代码，只含自然语言描述的触发条件与操作步骤。

- 文件格式：`plugins/<插件名>/skills/<技能名>/SKILL.md`
- AI 根据用户意图自动检索并读取匹配的 SKILL.md
- `openclaw skills list` 可查看所有已加载的 skill

**类比**：SOP 手册 — 遇到什么问题，走什么流程。

---

### Tool（工具）

Tool 是 AI 可实际**调用的可执行代码**（JS 文件），用于完成具体操作（API 请求、文件读写等）。

- 文件格式：`plugins/<插件名>/tools/<工具名>.js`，`export default async function`
- AI 在 Skill 的指导下决定调用哪个 Tool、传入什么参数
- Tool 名称格式：`<插件名>.<函数名>`，例如 `longport.getQuote`

**类比**：实际干活的函数 — Skill 引用的具体执行单元。

---

### Agent Prompt（智能体提示词）

Agent Prompt 是注入 AI 的**系统级角色指令**，每次对话开始时自动生效，定义 AI 的身份、行为规范和分析框架。

- 文件格式：JSON，存放在 `~/.openclaw/agents/main/agent/<名称>.json`
- 与 Skill 的区别：Prompt 是"持续生效的角色设定"，Skill 是"按需触发的操作指南"
- 可声明该角色必须使用的 tools 白名单

**类比**：岗位职责说明书 — Skill 是具体业务手册。

---

### 三者关系

```
用户提问
   │
   ▼
[Agent Prompt] 持续生效 → 定义 AI 角色 + 行为规范
   │
   ▼
AI 检索匹配的 Skill（SKILL.md）→ 触发条件 + 操作逻辑
   │
   ▼
AI 调用对应的 Tool（.js 文件）→ 执行代码，返回真实数据
   │
   ▼
AI 整合结果，回复用户
```

---

## 二、仓库结构

```
~/openclaw-plugins/                         # monorepo 根目录
├── .gitignore
├── README.md
│
├── plugins/
│   └── longport-market/                    # 插件：长桥行情
│       ├── plugin.json                     # 元信息（可选）
│       ├── tools/
│       │   └── getQuote.js                 # Tool：调用长桥 API
│       └── skills/
│           └── longport-stock-quote/
│               └── SKILL.md               # Skill：行情查询触发逻辑
│
└── agents/
    └── equilt-research.json               # Agent Prompt：股票研究分析师
```

---

## 三、如何添加一个新 Skill

### 1. 创建目录

```bash
mkdir -p ~/openclaw-plugins/plugins/<插件名>/skills/<技能名>
```

### 2. 编写 SKILL.md

```markdown
---
name: <技能唯一标识>
description: <一句话描述，AI 用此判断是否触发此 skill，越精准越好>
metadata: { "openclaw": { "emoji": "🔧" } }
---

# 技能标题

## 触发条件
当用户询问 XXX 时使用此技能。

## 使用方式
调用 `<插件名>.<工具名>` 工具，传入参数：
- `param1`：说明

## 示例
用户说"XXX" → 调用 `<插件名>.<工具名>`，参数 = `{...}`
```

**frontmatter 字段说明：**

| 字段 | 必填 | 说明 |
|------|------|------|
| `name` | ✅ | skill 唯一标识，显示在 `skills list` 中 |
| `description` | ✅ | AI 触发判断依据，越具体越好 |
| `metadata.openclaw.emoji` | 可选 | 列表中的图标 |
| `user-invocable` | 可选 | `false` 则不对用户展示 |

### 3. 验证

```bash
openclaw gateway restart
openclaw skills list | grep <技能名>
```

看到 `✓ ready` 即成功：

```
│ ✓ ready  │ 📈 longport-stock-quote  │ 通过长桥...  │ openclaw-extra │
```

### 4. 提交到仓库

```bash
cd ~/openclaw-plugins
git add plugins/<插件名>/
git commit -m "feat: add <技能名> skill"
git push
```

---

## 四、如何添加一个新 Tool

### 1. 创建文件

```bash
touch ~/openclaw-plugins/plugins/<插件名>/tools/<工具名>.js
```

### 2. 编写 Tool

```js
// tools/<工具名>.js
export default async function <函数名>({ param1, param2 }) {
  // 从环境变量读取密钥（不要硬编码）
  const apiKey = process.env.MY_API_KEY;

  const res = await fetch(`https://api.example.com/endpoint/${param1}`, {
    headers: { "Authorization": `Bearer ${apiKey}` }
  });

  const data = await res.json();
  return { result: data.value };
}
```

**要点：**
- 必须 `export default async function`
- 参数用解构：`({ param1, param2 })`
- 密钥从环境变量读取，不要写死
- 返回纯 JSON 对象

### 3. 在 plugin.json 中注册（可选，用于备注）

```json
{
  "name": "<插件名>",
  "tools": [
    {
      "name": "<插件名>.<函数名>",
      "entry": "./tools/<工具名>.js",
      "description": "工具描述"
    }
  ]
}
```

### 4. 重新安装插件并验证

```bash
# 如果已用 --link 安装，只需重启 gateway
openclaw gateway restart

# 如果是新插件，需要先安装
openclaw plugins install --link --dangerously-force-unsafe-install \
  ~/openclaw-plugins/plugins/<插件名>
openclaw gateway restart
```

验证：在 openclaw 对话中直接让 AI 调用该工具：

> "帮我调用 `<插件名>.<函数名>`，参数是 `{...}`"

### 5. 提交到仓库

```bash
cd ~/openclaw-plugins
git add plugins/<插件名>/tools/
git commit -m "feat: add <工具名> tool"
git push
```

---

## 五、如何添加一个新 Agent Prompt

### 1. 创建 JSON 文件

在仓库中创建：

```bash
touch ~/openclaw-plugins/agents/<名称>.json
```

### 2. 编写 Agent Prompt

```json
{
  "name": "<agent-name>",
  "tools": ["web.search", "web.fetch", "longport.getQuote"],
  "system_prompt": "你是一名 XXX 专家。\n\n【规则】\n- 规则1\n- 规则2\n\n【工具调用规范】\n凡涉及实时数据，必须调用工具，禁止猜测。"
}
```

**字段说明：**

| 字段 | 说明 |
|------|------|
| `name` | agent 唯一标识 |
| `tools` | 该 agent 允许使用的工具白名单 |
| `system_prompt` | 系统级角色指令，支持 `\n` 换行 |

### 3. 部署到 openclaw

```bash
cp ~/openclaw-plugins/agents/<名称>.json \
   ~/.openclaw/agents/main/agent/<名称>.json
openclaw gateway restart
```

### 4. 验证

在 openclaw 对话中切换到该 agent，发送测试问题，确认：
- AI 是否以正确角色回应
- AI 是否在需要数据时主动调用工具（而非猜测）

### 5. 提交到仓库

```bash
cd ~/openclaw-plugins
git add agents/<名称>.json
git commit -m "feat: add <名称> agent prompt"
git push
```

> ⚠️ **切勿提交 auth 文件**：`~/.openclaw/agents/main/agent/` 下的 `auth-profiles.json`、`auth-state.json` 含有 token，已在 `.gitignore` 中排除。

---

## 六、当前已有组件

### 插件：longport-market

| 组件 | 路径 | 功能 |
|------|------|------|
| Tool | `plugins/longport-market/tools/getQuote.js` | 调用长桥 OpenAPI 获取实时报价 |
| Skill | `plugins/longport-market/skills/longport-stock-quote/SKILL.md` | 触发股价查询，格式 `CODE.MARKET` |

**Tool 调用方式：**

```
longport.getQuote({ ticker: "0700.HK" })   // 腾讯（港股）
longport.getQuote({ ticker: "AAPL.US" })   // 苹果（美股）
longport.getQuote({ ticker: "600519.SH" }) // 贵州茅台（A股沪市）
longport.getQuote({ ticker: "000001.SZ" }) // 平安银行（A股深市）
```

**所需环境变量（加入 `~/.bashrc`）：**

```bash
export LONGPORT_APP_KEY="your_app_key"
export LONGPORT_APP_SECRET="your_app_secret"
export LONGPORT_ACCESS_TOKEN="your_access_token"
```

### Agent：equilt-research

| 字段 | 值 |
|------|-----|
| 文件 | `agents/equilt-research.json` |
| 角色 | 华尔街 Sell-Side 科技股研究与交易分析师 |
| 工具 | `longport.getQuote`, `web.search`, `web.fetch`, `memory` |
| 核心规则 | 必须先调用 `longport.getQuote` 获取真实价格，再调用 `web.search` 获取新闻，禁止猜测数据 |
| 分析模式 | 盘前分析 / 盘后复盘 / 持仓分析 / 全面研究 |

---

## 七、日常工作流

### 修改后同步

修改了 Tool 或 Skill 后（已用 `--link` 安装，无需重装）：

```bash
openclaw gateway restart
openclaw skills list   # 确认 skill 仍显示 ✓ ready
```

修改了 Agent Prompt 后：

```bash
cp ~/openclaw-plugins/agents/equilt-research.json \
   ~/.openclaw/agents/main/agent/equilt-research.json
openclaw gateway restart
```

### 版本管理

```bash
cd ~/openclaw-plugins
git add .
git commit -m "fix: 描述改动"
git push
```

### 新插件安装命令

```bash
openclaw plugins install --link --dangerously-force-unsafe-install \
  ~/openclaw-plugins/plugins/<新插件名>
openclaw gateway restart
openclaw skills list   # 验证
```

---

## 八、常见问题排查

### `skills list` 找不到 skill？

1. **插件未安装**：是否执行过 `openclaw plugins install`？
2. **目录结构错误**：`skills/` 必须直接在插件根目录下
3. **根目录有 `openclaw.plugin.json`**：会覆盖 bundle 格式检测，删掉即可
4. **SKILL.md 缺少 `name` 字段**：frontmatter 中 `name` 必填
5. **Gateway 未重启**：每次改动后都要 `openclaw gateway restart`

### Tool 调用报错？

1. 检查环境变量是否设置：`echo $LONGPORT_APP_KEY`
2. 检查 `source ~/.bashrc` 是否执行
3. 检查 Tool 函数签名：参数必须是解构形式 `({ ticker })`，不能是位置参数

### `--dangerously-force-unsafe-install` 是什么？

openclaw 安全扫描会将"读取环境变量 + 发起网络请求"标记为潜在凭据泄露风险。对于自己编写且来源明确的 API 插件，这是正常行为，可以安全绕过。

### WSL2 上 gateway 反复崩溃，报 `disconnected (1006): no reason`

**现象**：gateway 启动约 25 秒后自动退出，客户端断连，循环重启。

**日志特征**（`journalctl --user -u openclaw-gateway.service -n 50`）：

```
[plugins] bonjour: restarting advertiser (service stuck in announcing for 10xxxms)
[openclaw] Unhandled promise rejection: CIAO ANNOUNCEMENT CANCELLED
openclaw-gateway.service: Main process exited, code=exited, status=1/FAILURE
```

**根因**：`bonjour` 插件负责局域网 mDNS 广播（用于手机配对）。WSL2 不支持 multicast，导致广播永远卡在 announcing 状态超时，触发 unhandled rejection 杀死整个 gateway 进程。

**解决方法**：

```bash
openclaw plugins disable bonjour
openclaw gateway restart
```

**影响**：禁用后无法通过局域网自动发现配对手机。股票分析、skills、tools、agent prompt 全部不受影响。
