/** Deduplication for trending repos across crawl sources */

import type { TrendingRepo } from "@gitrends/core";

export class RepoDeduplicator {
	private seen = new Map<string, TrendingRepo>();

	/** Add repos, return only new/updated ones */
	deduplicate(repos: TrendingRepo[]): TrendingRepo[] {
		const results: TrendingRepo[] = [];
		for (const repo of repos) {
			const existing = this.seen.get(repo.fullName);
			if (!existing) {
				this.seen.set(repo.fullName, repo);
				results.push(repo);
			} else if (repo.lastSeenAt > existing.lastSeenAt) {
				// Update with newer data, preserve firstSeenAt
				const updated = { ...repo, firstSeenAt: existing.firstSeenAt };
				this.seen.set(repo.fullName, updated);
				results.push(updated);
			}
		}
		return results;
	}

	getAll(): TrendingRepo[] {
		return [...this.seen.values()];
	}

	size(): number {
		return this.seen.size;
	}

	clear(): void {
		this.seen.clear();
	}
}
