/** LiveFeed — real-time event stream display */

import type { GitrendsEvent } from "@gitrends/core";

interface LiveFeedProps {
	events: GitrendsEvent[];
}

function formatTime(iso: string): string {
	return new Date(iso).toLocaleTimeString("en-US", {
		hour12: false,
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
	});
}

function eventLabel(event: GitrendsEvent): string {
	switch (event.type) {
		case "TRENDING_UPDATE": {
			const p = event.payload as { repos?: unknown[] };
			return `Trending update: ${p.repos?.length ?? 0} repos`;
		}
		case "CRAWL_COMPLETED": {
			const p = event.payload as { repoCount?: number; durationMs?: number };
			return `Crawl done: ${p.repoCount} repos in ${p.durationMs}ms`;
		}
		case "CRAWL_ERROR": {
			const p = event.payload as { error?: string };
			return `Crawl error: ${p.error}`;
		}
		case "MODULE_CONNECTED": {
			const p = event.payload as { moduleName?: string };
			return `Module connected: ${p.moduleName}`;
		}
		case "MODULE_DISCONNECTED": {
			const p = event.payload as { moduleId?: string };
			return `Module disconnected: ${p.moduleId}`;
		}
		default:
			return event.type;
	}
}

export function LiveFeed({ events }: LiveFeedProps) {
	const recent = events.slice(-20).reverse();

	return (
		<div>
			{recent.length === 0 && (
				<div style={{ color: "var(--text-muted)", padding: "8px" }}>Waiting for events...</div>
			)}
			{recent.map((event) => (
				<div class="live-feed__item" key={event.id}>
					<span style={{ color: "var(--text-muted)" }}>{formatTime(event.timestamp)}</span>{" "}
					{eventLabel(event)}
				</div>
			))}
		</div>
	);
}
