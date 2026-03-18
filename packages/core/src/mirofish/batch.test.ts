import { describe, expect, it } from "vitest";
import { batch } from "./batch.ts";

describe("batch", () => {
	it("processes all items", async () => {
		const items = [1, 2, 3, 4, 5];
		const result = await batch(items, async (n) => n * 2, { concurrency: 2 });
		expect(result.succeeded).toBe(5);
		expect(result.failed).toBe(0);
		expect(result.results.map((r) => r.value)).toEqual([2, 4, 6, 8, 10]);
	});

	it("handles partial failures", async () => {
		const items = [1, 2, 3];
		const result = await batch(
			items,
			async (n) => {
				if (n === 2) throw new Error("fail");
				return n;
			},
			{ concurrency: 3 },
		);
		expect(result.succeeded).toBe(2);
		expect(result.failed).toBe(1);
		expect(result.results[1]?.status).toBe("rejected");
	});

	it("respects concurrency limit", async () => {
		let concurrent = 0;
		let maxConcurrent = 0;
		const items = Array.from({ length: 10 }, (_, i) => i);

		await batch(
			items,
			async () => {
				concurrent++;
				maxConcurrent = Math.max(maxConcurrent, concurrent);
				await new Promise((r) => setTimeout(r, 20));
				concurrent--;
			},
			{ concurrency: 3 },
		);

		expect(maxConcurrent).toBeLessThanOrEqual(3);
	});

	it("calls onProgress", async () => {
		const progress: [number, number][] = [];
		await batch([1, 2, 3], async (n) => n, {
			onProgress: (completed, total) => progress.push([completed, total]),
		});
		expect(progress.length).toBe(3);
		expect(progress[2]).toEqual([3, 3]);
	});
});
