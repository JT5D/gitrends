import type { TrendingRepo } from "@gitrends/core";
import { describe, expect, it } from "vitest";
import { RepoDeduplicator } from "./dedup.ts";

function makeRepo(overrides: Partial<TrendingRepo> = {}): TrendingRepo {
	return {
		fullName: "owner/repo",
		owner: "owner",
		name: "repo",
		description: "A repo",
		language: "TypeScript",
		stars: 100,
		starsToday: 10,
		forks: 5,
		openIssues: 2,
		builtBy: [],
		url: "https://github.com/owner/repo",
		firstSeenAt: "2026-01-01T00:00:00Z",
		lastSeenAt: "2026-01-01T00:00:00Z",
		trendingPeriod: "daily",
		topics: [],
		license: "MIT",
		...overrides,
	};
}

describe("RepoDeduplicator", () => {
	it("returns new repos on first insert", () => {
		const dedup = new RepoDeduplicator();
		const repos = [makeRepo({ fullName: "a/b" }), makeRepo({ fullName: "c/d" })];
		const result = dedup.deduplicate(repos);
		expect(result).toHaveLength(2);
		expect(dedup.size()).toBe(2);
	});

	it("skips already-seen repos with same timestamp", () => {
		const dedup = new RepoDeduplicator();
		const repo = makeRepo({ fullName: "a/b" });
		dedup.deduplicate([repo]);
		const result = dedup.deduplicate([repo]);
		expect(result).toHaveLength(0);
	});

	it("updates repo when lastSeenAt is newer and preserves firstSeenAt", () => {
		const dedup = new RepoDeduplicator();
		const old = makeRepo({
			fullName: "a/b",
			firstSeenAt: "2026-01-01T00:00:00Z",
			lastSeenAt: "2026-01-01T00:00:00Z",
			stars: 100,
		});
		dedup.deduplicate([old]);

		const newer = makeRepo({
			fullName: "a/b",
			firstSeenAt: "2026-01-02T00:00:00Z",
			lastSeenAt: "2026-01-02T00:00:00Z",
			stars: 200,
		});
		const result = dedup.deduplicate([newer]);
		expect(result).toHaveLength(1);
		expect(result[0]?.stars).toBe(200);
		expect(result[0]?.firstSeenAt).toBe("2026-01-01T00:00:00Z");
	});

	it("getAll returns all tracked repos", () => {
		const dedup = new RepoDeduplicator();
		dedup.deduplicate([makeRepo({ fullName: "a/b" }), makeRepo({ fullName: "c/d" })]);
		expect(dedup.getAll()).toHaveLength(2);
	});

	it("clear resets state", () => {
		const dedup = new RepoDeduplicator();
		dedup.deduplicate([makeRepo({ fullName: "a/b" })]);
		dedup.clear();
		expect(dedup.size()).toBe(0);
		expect(dedup.getAll()).toHaveLength(0);
	});
});
