/** Parallel batch processing with semaphore concurrency (~120 lines) */

export interface BatchOptions {
	concurrency: number;
	onItemComplete?: (index: number, result: BatchItemResult) => void;
	onProgress?: (completed: number, total: number) => void;
	abortSignal?: AbortSignal;
}

export interface BatchItemResult<T = unknown> {
	index: number;
	status: "fulfilled" | "rejected";
	value?: T;
	error?: unknown;
}

export interface BatchResult<T = unknown> {
	results: BatchItemResult<T>[];
	succeeded: number;
	failed: number;
	totalMs: number;
}

/**
 * Process items in parallel with bounded concurrency.
 * Uses Promise.allSettled semantics - one failure doesn't stop others.
 */
export async function batch<T, R>(
	items: T[],
	fn: (item: T, index: number) => Promise<R>,
	opts: Partial<BatchOptions> = {},
): Promise<BatchResult<R>> {
	const { concurrency = 5, onItemComplete, onProgress, abortSignal } = opts;
	const start = Date.now();
	const results: BatchItemResult<R>[] = [];
	let completed = 0;

	const semaphore = new Semaphore(concurrency);

	const tasks = items.map(async (item, i) => {
		if (abortSignal?.aborted) {
			const result: BatchItemResult<R> = {
				index: i,
				status: "rejected",
				error: new Error("Aborted"),
			};
			results[i] = result;
			return;
		}

		await semaphore.acquire();
		try {
			const value = await fn(item, i);
			const result: BatchItemResult<R> = { index: i, status: "fulfilled", value };
			results[i] = result;
			onItemComplete?.(i, result);
		} catch (error) {
			const result: BatchItemResult<R> = { index: i, status: "rejected", error };
			results[i] = result;
			onItemComplete?.(i, result);
		} finally {
			completed++;
			onProgress?.(completed, items.length);
			semaphore.release();
		}
	});

	await Promise.allSettled(tasks);

	const succeeded = results.filter((r) => r.status === "fulfilled").length;
	return {
		results,
		succeeded,
		failed: results.length - succeeded,
		totalMs: Date.now() - start,
	};
}

class Semaphore {
	private permits: number;
	private waitQueue: (() => void)[] = [];

	constructor(permits: number) {
		this.permits = permits;
	}

	async acquire(): Promise<void> {
		if (this.permits > 0) {
			this.permits--;
			return;
		}
		return new Promise<void>((resolve) => {
			this.waitQueue.push(resolve);
		});
	}

	release(): void {
		const next = this.waitQueue.shift();
		if (next) {
			next();
		} else {
			this.permits++;
		}
	}
}
