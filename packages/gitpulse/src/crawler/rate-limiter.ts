/** Token bucket rate limiter */

export class RateLimiter {
	private tokens: number;
	private lastRefill: number;
	private maxTokens: number;
	private refillRate: number; // tokens per second

	constructor(maxPerMinute: number) {
		this.maxTokens = maxPerMinute;
		this.tokens = maxPerMinute;
		this.refillRate = maxPerMinute / 60;
		this.lastRefill = Date.now();
	}

	private refill(): void {
		const now = Date.now();
		const elapsed = (now - this.lastRefill) / 1000;
		this.tokens = Math.min(this.maxTokens, this.tokens + elapsed * this.refillRate);
		this.lastRefill = now;
	}

	async acquire(): Promise<void> {
		this.refill();
		if (this.tokens >= 1) {
			this.tokens--;
			return;
		}
		const waitMs = ((1 - this.tokens) / this.refillRate) * 1000;
		await new Promise((r) => setTimeout(r, waitMs));
		this.refill();
		if (this.tokens >= 1) this.tokens--;
	}

	available(): number {
		this.refill();
		return Math.floor(this.tokens);
	}
}
