---
name: sync-repo
description: 把 openclaw-plugins 仓库（~/openclaw-plugins）中修改的插件、agent prompt、workspace 文件 cp 到 openclaw 运行时目录（~/.openclaw），使改动在 gateway 中生效
metadata: { "openclaw": { "emoji": "🔄" } }
---

# Sync openclaw-plugins repo → 运行时目录

## 触发条件

当用户说以下任意内容时使用此 skill：
- "同步到运行时" / "sync to runtime"
- "把 repo 的改动 copy 到 openclaw" / "把改动 copy 过去"
- "同步插件" / "同步 agent" / "同步 workspace 文件"
- "改了 XXX，帮我 copy 过去"

> **注意**：不要与"同步到 GitHub / git push / 备份"等操作混淆。本 skill 专指把仓库文件复制到 `~/.openclaw/` 运行时目录。

---

## 各类文件的同步方法

### 插件 Tool / Skill（longport-market）

```bash
cp -r ~/openclaw-plugins/plugins/longport-market/tools/ \
   ~/.openclaw/plugin-runtime-deps/longport-market/tools/

cp -r ~/openclaw-plugins/plugins/longport-market/skills/ \
   ~/.openclaw/plugin-runtime-deps/longport-market/skills/

openclaw gateway restart
openclaw skills list | grep longport   # 确认 ✓ ready
```

> **原因**：`openclaw plugins install --link` 是拷贝，不是软链接，修改源文件后需手动同步。

---

### Agent Prompt

```bash
cp ~/openclaw-plugins/agents/equilt-research.json \
   ~/.openclaw/agents/main/agent/equilt-research.json

openclaw gateway restart
```

---

### Workspace 配置文件（AGENTS.md / SOUL.md / IDENTITY.md / USER.md / TOOLS.md / HEARTBEAT.md）

```bash
cp ~/openclaw-plugins/workspace/*.md ~/.openclaw/workspace/

openclaw gateway restart
```

---

### 一次性全量同步

```bash
# 插件
cp -r ~/openclaw-plugins/plugins/longport-market/tools/ \
   ~/.openclaw/plugin-runtime-deps/longport-market/tools/
cp -r ~/openclaw-plugins/plugins/longport-market/skills/ \
   ~/.openclaw/plugin-runtime-deps/longport-market/skills/

# Agent prompts
cp ~/openclaw-plugins/agents/*.json \
   ~/.openclaw/agents/main/agent/

# Workspace 文件
cp ~/openclaw-plugins/workspace/*.md ~/.openclaw/workspace/

# 重启生效
openclaw gateway restart
openclaw skills list
```

---

## 注意事项

- 同步后**必须**执行 `openclaw gateway restart`，否则改动不生效
- `agents/` 目录下的 `auth-profiles.json`、`auth-state.json` 含 token，**不要** cp 覆盖（只 cp 自己的 json 文件）
- `USER.md` 包含用户个人信息，移植到他人机器时先确认内容是否需要修改
