/** Hono HTTP server — REST + SSE + WebSocket endpoints */

import {
	type EventBus,
	type GitrendsEvent,
	type ModuleRegistry,
	type TrendingPeriod,
	type TrendingRepo,
	createHealthResponse,
} from "@gitrends/core";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { stream } from "hono/streaming";
import type { RepoDeduplicator } from "./parser/dedup.ts";

export interface ServerDeps {
	bus: EventBus;
	registry: ModuleRegistry;
	dedup: RepoDeduplicator;
	port: number;
	triggerCrawl: (period: TrendingPeriod, language?: string) => Promise<TrendingRepo[]>;
}

export function createServer(deps: ServerDeps) {
	const app = new Hono();

	app.use("/*", cors());

	// Health check
	app.get("/health", (c) => {
		const health = createHealthResponse("gitpulse", deps.port, [
			"crawl",
			"trending",
			"stream",
			"enrich",
		]);
		return c.json(health);
	});

	// GET /trending — current trending repos
	app.get("/trending", (c) => {
		const repos = deps.dedup.getAll();
		return c.json({
			count: repos.length,
			repos,
			lastUpdated: repos[0]?.lastSeenAt ?? null,
		});
	});

	// POST /crawl — trigger manual crawl
	app.post("/crawl", async (c) => {
		const body = await c.req.json().catch(() => ({}));
		const period = (body as { period?: string }).period ?? "daily";
		const language = (body as { language?: string }).language;
		try {
			const repos = await deps.triggerCrawl(period as TrendingPeriod, language);
			return c.json({ success: true, count: repos.length });
		} catch (err) {
			return c.json({ success: false, error: (err as Error).message }, 500);
		}
	});

	// GET /stream — SSE event stream
	app.get("/stream", (c) => {
		return stream(c, async (s) => {
			c.header("Content-Type", "text/event-stream");
			c.header("Cache-Control", "no-cache");
			c.header("Connection", "keep-alive");

			const unsub = deps.bus.onAny((event: GitrendsEvent) => {
				const data = `event: ${event.type}\ndata: ${JSON.stringify(event)}\nid: ${event.id}\n\n`;
				s.write(data).catch(() => {});
			});

			// Keep alive
			const keepAlive = setInterval(() => {
				s.write(": keepalive\n\n").catch(() => {});
			}, 15000);

			s.onAbort(() => {
				unsub();
				clearInterval(keepAlive);
			});

			// Block until client disconnects
			await new Promise(() => {});
		});
	});

	// GET /history — recent event history
	app.get("/history", (c) => {
		const type = c.req.query("type");
		const limit = Number.parseInt(c.req.query("limit") ?? "50", 10);
		const events = deps.bus.getHistory(type as GitrendsEvent["type"] | undefined, limit);
		return c.json({ count: events.length, events });
	});

	// GET /peers — module discovery status
	app.get("/peers", (c) => {
		const peers = Object.fromEntries(deps.registry.getAllPeers());
		return c.json(peers);
	});

	return app;
}
