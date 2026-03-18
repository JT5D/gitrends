/** CLI entry point for GitPulse */

import {
	EventBus,
	ModuleRegistry,
	type TrendingPeriod,
	type TrendingRepo,
	defaultConfig,
} from "@gitrends/core";
import { serve } from "@hono/node-server";
import { loadConfigFromEnv } from "./config/schema.ts";
import { fetchOSSInsightTrending } from "./crawler/ossinsight.ts";
import { closeBrowser, crawlTrending } from "./crawler/puppeteer-stealth.ts";
import { RateLimiter } from "./crawler/rate-limiter.ts";
import { CrawlScheduler } from "./crawler/scheduler.ts";
import { startMcpServer } from "./mcp.ts";
import { RepoDeduplicator } from "./parser/dedup.ts";
import { parseTrendingPage } from "./parser/trending-page.ts";
import { createServer } from "./server.ts";

const command = process.argv[2] ?? "serve";

async function crawlOnce(
	rateLimiter: RateLimiter,
	dedup: RepoDeduplicator,
	bus: EventBus,
	period: TrendingPeriod = "daily",
	language?: string,
): Promise<TrendingRepo[]> {
	const now = new Date().toISOString();
	bus.emit(
		bus.createEvent(
			"CRAWL_STARTED",
			{ source: "multi", language: language ?? null, period },
			"gitpulse",
		),
	);

	const start = Date.now();
	const allRepos: TrendingRepo[] = [];

	// Try OSSInsight first (no browser needed)
	try {
		const ossRepos = await fetchOSSInsightTrending({
			rateLimiter,
			period,
			language,
		});
		allRepos.push(...ossRepos);
		console.log(`[OSSInsight] Fetched ${ossRepos.length} repos`);
	} catch (err) {
		console.warn("[OSSInsight] Failed:", (err as Error).message);
	}

	// Then try Puppeteer
	try {
		const html = await crawlTrending({ rateLimiter, period, language });
		const scraped = await parseTrendingPage(html, period);
		allRepos.push(...scraped);
		console.log(`[Puppeteer] Scraped ${scraped.length} repos`);
	} catch (err) {
		console.warn("[Puppeteer] Failed:", (err as Error).message);
		bus.emit(
			bus.createEvent(
				"CRAWL_ERROR",
				{ source: "puppeteer", error: (err as Error).message, retryCount: 0 },
				"gitpulse",
			),
		);
	}

	const unique = dedup.deduplicate(allRepos);
	const durationMs = Date.now() - start;

	bus.emit(
		bus.createEvent(
			"CRAWL_COMPLETED",
			{ source: "multi", repoCount: unique.length, durationMs },
			"gitpulse",
		),
	);

	if (unique.length > 0) {
		bus.emit(
			bus.createEvent(
				"TRENDING_UPDATE",
				{
					repos: unique.map((repo, i) => ({
						repo,
						timestamp: now,
						rank: i + 1,
						source: "github-trending" as const,
					})),
					period,
					language: language ?? null,
				},
				"gitpulse",
			),
		);
	}

	return unique;
}

async function main() {
	const config = loadConfigFromEnv();
	const bus = new EventBus();
	const rateLimiter = new RateLimiter(config.rateLimit.maxRequestsPerMinute);
	const dedup = new RepoDeduplicator();
	const fullConfig = defaultConfig();

	const registry = new ModuleRegistry("gitpulse", config.port);
	registry.registerPeers(fullConfig.modules.peers);

	switch (command) {
		case "crawl": {
			console.log("[GitPulse] Running single crawl...");
			const repos = await crawlOnce(rateLimiter, dedup, bus);
			for (const repo of repos) {
				console.log(JSON.stringify(repo));
			}
			await closeBrowser();
			process.exit(0);
			break;
		}

		case "serve": {
			const app = createServer({
				bus,
				registry,
				dedup,
				port: config.port,
				triggerCrawl: (period, language) => crawlOnce(rateLimiter, dedup, bus, period, language),
			});

			// Start health checks
			registry.startHealthChecks(fullConfig.modules.healthCheckIntervalMs, (name, state) => {
				console.log(`[Discovery] ${name}: ${state.status}`);
				if (state.status === "healthy") {
					bus.emit(
						bus.createEvent(
							"MODULE_CONNECTED",
							{ moduleId: name, moduleName: name, port: state.config.port },
							"gitpulse",
						),
					);
				}
			});

			// Initial crawl
			console.log("[GitPulse] Running initial crawl...");
			await crawlOnce(rateLimiter, dedup, bus);

			// Start scheduler
			const scheduler = new CrawlScheduler({
				intervalSec: config.crawlIntervalSec,
			});
			scheduler.start(async () => {
				await crawlOnce(rateLimiter, dedup, bus);
			});

			console.log(`[GitPulse] Server starting on port ${config.port}`);
			serve({ fetch: app.fetch, port: config.port });
			break;
		}

		case "mcp": {
			console.error("[GitPulse] Starting MCP server...");
			// Do an initial crawl to populate data
			await crawlOnce(rateLimiter, dedup, bus);
			await startMcpServer(dedup);
			break;
		}

		default:
			console.error(`Unknown command: ${command}. Use: crawl, serve, mcp`);
			process.exit(1);
	}
}

main().catch((err) => {
	console.error("[GitPulse] Fatal:", err);
	process.exit(1);
});
