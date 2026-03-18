/** GitHub REST API client for trending repo enrichment */

import type { RepoEnrichment, TrendingPeriod, TrendingRepo } from "@gitrends/core";
import type { RateLimiter } from "./rate-limiter.ts";

const GITHUB_API = "https://api.github.com";

interface GitHubApiOptions {
	token: string | null;
	rateLimiter: RateLimiter;
}

function headers(token: string | null): Record<string, string> {
	const h: Record<string, string> = {
		Accept: "application/vnd.github.v3+json",
		"User-Agent": "gitrends/0.1",
	};
	if (token) h.Authorization = `Bearer ${token}`;
	return h;
}

/** Search trending repos via GitHub Search API */
export async function searchTrending(
	opts: GitHubApiOptions & { language?: string; period: TrendingPeriod },
): Promise<TrendingRepo[]> {
	await opts.rateLimiter.acquire();

	const dateRange = periodToDateRange(opts.period);
	let q = `created:>${dateRange} sort:stars`;
	if (opts.language) q += ` language:${opts.language}`;

	const url = `${GITHUB_API}/search/repositories?q=${encodeURIComponent(q)}&sort=stars&order=desc&per_page=25`;
	const resp = await fetch(url, { headers: headers(opts.token) });
	if (!resp.ok) throw new Error(`GitHub API ${resp.status}: ${await resp.text()}`);

	const data = (await resp.json()) as { items: GitHubSearchItem[] };
	return data.items.map(mapSearchItem);
}

/** Enrich a repo with detailed info */
export async function enrichRepo(
	fullName: string,
	opts: GitHubApiOptions,
): Promise<RepoEnrichment> {
	await opts.rateLimiter.acquire();

	const url = `${GITHUB_API}/repos/${fullName}`;
	const resp = await fetch(url, { headers: headers(opts.token) });
	if (!resp.ok) throw new Error(`GitHub API ${resp.status} for ${fullName}`);

	const repo = (await resp.json()) as GitHubRepoDetail;

	return {
		fullName,
		readmeExcerpt: null, // Would need another API call
		recentCommits: 0,
		contributorCount: repo.subscribers_count ?? 0,
		ageDays: Math.floor((Date.now() - new Date(repo.created_at).getTime()) / 86400000),
		createdAt: repo.created_at,
		lastPushedAt: repo.pushed_at,
		watchers: repo.watchers_count,
		defaultBranch: repo.default_branch,
		enrichedAt: new Date().toISOString(),
	};
}

function periodToDateRange(period: TrendingPeriod): string {
	const now = new Date();
	const days = period === "daily" ? 1 : period === "weekly" ? 7 : 30;
	const past = new Date(now.getTime() - days * 86400000);
	return past.toISOString().split("T")[0]!;
}

interface GitHubSearchItem {
	full_name: string;
	owner: { login: string; avatar_url: string };
	name: string;
	description: string | null;
	language: string | null;
	stargazers_count: number;
	forks_count: number;
	open_issues_count: number;
	html_url: string;
	topics: string[];
	license: { spdx_id: string } | null;
	archived: boolean;
}

interface GitHubRepoDetail {
	created_at: string;
	pushed_at: string;
	subscribers_count: number;
	watchers_count: number;
	default_branch: string;
}

function mapSearchItem(item: GitHubSearchItem): TrendingRepo {
	return {
		fullName: item.full_name,
		owner: item.owner.login,
		name: item.name,
		description: item.description ?? "",
		language: item.language,
		stars: item.stargazers_count,
		starsToday: 0,
		forks: item.forks_count,
		openIssues: item.open_issues_count,
		builtBy: [{ username: item.owner.login, avatarUrl: item.owner.avatar_url }],
		url: item.html_url,
		firstSeenAt: new Date().toISOString(),
		lastSeenAt: new Date().toISOString(),
		trendingPeriod: "daily",
		topics: item.topics ?? [],
		license: item.license?.spdx_id ?? null,
		archived: item.archived,
	};
}
