# openclaw-plugins

My personal OpenClaw plugins monorepo.

## Structure

```
plugins/
└── <plugin-name>/
    ├── plugin.json                    # Plugin metadata
    ├── skills/<skill-name>/SKILL.md  # Skill definitions
    └── tools/<tool>.js               # Tool implementations
```

## Plugins

| Plugin | Description |
|--------|-------------|
| [longport-market](./plugins/longport-market) | LongPort OpenAPI — real-time stock quotes (HK/US/A-share) |

## Agents

| File | Description |
|------|-------------|
| [equilt-research.json](./agents/equilt-research.json) | Equity research agent — Sell-side tech stock analyst with LongPort + web search |

## Setup

Install each plugin with:

```bash
openclaw plugins install --link --dangerously-force-unsafe-install ~/openclaw-plugins/plugins/<plugin-name>
openclaw gateway restart
```

## Environment Variables

```bash
# longport-market
export LONGPORT_APP_KEY="your_app_key"
export LONGPORT_APP_SECRET="your_app_secret"
export LONGPORT_ACCESS_TOKEN="your_access_token"
```
