import { describe, expect, it } from "vitest";
import { retry } from "./retry.ts";

describe("retry", () => {
	it("returns on first success", async () => {
		const result = await retry(async () => 42);
		expect(result).toBe(42);
	});

	it("retries on failure then succeeds", async () => {
		let attempt = 0;
		const result = await retry(
			async () => {
				attempt++;
				if (attempt < 3) throw new Error("fail");
				return "ok";
			},
			{ maxRetries: 3, baseDelayMs: 10 },
		);
		expect(result).toBe("ok");
		expect(attempt).toBe(3);
	});

	it("throws after max retries", async () => {
		await expect(
			retry(
				async () => {
					throw new Error("always fail");
				},
				{ maxRetries: 2, baseDelayMs: 10 },
			),
		).rejects.toThrow("always fail");
	});

	it("calls onRetry callback", async () => {
		const retries: number[] = [];
		let attempt = 0;
		await retry(
			async () => {
				attempt++;
				if (attempt < 2) throw new Error("fail");
				return true;
			},
			{
				maxRetries: 2,
				baseDelayMs: 10,
				onRetry: (_err, a) => retries.push(a),
			},
		);
		expect(retries).toEqual([1]);
	});
});
