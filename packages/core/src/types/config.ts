/** Configuration types for all modules */

export interface GitrendsConfig {
	gitpulse: GitPulseConfig;
	gitdash: GitDashConfig;
	swarm: SwarmConfig;
	modules: ModuleDiscoveryConfig;
}

export interface GitPulseConfig {
	port: number;
	crawlIntervalSec: number;
	sources: CrawlSourceConfig[];
	rateLimit: RateLimitConfig;
	githubToken: string | null;
}

export interface CrawlSourceConfig {
	type: "puppeteer" | "github-api" | "ossinsight";
	enabled: boolean;
	priority: number;
	languages: string[];
	periods: ("daily" | "weekly" | "monthly")[];
}

export interface RateLimitConfig {
	maxRequestsPerMinute: number;
	backoffMultiplier: number;
	maxBackoffSec: number;
}

export interface GitDashConfig {
	port: number;
	defaultLayout: string;
	refreshIntervalMs: number;
	maxCacheEntries: number;
}

export interface SwarmConfig {
	port: number;
	llmApiKey: string | null;
	llmBaseUrl: string;
	llmModel: string;
	learningLoopIntervalSec: number;
	maxConcurrentAgents: number;
}

export interface ModuleDiscoveryConfig {
	peers: PeerConfig[];
	healthCheckIntervalMs: number;
	reconnectIntervalMs: number;
}

export interface PeerConfig {
	name: string;
	host: string;
	port: number;
}

export function defaultConfig(): GitrendsConfig {
	return {
		gitpulse: {
			port: 7401,
			crawlIntervalSec: 45,
			sources: [
				{
					type: "puppeteer",
					enabled: true,
					priority: 1,
					languages: [],
					periods: ["daily"],
				},
				{
					type: "ossinsight",
					enabled: true,
					priority: 2,
					languages: [],
					periods: ["daily"],
				},
				{
					type: "github-api",
					enabled: false,
					priority: 3,
					languages: [],
					periods: ["daily"],
				},
			],
			rateLimit: {
				maxRequestsPerMinute: 30,
				backoffMultiplier: 2,
				maxBackoffSec: 120,
			},
			githubToken: null,
		},
		gitdash: {
			port: 7402,
			defaultLayout: "overview",
			refreshIntervalMs: 5000,
			maxCacheEntries: 1000,
		},
		swarm: {
			port: 7403,
			llmApiKey: null,
			llmBaseUrl: "https://api.anthropic.com",
			llmModel: "claude-sonnet-4-20250514",
			learningLoopIntervalSec: 300,
			maxConcurrentAgents: 5,
		},
		modules: {
			peers: [
				{ name: "gitpulse", host: "localhost", port: 7401 },
				{ name: "gitdash", host: "localhost", port: 7402 },
				{ name: "swarm", host: "localhost", port: 7403 },
			],
			healthCheckIntervalMs: 10000,
			reconnectIntervalMs: 5000,
		},
	};
}
