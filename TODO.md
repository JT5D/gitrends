# Gitrends TODO

## P0 — Ship Blockers
- [ ] Verify GitPulse crawl works end-to-end (puppeteer + OSSInsight + GitHub API)
- [ ] Verify GitDash renders trending data from SSE stream
- [ ] Verify Swarm recommendations endpoint returns scored results
- [ ] Add `.env` with real `GITHUB_TOKEN` for richer crawl data

## P1 — Core Functionality
- [ ] Add integration tests for cross-module communication (EventBus over SSE)
- [ ] Add GitPulse unit tests (parser, dedup, enricher)
- [ ] Add Swarm agent tests (profile-learner, repo-recommender)
- [ ] Add GitDash component tests (store, blox rendering)
- [ ] Implement persistent storage (currently all in-memory)
- [ ] Add error handling for GitPulse → Swarm fetch failures
- [ ] Rate limiter tests and tuning for GitHub API

## P2 — Polish
- [ ] GitDash styling and responsive layout
- [ ] Dashboard preset thumbnails
- [ ] Export CLI — add `--output` flag for file output
- [ ] MCP server integration testing (gitpulse + swarm)
- [ ] Health check dashboard in GitDash (show peer status)
- [ ] Add OpenAPI/Swagger spec for REST endpoints

## P3 — Future
- [ ] Persistent vector store (replace in-memory VectorStore)
- [ ] User authentication
- [ ] Multi-user preference isolation
- [ ] Deployment config (Docker, fly.io, etc.)
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Performance benchmarks for crawl + enrichment pipeline
