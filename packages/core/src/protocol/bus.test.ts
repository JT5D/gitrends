import { describe, expect, it, vi } from "vitest";
import type { CrawlCompletedEvent, TrendingUpdateEvent } from "../types/events.ts";
import { EventBus } from "./bus.ts";

describe("EventBus", () => {
	it("emits and receives typed events", () => {
		const bus = new EventBus();
		const handler = vi.fn();

		bus.on<TrendingUpdateEvent>("TRENDING_UPDATE", handler);

		const event = bus.createEvent<TrendingUpdateEvent>(
			"TRENDING_UPDATE",
			{ repos: [], period: "daily", language: null },
			"test",
		);
		bus.emit(event);

		expect(handler).toHaveBeenCalledOnce();
		expect(handler).toHaveBeenCalledWith(event);
	});

	it("supports onAny for all events", () => {
		const bus = new EventBus();
		const handler = vi.fn();
		bus.onAny(handler);

		bus.emit(
			bus.createEvent("CRAWL_STARTED", { source: "test", language: null, period: "daily" }, "test"),
		);
		bus.emit(
			bus.createEvent("CRAWL_COMPLETED", { source: "test", repoCount: 5, durationMs: 100 }, "test"),
		);

		expect(handler).toHaveBeenCalledTimes(2);
	});

	it("unsubscribes correctly", () => {
		const bus = new EventBus();
		const handler = vi.fn();
		const unsub = bus.on<CrawlCompletedEvent>("CRAWL_COMPLETED", handler);

		bus.emit(
			bus.createEvent("CRAWL_COMPLETED", { source: "test", repoCount: 0, durationMs: 0 }, "test"),
		);
		expect(handler).toHaveBeenCalledOnce();

		unsub();
		bus.emit(
			bus.createEvent("CRAWL_COMPLETED", { source: "test", repoCount: 0, durationMs: 0 }, "test"),
		);
		expect(handler).toHaveBeenCalledOnce();
	});

	it("maintains history", () => {
		const bus = new EventBus({ maxHistory: 5 });
		for (let i = 0; i < 10; i++) {
			bus.emit(
				bus.createEvent(
					"CRAWL_STARTED",
					{ source: "test", language: null, period: "daily" },
					"test",
				),
			);
		}
		expect(bus.getHistory().length).toBe(5);
	});
});
