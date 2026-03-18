/** Crawl scheduler with jitter */

export interface SchedulerOptions {
	intervalSec: number;
	jitterSec?: number;
}

export class CrawlScheduler {
	private timer: ReturnType<typeof setTimeout> | null = null;
	private running = false;
	private intervalMs: number;
	private jitterMs: number;

	constructor(opts: SchedulerOptions) {
		this.intervalMs = opts.intervalSec * 1000;
		this.jitterMs = (opts.jitterSec ?? Math.floor(opts.intervalSec * 0.3)) * 1000;
	}

	start(task: () => Promise<void>): void {
		if (this.running) return;
		this.running = true;
		this.schedule(task);
	}

	stop(): void {
		this.running = false;
		if (this.timer) {
			clearTimeout(this.timer);
			this.timer = null;
		}
	}

	private schedule(task: () => Promise<void>): void {
		if (!this.running) return;
		const jitter = Math.floor(Math.random() * this.jitterMs * 2 - this.jitterMs);
		const delay = Math.max(1000, this.intervalMs + jitter);

		this.timer = setTimeout(async () => {
			try {
				await task();
			} catch (err) {
				console.error("[Scheduler] Task failed:", err);
			}
			this.schedule(task);
		}, delay);
	}

	isRunning(): boolean {
		return this.running;
	}
}
