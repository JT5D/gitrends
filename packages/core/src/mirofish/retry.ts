/** Exponential backoff + jitter retry utility (~60 lines) */

export interface RetryOptions {
	maxRetries: number;
	baseDelayMs: number;
	maxDelayMs: number;
	jitter: boolean;
	onRetry?: (error: unknown, attempt: number) => void;
}

const defaults: RetryOptions = {
	maxRetries: 3,
	baseDelayMs: 500,
	maxDelayMs: 30000,
	jitter: true,
};

export async function retry<T>(fn: () => Promise<T>, opts: Partial<RetryOptions> = {}): Promise<T> {
	const { maxRetries, baseDelayMs, maxDelayMs, jitter, onRetry } = {
		...defaults,
		...opts,
	};

	let lastError: unknown;
	for (let attempt = 0; attempt <= maxRetries; attempt++) {
		try {
			return await fn();
		} catch (err) {
			lastError = err;
			if (attempt === maxRetries) break;
			onRetry?.(err, attempt + 1);
			const delay = computeDelay(attempt, baseDelayMs, maxDelayMs, jitter);
			await sleep(delay);
		}
	}
	throw lastError;
}

function computeDelay(attempt: number, baseMs: number, maxMs: number, jitter: boolean): number {
	const exponential = baseMs * 2 ** attempt;
	const capped = Math.min(exponential, maxMs);
	if (!jitter) return capped;
	return Math.floor(capped * (0.5 + Math.random() * 0.5));
}

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
