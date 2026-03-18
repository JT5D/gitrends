/** Core repository types shared across all modules */

export interface TrendingRepo {
	/** GitHub full name (owner/repo) */
	fullName: string;
	/** Repository owner */
	owner: string;
	/** Repository name */
	name: string;
	/** Short description */
	description: string;
	/** Primary programming language */
	language: string | null;
	/** Total star count */
	stars: number;
	/** Stars gained in the trending period */
	starsToday: number;
	/** Total fork count */
	forks: number;
	/** Open issue count */
	openIssues: number;
	/** Contributors who built the trending repo (avatar URLs) */
	builtBy: ContributorRef[];
	/** GitHub URL */
	url: string;
	/** When this repo was first seen trending */
	firstSeenAt: string;
	/** Most recent crawl timestamp (ISO 8601) */
	lastSeenAt: string;
	/** Trending period: daily | weekly | monthly */
	trendingPeriod: TrendingPeriod;
	/** Topics/tags */
	topics: string[];
	/** License SPDX identifier */
	license: string | null;
	/** Whether repo is archived */
	archived: boolean;
}

export interface ContributorRef {
	username: string;
	avatarUrl: string;
}

export type TrendingPeriod = "daily" | "weekly" | "monthly";

export interface RepoSnapshot {
	repo: TrendingRepo;
	/** Timestamp of the snapshot */
	timestamp: string;
	/** Rank position on trending page (1-based) */
	rank: number;
	/** Source of this data */
	source: DataSource;
}

export type DataSource = "github-trending" | "github-api" | "ossinsight" | "cache";

export interface RepoEnrichment {
	fullName: string;
	/** README excerpt (first 500 chars) */
	readmeExcerpt: string | null;
	/** Recent commit activity (last 7 days) */
	recentCommits: number;
	/** Contributor count */
	contributorCount: number;
	/** Age in days since creation */
	ageDays: number;
	/** Created at ISO timestamp */
	createdAt: string;
	/** Last push ISO timestamp */
	lastPushedAt: string;
	/** Watchers count */
	watchers: number;
	/** Default branch */
	defaultBranch: string;
	/** Enrichment timestamp */
	enrichedAt: string;
}

export interface RepoWithEnrichment {
	snapshot: RepoSnapshot;
	enrichment: RepoEnrichment | null;
}
