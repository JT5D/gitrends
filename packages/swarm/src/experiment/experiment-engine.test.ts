import { EventBus } from "@gitrends/core/protocol";
import { describe, expect, it } from "vitest";
import { ExperimentEngine } from "./experiment-engine.ts";

const DEFAULT_W = { language: 0.4, topic: 0.3, stars: 0.15, momentum: 0.1, novelty: 0.05 };
const ALT_W = { language: 0.5, topic: 0.3, stars: 0.1, momentum: 0.05, novelty: 0.05 };

function makeEngine() {
	return new ExperimentEngine(new EventBus());
}

function runningExperiment(engine: ExperimentEngine) {
	const exp = engine.createExperiment("test", "desc", [
		{ name: "control", weights: DEFAULT_W },
		{ name: "variant", weights: ALT_W },
	]);
	engine.startExperiment(exp.id);
	return exp;
}

describe("ExperimentEngine lifecycle", () => {
	it("creates experiment in draft status", () => {
		const engine = makeEngine();
		const exp = engine.createExperiment("e", "d", [{ name: "a", weights: DEFAULT_W }]);
		expect(exp.status).toBe("draft");
		expect(exp.variants).toHaveLength(1);
	});

	it("starts a draft experiment", () => {
		const engine = makeEngine();
		const exp = engine.createExperiment("e", "d", [{ name: "a", weights: DEFAULT_W }]);
		const started = engine.startExperiment(exp.id);
		expect(started?.status).toBe("running");
		expect(started?.startedAt).not.toBeNull();
	});

	it("cannot start a running experiment", () => {
		const engine = makeEngine();
		const exp = runningExperiment(engine);
		expect(engine.startExperiment(exp.id)).toBeNull();
	});

	it("ends a running experiment", () => {
		const engine = makeEngine();
		const exp = runningExperiment(engine);
		const ended = engine.endExperiment(exp.id);
		expect(ended?.status).toBe("completed");
	});
});

describe("assignVariant", () => {
	it("returns null for non-running experiment", () => {
		const engine = makeEngine();
		const exp = engine.createExperiment("e", "d", [{ name: "a", weights: DEFAULT_W }]);
		expect(engine.assignVariant("u1", exp.id)).toBeNull();
	});

	it("deterministically assigns same variant on repeat calls", () => {
		const engine = makeEngine();
		const exp = runningExperiment(engine);
		const first = engine.assignVariant("user-abc", exp.id);
		const second = engine.assignVariant("user-abc", exp.id);
		expect(first?.id).toBe(second?.id);
	});

	it("different users may get different variants", () => {
		const engine = makeEngine();
		const exp = runningExperiment(engine);
		const assignments = new Set<string>();
		for (let i = 0; i < 20; i++) {
			const v = engine.assignVariant(`user-${i}`, exp.id);
			if (v) assignments.add(v.id);
		}
		// With 20 users and 2 variants, both should appear
		expect(assignments.size).toBe(2);
	});

	it("increments assignedCount per variant", () => {
		const engine = makeEngine();
		const exp = runningExperiment(engine);
		engine.assignVariant("u1", exp.id);
		engine.assignVariant("u2", exp.id);
		const total = exp.variants.reduce((s, v) => s + v.assignedCount, 0);
		expect(total).toBe(2);
	});
});

describe("recordFeedback and getResults", () => {
	it("counts feedback per variant", () => {
		const engine = makeEngine();
		const exp = runningExperiment(engine);
		const variant = exp.variants[0];
		if (!variant) throw new Error("no variant");

		engine.recordFeedback("u1", "owner/repo", "like", exp.id, variant.id);
		engine.recordFeedback("u1", "owner/repo", "like", exp.id, variant.id);
		expect(variant.feedbackCounts.like).toBe(2);
	});

	it("getResults accept rate = positive / (positive + negative)", () => {
		const engine = makeEngine();
		const exp = runningExperiment(engine);
		const v = exp.variants[0];
		if (!v) throw new Error("no variant");

		for (let i = 0; i < 3; i++) engine.recordFeedback("u", "r", "like", exp.id, v.id);
		engine.recordFeedback("u", "r", "dislike", exp.id, v.id);

		const results = engine.getResults(exp.id);
		const vr = results?.variants.find((r) => r.variantId === v.id);
		expect(vr?.acceptRate).toBeCloseTo(3 / 4);
	});

	it("winnerId requires >= 5 signals on multiple variants", () => {
		const engine = makeEngine();
		const exp = runningExperiment(engine);
		const [v0, v1] = exp.variants;
		if (!v0 || !v1) throw new Error("no variants");

		// Give v0 5+ signals, v1 5+ signals
		for (let i = 0; i < 6; i++) engine.recordFeedback("u", "r", "like", exp.id, v0.id);
		for (let i = 0; i < 5; i++) engine.recordFeedback("u", "r", "dislike", exp.id, v1.id);

		const results = engine.getResults(exp.id);
		expect(results?.winnerId).toBe(v0.id);
	});

	it("no winner if fewer than 5 signals", () => {
		const engine = makeEngine();
		const exp = runningExperiment(engine);
		const v = exp.variants[0];
		if (!v) throw new Error("no variant");
		engine.recordFeedback("u", "r", "like", exp.id, v.id);

		const results = engine.getResults(exp.id);
		expect(results?.winnerId).toBeNull();
	});
});

describe("getWeightsForUser", () => {
	it("returns DEFAULT_WEIGHTS when not in any experiment", () => {
		const engine = makeEngine();
		const weights = engine.getWeightsForUser("stranger");
		expect(weights.language).toBe(0.4);
	});

	it("returns variant weights for assigned user", () => {
		const engine = makeEngine();
		const exp = runningExperiment(engine);
		engine.assignVariant("u1", exp.id);
		const weights = engine.getWeightsForUser("u1");
		// Should be one of the variant weights, not DEFAULT_WEIGHTS specifically
		const validWeights = exp.variants.map((v) => v.weights.language);
		expect(validWeights).toContain(weights.language);
	});
});
