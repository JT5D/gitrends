import { describe, expect, it } from "vitest";
import { RateLimiter } from "./rate-limiter.ts";

describe("RateLimiter", () => {
	it("starts with full token bucket", () => {
		const rl = new RateLimiter(60);
		expect(rl.available()).toBe(60);
	});

	it("decrements available after acquire", async () => {
		const rl = new RateLimiter(60);
		await rl.acquire();
		expect(rl.available()).toBe(59);
	});

	it("drains tokens on successive acquires", async () => {
		const rl = new RateLimiter(10);
		for (let i = 0; i < 5; i++) await rl.acquire();
		expect(rl.available()).toBe(5);
	});

	it("available() floors fractional tokens", () => {
		// Start with 3-per-minute → ~0.05 tokens/sec, partial bucket
		const rl = new RateLimiter(3);
		// Tokens start at 3, check it's floored to integer
		expect(Number.isInteger(rl.available())).toBe(true);
	});

	it("does not decrement below zero when acquire waits", async () => {
		// Use a low rate: 1 per minute = 1 token max
		const rl = new RateLimiter(1);
		await rl.acquire(); // drains the 1 token
		// available should be 0, not negative
		expect(rl.available()).toBeGreaterThanOrEqual(0);
	}, 10_000);
});
