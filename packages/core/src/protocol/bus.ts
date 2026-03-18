/** EventBus — typed pub/sub for cross-module communication */

import type { EventHandler, EventType, GitrendsEvent } from "../types/events.ts";

export class EventBus {
	private handlers = new Map<EventType, Set<EventHandler>>();
	private allHandlers = new Set<EventHandler>();
	private history: GitrendsEvent[] = [];
	private maxHistory: number;

	constructor(opts: { maxHistory?: number } = {}) {
		this.maxHistory = opts.maxHistory ?? 1000;
	}

	on<T extends GitrendsEvent>(type: T["type"], handler: EventHandler<T>): () => void {
		if (!this.handlers.has(type)) {
			this.handlers.set(type, new Set());
		}
		this.handlers.get(type)?.add(handler as EventHandler);
		return () => this.off(type, handler);
	}

	onAny(handler: EventHandler): () => void {
		this.allHandlers.add(handler);
		return () => this.allHandlers.delete(handler);
	}

	off<T extends GitrendsEvent>(type: T["type"], handler: EventHandler<T>): void {
		this.handlers.get(type)?.delete(handler as EventHandler);
	}

	emit(event: GitrendsEvent): void {
		this.history.push(event);
		if (this.history.length > this.maxHistory) {
			this.history = this.history.slice(-this.maxHistory);
		}

		const typeHandlers = this.handlers.get(event.type);
		if (typeHandlers) {
			for (const handler of typeHandlers) {
				try {
					handler(event);
				} catch (err) {
					console.error(`[EventBus] Handler error for ${event.type}:`, err);
				}
			}
		}

		for (const handler of this.allHandlers) {
			try {
				handler(event);
			} catch (err) {
				console.error("[EventBus] Global handler error:", err);
			}
		}
	}

	/** Create a typed event with auto-generated id and timestamp */
	createEvent<T extends GitrendsEvent>(type: T["type"], payload: T["payload"], source: string): T {
		return {
			type,
			payload,
			source,
			timestamp: new Date().toISOString(),
			id: crypto.randomUUID(),
		} as T;
	}

	getHistory(type?: EventType, limit?: number): GitrendsEvent[] {
		let events = type ? this.history.filter((e) => e.type === type) : this.history;
		if (limit) events = events.slice(-limit);
		return events;
	}

	clear(): void {
		this.handlers.clear();
		this.allHandlers.clear();
		this.history = [];
	}
}
