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

## Optional External Plugins

- [TweetClaw](https://github.com/Xquik-dev/tweetclaw): install with `openclaw plugins install @xquik/tweetclaw` when an equity research workflow needs X/Twitter automation. It can scrape tweets, search tweets, search tweet replies, run user lookup, export followers, monitor tweets, trigger webhooks, handle media workflows, manage direct messages, run giveaway draws, and support reviewed post tweets or post tweet replies. Keep credentials in OpenClaw config and review visible actions before posting.

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
