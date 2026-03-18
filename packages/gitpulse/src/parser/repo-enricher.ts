/** Enrich trending repos with GitHub API data */

import { type RepoEnrichment, type TrendingRepo, batch, retry } from "@gitrends/core";
import { enrichRepo } from "../crawler/github-api.ts";
import type { RateLimiter } from "../crawler/rate-limiter.ts";

export interface EnricherOptions {
	githubToken: string | null;
	rateLimiter: RateLimiter;
	concurrency?: number;
}

export async function enrichRepos(
	repos: TrendingRepo[],
	opts: EnricherOptions,
): Promise<Map<string, RepoEnrichment>> {
	const enrichments = new Map<string, RepoEnrichment>();

	const result = await batch(
		repos,
		async (repo) => {
			return retry(
				() =>
					enrichRepo(repo.fullName, {
						token: opts.githubToken,
						rateLimiter: opts.rateLimiter,
					}),
				{ maxRetries: 2, baseDelayMs: 1000 },
			);
		},
		{ concurrency: opts.concurrency ?? 3 },
	);

	for (const item of result.results) {
		if (item.status === "fulfilled" && item.value) {
			enrichments.set(item.value.fullName, item.value);
		}
	}

	return enrichments;
}
