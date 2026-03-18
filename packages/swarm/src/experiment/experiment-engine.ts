/** ExperimentEngine — A/B experiment lifecycle + variant assignment */

import type {
	EventBus,
	Experiment,
	ExperimentResults,
	ExperimentVariant,
	FeedbackSignal,
	ScoringWeights,
	VariantResult,
} from "@gitrends/core";
import { DEFAULT_WEIGHTS } from "@gitrends/core";

export class ExperimentEngine {
	private experiments: Map<string, Experiment> = new Map();
	private bus: EventBus;
	private userAssignments: Map<string, Map<string, string>> = new Map(); // userId -> experimentId -> variantId

	constructor(bus: EventBus) {
		this.bus = bus;
	}

	createExperiment(
		name: string,
		description: string,
		variantConfigs: Array<{ name: string; weights: ScoringWeights }>,
	): Experiment {
		const id = crypto.randomUUID();
		const variants: ExperimentVariant[] = variantConfigs.map((vc) => ({
			id: crypto.randomUUID(),
			name: vc.name,
			weights: vc.weights,
			assignedCount: 0,
			feedbackCounts: { like: 0, dislike: 0, favorite: 0, hide: 0, click: 0 },
		}));

		const experiment: Experiment = {
			id,
			name,
			description,
			status: "draft",
			variants,
			createdAt: new Date().toISOString(),
			startedAt: null,
			completedAt: null,
		};

		this.experiments.set(id, experiment);
		return experiment;
	}

	startExperiment(id: string): Experiment | null {
		const exp = this.experiments.get(id);
		if (!exp || exp.status !== "draft") return null;
		exp.status = "running";
		exp.startedAt = new Date().toISOString();
		return exp;
	}

	endExperiment(id: string): Experiment | null {
		const exp = this.experiments.get(id);
		if (!exp || exp.status !== "running") return null;
		exp.status = "completed";
		exp.completedAt = new Date().toISOString();
		return exp;
	}

	assignVariant(userId: string, experimentId: string): ExperimentVariant | null {
		const exp = this.experiments.get(experimentId);
		if (!exp || exp.status !== "running" || exp.variants.length === 0) return null;

		// Check existing assignment
		const userMap = this.userAssignments.get(userId);
		if (userMap?.has(experimentId)) {
			const existingId = userMap.get(experimentId) ?? "";
			return exp.variants.find((v) => v.id === existingId) ?? null;
		}

		// Deterministic hash bucketing
		const hash = this.hashCode(`${userId}:${experimentId}`);
		const index = Math.abs(hash) % exp.variants.length;
		const variant = exp.variants[index];
		if (!variant) return null;
		variant.assignedCount++;

		// Store assignment
		if (!this.userAssignments.has(userId)) {
			this.userAssignments.set(userId, new Map());
		}
		this.userAssignments.get(userId)?.set(experimentId, variant.id);

		// Emit event
		this.bus.emit(
			this.bus.createEvent(
				"VARIANT_ASSIGNED",
				{ userId, experimentId, variantId: variant.id },
				"experiment-engine",
			),
		);

		return variant;
	}

	recordFeedback(
		userId: string,
		repoFullName: string,
		signal: FeedbackSignal,
		experimentId: string | null,
		variantId: string | null,
	): void {
		// Update variant feedback counts
		if (experimentId && variantId) {
			const exp = this.experiments.get(experimentId);
			if (exp) {
				const variant = exp.variants.find((v) => v.id === variantId);
				if (variant) {
					variant.feedbackCounts[signal]++;
				}
			}
		}

		// Emit event
		this.bus.emit(
			this.bus.createEvent(
				"USER_FEEDBACK",
				{ signal, repoFullName, userId, variantId, experimentId },
				"experiment-engine",
			),
		);
	}

	getWeightsForUser(userId: string): ScoringWeights {
		// Find active experiment and return variant weights
		for (const exp of this.experiments.values()) {
			if (exp.status !== "running") continue;
			const userMap = this.userAssignments.get(userId);
			if (!userMap?.has(exp.id)) continue;
			const variantId = userMap.get(exp.id) ?? "";
			const variant = exp.variants.find((v) => v.id === variantId);
			if (variant) return variant.weights;
		}
		return DEFAULT_WEIGHTS;
	}

	getActiveVariantForUser(
		userId: string,
	): { experimentId: string; variant: ExperimentVariant } | null {
		for (const exp of this.experiments.values()) {
			if (exp.status !== "running") continue;
			const userMap = this.userAssignments.get(userId);
			if (!userMap?.has(exp.id)) continue;
			const variantId = userMap.get(exp.id) ?? "";
			const variant = exp.variants.find((v) => v.id === variantId);
			if (variant) return { experimentId: exp.id, variant };
		}
		return null;
	}

	getResults(experimentId: string): ExperimentResults | null {
		const exp = this.experiments.get(experimentId);
		if (!exp) return null;

		const variants: VariantResult[] = exp.variants.map((v) => {
			const positive = v.feedbackCounts.like + v.feedbackCounts.favorite + v.feedbackCounts.click;
			const negative = v.feedbackCounts.dislike + v.feedbackCounts.hide;
			const total = positive + negative;
			return {
				variantId: v.id,
				variantName: v.name,
				acceptRate: total > 0 ? positive / total : 0,
				feedbackCounts: { ...v.feedbackCounts },
				totalSignals: Object.values(v.feedbackCounts).reduce((a, b) => a + b, 0),
			};
		});

		// Determine winner: needs at least 5 signals
		let winnerId: string | null = null;
		const eligible = variants.filter((v) => v.totalSignals >= 5);
		if (eligible.length > 1) {
			eligible.sort((a, b) => b.acceptRate - a.acceptRate);
			winnerId = eligible[0]?.variantId ?? null;
		}

		return { experimentId, variants, winnerId };
	}

	getOverallAcceptRate(): number {
		let totalPositive = 0;
		let totalNegative = 0;

		for (const exp of this.experiments.values()) {
			for (const v of exp.variants) {
				totalPositive += v.feedbackCounts.like + v.feedbackCounts.favorite + v.feedbackCounts.click;
				totalNegative += v.feedbackCounts.dislike + v.feedbackCounts.hide;
			}
		}

		const total = totalPositive + totalNegative;
		return total > 0 ? totalPositive / total : 0;
	}

	getExperiments(): Experiment[] {
		return Array.from(this.experiments.values());
	}

	getExperiment(id: string): Experiment | null {
		return this.experiments.get(id) ?? null;
	}

	private hashCode(str: string): number {
		let hash = 0;
		for (let i = 0; i < str.length; i++) {
			const char = str.charCodeAt(i);
			hash = (hash << 5) - hash + char;
			hash |= 0; // Convert to 32bit integer
		}
		return hash;
	}
}
