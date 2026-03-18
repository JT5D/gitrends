/** AutoFixer — monitors pipeline health, takes corrective action */

import type { EventBus, GitrendsEvent } from "@gitrends/core";

export interface FixAction {
	type: "restart_crawler" | "switch_source" | "increase_backoff" | "notify";
	detail: string;
	timestamp: string;
}

export class AutoFixer {
	private bus: EventBus;
	private errorCounts = new Map<string, number>();
	private actions: FixAction[] = [];
	private unsub: (() => void) | null = null;

	constructor(bus: EventBus) {
		this.bus = bus;
	}

	start(): void {
		this.unsub = this.bus.on("CRAWL_ERROR", (event) => {
			this.handleError(event);
		});
	}

	stop(): void {
		this.unsub?.();
		this.unsub = null;
	}

	private handleError(event: GitrendsEvent): void {
		const payload = event.payload as { source: string; error: string; retryCount: number };
		const key = payload.source;
		const count = (this.errorCounts.get(key) ?? 0) + 1;
		this.errorCounts.set(key, count);

		let action: FixAction;

		if (count >= 5) {
			// Too many failures — switch source
			action = {
				type: "switch_source",
				detail: `${key} failed ${count} times, switching to fallback source`,
				timestamp: new Date().toISOString(),
			};
		} else if (count >= 3) {
			// Moderate failures — increase backoff
			action = {
				type: "increase_backoff",
				detail: `${key} failed ${count} times, increasing backoff`,
				timestamp: new Date().toISOString(),
			};
		} else {
			// First failures — restart
			action = {
				type: "restart_crawler",
				detail: `${key} failed (${payload.error}), restarting`,
				timestamp: new Date().toISOString(),
			};
		}

		this.actions.push(action);
		console.log(`[AutoFixer] ${action.type}: ${action.detail}`);
	}

	getActions(): FixAction[] {
		return [...this.actions];
	}

	getErrorCounts(): Map<string, number> {
		return new Map(this.errorCounts);
	}

	resetErrors(source?: string): void {
		if (source) {
			this.errorCounts.delete(source);
		} else {
			this.errorCounts.clear();
		}
	}
}
