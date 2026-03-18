# Gitrends

GitHub trending intelligence platform — crawler, dashboard, AI agents.

## Architecture

```
@gitrends/core (types, protocol, toolkit)  ← zero runtime deps
       ↑           ↑           ↑
  GitPulse:7401  GitDash:7402  Swarm:7403
       └───────────┴───────────┘
         EventBus (pub/sub + SSE)
```

Four packages in a pnpm monorepo:

| Package | Role | Key Deps |
|---------|------|----------|
| `@gitrends/core` | Shared types, EventBus, MiroFish toolkit | None |
| `@gitrends/gitpulse` | Crawl GitHub trending, parse, enrich | Hono, Puppeteer, Cheerio |
| `@gitrends/gitdash` | Web dashboard (Preact SPA) | Preact, ECharts, Vite |
| `@gitrends/swarm` | AI agents, recommendations, A/B tests | Hono, MCP SDK |

## Quick Start

```bash
# Requirements: Node.js 24+, pnpm 10+
cp .env.example .env        # configure tokens
pnpm install
pnpm dev                     # starts all modules
```

## Commands

```bash
pnpm dev                              # start all modules
pnpm test                             # run all tests
pnpm lint                             # biome check
pnpm lint:fix                         # biome auto-fix
pnpm export                           # export trending data (JSON/XRAI)
pnpm --filter @gitrends/core test     # core tests only
pnpm --filter @gitrends/gitpulse dev  # crawler only
pnpm --filter @gitrends/gitdash dev   # dashboard only
pnpm --filter @gitrends/swarm dev     # AI agents only
```

## Environment

| Variable | Default | Description |
|----------|---------|-------------|
| `GITHUB_TOKEN` | — | GitHub API token (optional, enables richer data) |
| `LLM_API_KEY` | — | Anthropic API key (optional, enables LLM agents) |
| `LLM_BASE_URL` | `https://api.anthropic.com` | LLM endpoint |
| `LLM_MODEL` | `claude-sonnet-4-20250514` | Model for agent calls |
| `GITPULSE_PORT` | `7401` | Crawler port |
| `GITDASH_PORT` | `7402` | Dashboard port |
| `SWARM_PORT` | `7403` | Agent port |
| `CRAWL_INTERVAL` | `45` | Seconds between crawls |
| `LOG_LEVEL` | `info` | debug/info/warn/error |

## Data Flow

```
GitHub Trending → GitPulse (crawl + parse + enrich)
    → EventBus (TRENDING_UPDATE)
    → GitDash (SSE stream) + Swarm (REST poll)
    → User feedback/votes → Swarm (learn + adjust)
    → RECOMMENDATION_READY → GitDash (update)
```

## Key Patterns

- **Three-Layer Fallback** (agents): LLM call → JSON repair → rule-based defaults
- **OBSERVE → LEARN → ADJUST → FIX** (learning loop): continuous improvement cycle
- **Semaphore Batch Processing**: bounded concurrency via `batch()` utility
- **Module Discovery**: health probing + auto-reconnect on peer recovery
- **A/B Testing**: experiment variants with per-variant scoring weights
- **Dual Export**: JSON envelope + XRAI (semantic RDF+OWL) format

## API Endpoints

### GitPulse (:7401)
- `GET /health` — module health
- `GET /trending` — current trending repos
- `POST /crawl` — trigger manual crawl
- `GET /stream` — SSE event stream

### Swarm (:7403)
- `GET /health` — module health
- `GET /recommendations` — personalized recommendations
- `POST /feedback` — submit user feedback signal
- `POST /vote` — cast vote on layout/theme
- `GET /experiments` — list A/B tests
- `POST /experiments` — create new experiment
- `GET /experiments/:id` — experiment results

## Tech Stack

- **Runtime**: Node.js 24+ with native TypeScript (`--experimental-strip-types`)
- **Package Manager**: pnpm 10+ with workspaces
- **Linting**: Biome (tabs, double quotes, 100-char lines)
- **Testing**: Vitest
- **Frontend**: Preact + Vite + ECharts
- **Backend**: Hono (lightweight web framework)
- **Crawling**: Puppeteer (stealth) + Cheerio + OSSInsight API + GitHub API

## License

Private
