import { describe, expect, it } from "vitest";
import { VectorStore, buildVocabulary, tagsToVector } from "./vector-store.ts";

describe("cosineSimilarity (via search)", () => {
	it("returns 1.0 for identical vectors", () => {
		const store = new VectorStore();
		store.add("a", [1, 0, 1]);
		const results = store.search([1, 0, 1]);
		expect(results[0]?.score).toBeCloseTo(1.0);
	});

	it("returns 0 for orthogonal vectors", () => {
		const store = new VectorStore();
		store.add("a", [1, 0, 0]);
		const results = store.search([0, 1, 0]);
		expect(results[0]?.score).toBeCloseTo(0);
	});

	it("returns 0 for zero vector", () => {
		const store = new VectorStore();
		store.add("a", [0, 0, 0]);
		const results = store.search([1, 0, 1]);
		expect(results[0]?.score).toBe(0);
	});

	it("returns 0 for mismatched lengths", () => {
		const store = new VectorStore();
		store.add("a", [1, 0]);
		const results = store.search([1, 0, 1]);
		expect(results[0]?.score).toBe(0);
	});
});

describe("VectorStore", () => {
	it("replaces entry on duplicate id", () => {
		const store = new VectorStore();
		store.add("a", [1, 0], { v: 1 });
		store.add("a", [0, 1], { v: 2 });
		expect(store.size()).toBe(1);
		expect(store.get("a")?.metadata.v).toBe(2);
	});

	it("ranks search results by score descending", () => {
		const store = new VectorStore();
		store.add("low", [0, 0, 1]);
		store.add("high", [1, 0, 1]);
		const results = store.search([1, 0, 1], 2);
		expect(results[0]?.entry.id).toBe("high");
	});

	it("topK limits results", () => {
		const store = new VectorStore();
		for (let i = 0; i < 10; i++) store.add(`e${i}`, [i, 0]);
		expect(store.search([1, 0], 3)).toHaveLength(3);
	});

	it("remove returns true for existing, false for missing", () => {
		const store = new VectorStore();
		store.add("a", [1]);
		expect(store.remove("a")).toBe(true);
		expect(store.remove("a")).toBe(false);
	});

	it("clear empties the store", () => {
		const store = new VectorStore();
		store.add("a", [1]);
		store.clear();
		expect(store.size()).toBe(0);
	});
});

describe("tagsToVector", () => {
	it("creates one-hot vector matching vocabulary", () => {
		const vocab = ["go", "python", "rust"];
		expect(tagsToVector(["rust", "go"], vocab)).toEqual([1, 0, 1]);
	});

	it("returns all zeros for no matching tags", () => {
		expect(tagsToVector(["java"], ["go", "rust"])).toEqual([0, 0]);
	});
});

describe("buildVocabulary", () => {
	it("returns sorted unique tags", () => {
		const vocab = buildVocabulary([
			["rust", "go"],
			["go", "python"],
		]);
		expect(vocab).toEqual(["go", "python", "rust"]);
	});

	it("handles empty input", () => {
		expect(buildVocabulary([])).toEqual([]);
	});
});
