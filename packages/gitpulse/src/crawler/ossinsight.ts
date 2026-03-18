/** OSSInsight API client — trending repos alternative source */

import type { TrendingPeriod, TrendingRepo } from "@gitrends/core";
import type { RateLimiter } from "./rate-limiter.ts";

const OSSINSIGHT_API = "https://api.ossinsight.io/v1";

interface OSSInsightOptions {
	rateLimiter: RateLimiter;
}

/** Map our period to OSSInsight period param */
function mapPeriod(period: TrendingPeriod): string {
	switch (period) {
		case "daily":
			return "past_24_hours";
		case "weekly":
			return "past_week";
		case "monthly":
			return "past_month";
	}
}

export async function fetchOSSInsightTrending(
	opts: OSSInsightOptions & { language?: string; period: TrendingPeriod },
): Promise<TrendingRepo[]> {
	await opts.rateLimiter.acquire();

	const params = new URLSearchParams({
		period: mapPeriod(opts.period),
	});
	if (opts.language && opts.language !== "All") {
		params.set("language", opts.language);
	}

	const url = `${OSSINSIGHT_API}/trends/repos/?${params.toString()}`;
	const resp = await fetch(url, {
		headers: { Accept: "application/json" },
	});

	if (!resp.ok) {
		throw new Error(`OSSInsight API ${resp.status}: ${await resp.text()}`);
	}

	const data = (await resp.json()) as { data: OSSInsightRepo[] };
	return (data.data ?? []).map((item) => mapOSSInsightRepo(item, opts.period));
}

interface OSSInsightRepo {
	repo_name: string;
	repo_id: number;
	description: string | null;
	primary_language: string | null;
	stars: number;
	forks: number;
	total_score: number;
	contributor_logins: string[];
	collection_names: string[];
}

function mapOSSInsightRepo(item: OSSInsightRepo, period: TrendingPeriod): TrendingRepo {
	const [owner = "", name = ""] = item.repo_name.split("/");
	return {
		fullName: item.repo_name,
		owner,
		name,
		description: item.description ?? "",
		language: item.primary_language,
		stars: item.stars ?? 0,
		starsToday: 0,
		forks: item.forks ?? 0,
		openIssues: 0,
		builtBy: (item.contributor_logins ?? []).map((login) => ({
			username: login,
			avatarUrl: `https://github.com/${login}.png`,
		})),
		url: `https://github.com/${item.repo_name}`,
		firstSeenAt: new Date().toISOString(),
		lastSeenAt: new Date().toISOString(),
		trendingPeriod: period,
		topics: item.collection_names ?? [],
		license: null,
		archived: false,
	};
}
