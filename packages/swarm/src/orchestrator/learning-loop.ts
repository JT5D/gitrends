/** LearningLoop — OBSERVE → LEARN → ADJUST → FIX → REPEAT */

import type { EventBus, LearningLoopState, LearningMetrics, TrendingRepo } from "@gitrends/core";
import type { ExperimentEngine } from "../experiment/experiment-engine.ts";
import type { PreferenceStore } from "../experiment/preference-store.ts";

export interface LearningLoopConfig {
	intervalSec: number;
	bus: EventBus;
	onAdjust?: (metrics: LearningMetrics) => void;
	experimentEngine?: ExperimentEngine;
	preferenceStore?: PreferenceStore;
	getRepos?: () => TrendingRepo[];
}

export class LearningLoop {
	private state: LearningLoopState;
	private config: LearningLoopConfig;
	private timer: ReturnType<typeof setInterval> | null = null;
	private observations: Observation[] = [];

	constructor(config: LearningLoopConfig) {
		this.config = config;
		this.state = {
			cycle: 0,
			lastObservedAt: null,
			lastLearnedAt: null,
			lastAdjustedAt: null,
			lastFixedAt: null,
			metrics: {
				recommendationAcceptRate: 0,
				crawlSuccessRate: 1,
				avgEnrichmentLatencyMs: 0,
				agentErrorRate: 0,
				activePeers: 0,
			},
		};
	}

	start(): void {
		// Listen to events for observations
		this.config.bus.onAny((event) => {
			this.observations.push({
				type: event.type,
				timestamp: event.timestamp,
				payload: event.payload,
			});
			// Cap observation buffer
			if (this.observations.length > 500) {
				this.observations = this.observations.slice(-500);
			}
		});

		this.timer = setInterval(() => this.runCycle(), this.config.intervalSec * 1000);
	}

	stop(): void {
		if (this.timer) {
			clearInterval(this.timer);
			this.timer = null;
		}
	}

	private async runCycle(): Promise<void> {
		this.state.cycle++;
		const now = new Date().toISOString();

		// OBSERVE
		this.state.lastObservedAt = now;
		const recent = this.observations.slice(-100);

		// LEARN — compute metrics from recent observations
		this.state.lastLearnedAt = now;
		const crawlEvents = recent.filter(
			(o) => o.type === "CRAWL_COMPLETED" || o.type === "CRAWL_ERROR",
		);
		const crawlSuccesses = crawlEvents.filter((o) => o.type === "CRAWL_COMPLETED").length;
		this.state.metrics.crawlSuccessRate =
			crawlEvents.length > 0 ? crawlSuccesses / crawlEvents.length : 1;

		const agentEvents = recent.filter(
			(o) => o.type === "AGENT_TASK_COMPLETED" || o.type === "AGENT_TASK_FAILED",
		);
		const agentFailures = agentEvents.filter((o) => o.type === "AGENT_TASK_FAILED").length;
		this.state.metrics.agentErrorRate =
			agentEvents.length > 0 ? agentFailures / agentEvents.length : 0;

		const moduleEvents = recent.filter((o) => o.type === "MODULE_CONNECTED");
		this.state.metrics.activePeers = new Set(
			moduleEvents.map((o) => (o.payload as { moduleId: string }).moduleId),
		).size;

		// Use experiment engine accept rate if available
		if (this.config.experimentEngine) {
			this.state.metrics.recommendationAcceptRate =
				this.config.experimentEngine.getOverallAcceptRate();
		}

		// ADJUST — notify listeners of new metrics
		this.state.lastAdjustedAt = now;
		this.config.onAdjust?.(this.state.metrics);

		// Run preference learning for users who gave feedback
		if (this.config.preferenceStore && this.config.getRepos) {
			const repos = this.config.getRepos();
			const repoLookup = new Map(repos.map((r) => [r.fullName, r]));
			const activeUsers = this.config.preferenceStore.getUsersWithFeedback();
			for (const userId of activeUsers) {
				this.config.preferenceStore.learnWeights(userId, repoLookup);
			}
		}

		// FIX — auto-fix is handled by AutoFixer agent via EventBus
		this.state.lastFixedAt = now;

		console.log(
			`[LearningLoop] Cycle ${this.state.cycle}: crawl=${(this.state.metrics.crawlSuccessRate * 100).toFixed(0)}% agents=${(100 - this.state.metrics.agentErrorRate * 100).toFixed(0)}% peers=${this.state.metrics.activePeers}`,
		);
	}

	getState(): LearningLoopState {
		return { ...this.state };
	}
}

interface Observation {
	type: string;
	timestamp: string;
	payload: unknown;
}
