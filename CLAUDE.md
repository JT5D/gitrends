# Gitrends

## Architecture
- **Monorepo**: pnpm workspaces, 4 packages (core, gitpulse, gitdash, swarm)
- **Runtime**: Node.js v24+ with `--experimental-strip-types` (native TS, no build step for non-browser code)
- **Zero-dep core**: `@gitrends/core` has no runtime dependencies
- **Hot-swappable modules**: Each module runs independently, discovers peers via health probing
- **Communication**: EventBus (typed pub/sub) + REST + SSE streams between modules

## Commands
- `pnpm dev` — Start all modules in dev mode
- `pnpm test` — Run all tests
- `pnpm --filter @gitrends/core test` — Run core tests
- `pnpm --filter @gitrends/gitpulse dev` — Start crawler only
- `pnpm --filter @gitrends/gitdash dev` — Start dashboard only
- `pnpm --filter @gitrends/swarm dev` — Start AI agents only
- `pnpm lint` / `pnpm lint:fix` — Biome linting
- `pnpm export` — Export trending data (JSON/XRAI)

## Ports
- GitPulse: 7401
- GitDash: 7402 (Vite dev: 5173)
- Swarm: 7403

## Package Map
- `packages/core/src/types/` — All shared types (repo, events, config, agent, experiment, dashboard, export)
- `packages/core/src/protocol/` — EventBus, ModuleRegistry, health, SSE stream utilities
- `packages/core/src/mirofish/` — Retry, batch (semaphore), JSON repair, IPC, process manager, log reader
- `packages/core/src/export/` — JSON + XRAI exporters
- `packages/gitpulse/src/crawler/` — Puppeteer stealth, OSSInsight, GitHub API, rate limiter, scheduler
- `packages/gitpulse/src/parser/` — Trending page parser, dedup, repo enricher
- `packages/gitdash/src/blox/` — Dashboard widgets (RepoCard, TrendingChart, ActivityHeatmap, etc.)
- `packages/gitdash/src/data/` — Reactive store + SSE connection
- `packages/swarm/src/agents/` — BaseAgent (three-layer fallback), profile-learner, repo-recommender, auto-fixer, dash-optimizer, tool-suggester
- `packages/swarm/src/orchestrator/` — LearningLoop (OBSERVE/LEARN/ADJUST/FIX), TaskQueue
- `packages/swarm/src/experiment/` — ExperimentEngine, PreferenceStore, VoteManager
- `packages/swarm/src/knowledge/` — VectorStore (tag embeddings)

## Key Patterns
- **Three-Layer Fallback**: LLM call → JSON repair → rule-based defaults (BaseAgent)
- **OBSERVE → LEARN → ADJUST → FIX**: Continuous learning loop (Swarm)
- **Semaphore Batch**: Bounded concurrency via `batch()` with progress callbacks
- **Module Discovery**: Health probing + auto-reconnect on peer recovery
- **A/B Testing**: Experiment variants with per-variant scoring weights
- **Dual Export**: JSON envelope + XRAI (semantic RDF+OWL)

## API Endpoints
- GitPulse: `GET /health`, `GET /trending`, `POST /crawl`, `GET /stream` (SSE)
- Swarm: `GET /health`, `GET /recommendations`, `POST /feedback`, `POST /vote`, `GET|POST /experiments`, `GET /experiments/:id`

## Conventions
- Types in `@gitrends/core`, never duplicated
- EventBus for cross-module communication (SSE/WS bridged)
- MiroFish patterns: process isolation, filesystem IPC, three-layer fallback, batch with semaphore
- All data exportable as JSON or XRAI format
- Tab indentation, double quotes (Biome enforced)
- 16 event types defined in `core/src/types/events.ts`
- Scoring weights: language 0.4, topic 0.3, stars 0.15, momentum 0.1, novelty 0.05
