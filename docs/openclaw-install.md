# OpenClaw 安装与使用指南（WSL2 from zero）

## 一、WSL2 安装

### 基本命令

```powershell
# 更新 WSL
wsl --update

# 安装 Ubuntu 22.04
wsl --install -d Ubuntu-22.04

# 查看已安装的发行版
wsl --list --verbose

# 设置默认发行版
wsl --setdefault Ubuntu-22.04

# 进入 WSL
wsl -d Ubuntu-22.04
```

### 安装常用工具

```bash
sudo apt update
sudo apt install docker-compose -y
```

### 把 WSL 镜像迁移到其他盘（避免 C 盘占满）

```powershell
# 1. 导出当前分发
wsl --export Ubuntu-22.04 E:\WSL\Ubuntu-22.04.tar

# 2. 注销原分发
wsl --unregister Ubuntu-22.04

# 3. 导入到 E 盘
wsl --import Ubuntu-22.04 E:\WSL\Ubuntu-22.04 E:\WSL\Ubuntu-22.04.tar --version 2
```

---

## 二、WSL2 代理配置（NAT 模式）

> **结论**：WSL2 网络模式用 NAT，不用镜像模式。
> 镜像模式下 curl 可用但 docker pull 不通；NAT 模式下 docker pull 正常，只需手动配代理。

### 代理工具设置（以 Mihomo/Clash Verge 为例）

1. 代理工具开启「允许局域网访问」
2. 将核心程序 `verge-mihomo.exe` 加入 Windows 防火墙白名单
3. WSL Settings 里**关闭自动代理**

### ~/.bashrc 追加代理配置

```bash
## 获取 Windows 主机 IP（WSL NAT 网关）
host_ip=$(ip route | awk '/default/ {print $3}')

## 设置代理（端口按实际修改，Clash Verge 默认 7897）
export http_proxy=http://$host_ip:7897
export https_proxy=http://$host_ip:7897
export all_proxy=socks5://$host_ip:7897
```

```bash
source ~/.bashrc
```

---

## 三、OpenClaw 安装

### 1. 安装 Node.js（推荐 nvm）

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install --lts
```

### 2. 安装 OpenClaw CLI

```bash
npm install -g openclaw
```

### 3. 初始化配置

```bash
openclaw configure
# 按提示填入：AI provider（如 GitHub Copilot）、模型、频道等
```

### 4. 启动 Gateway

```bash
openclaw gateway restart
```

### 5. 验证

```bash
openclaw doctor        # 健康检查
openclaw infer "hello" # 测试模型调用
```

---

## 四、OpenClaw 常用命令速查

### Gateway 管理

| 命令 | 说明 |
|------|------|
| `openclaw gateway restart` | 重启 gateway（systemd 服务） |
| `openclaw gateway stop` | 停止 gateway |
| `openclaw gateway --force` | 强制杀端口占用后启动 |
| `openclaw gateway status` | 查看运行状态 |

### 配置

| 命令 | 说明 |
|------|------|
| `openclaw configure` | 交互式重新配置（provider / 模型 / 频道） |
| `openclaw config get <key>` | 读取某项配置 |
| `openclaw config set <key> <val>` | 修改某项配置 |
| `openclaw doctor` | 一键检查 auth / gateway / provider / websocket / model |

### 插件与技能

| 命令 | 说明 |
|------|------|
| `openclaw plugins list` | 列出所有已安装插件 |
| `openclaw plugins install <路径>` | 安装本地插件 |
| `openclaw plugins uninstall <名称>` | 卸载插件 |
| `openclaw plugins update` | 更新所有 ClawHub 插件（不影响无 source 的本地插件） |
| `openclaw skills list` | 列出所有已加载的 skill |
| `openclaw skills check` | 检查 skill 就绪状态 |
| `openclaw skills info <名称>` | 查看 skill 详情 |

### 调试与日志

| 命令 | 说明 |
|------|------|
| `openclaw logs` | 实时跟踪 gateway 日志 |
| `openclaw infer "消息"` | 直接调用模型测试 |
| `openclaw health` | 获取 gateway 健康状态 |
| `openclaw status` | 查看频道健康和最近会话 |

### 其他

| 命令 | 说明 |
|------|------|
| `openclaw dashboard` | 打开 Control UI |
| `openclaw tui` | 打开终端 UI |
| `openclaw sessions list` | 列出历史会话 |
| `openclaw update` | 更新 OpenClaw 版本 |
| `openclaw reset` | 重置配置（保留 CLI） |

---

## 五、常见问题

### Gateway 启动后工具调用报"凭证未配置"

**原因**：systemd 服务不读 `~/.bashrc`，环境变量不继承。

**解决**：创建 drop-in 文件手动注入：

```bash
mkdir -p ~/.config/systemd/user/openclaw-gateway.service.d
cat > ~/.config/systemd/user/openclaw-gateway.service.d/env.conf << 'EOF'
[Service]
Environment="MY_API_KEY=xxx"
Environment="MY_SECRET=yyy"
EOF

systemctl --user daemon-reload
openclaw gateway restart
```

验证变量已注入：
```bash
systemctl --user show openclaw-gateway.service --property=Environment | tr ' ' '\n' | grep MY_API
```

### WSL2 重启后 bonjour 插件导致 gateway 崩溃

**原因**：WSL2 没有 mDNS 支持，bonjour 插件启动时报错崩溃。

**解决**：

```bash
openclaw plugins disable bonjour
openclaw gateway restart
```

### 插件修改后不生效

Gateway 会缓存模块。改了插件文件后需要重启：

```bash
openclaw gateway restart
```

### `openclaw plugins update` 覆盖了本地修改

只有 `plugin.json` 中含有 `source` 字段的插件才会被 update 拉取覆盖。  
本地自建插件（无 source）不受影响。

### Node.js built-in fetch 忽略代理环境变量

Node.js 原生 `fetch` 不读 `https_proxy`，需要用 undici 的 `ProxyAgent`，或通过子进程调用支持代理的工具（如 `python.exe`、`curl`）。