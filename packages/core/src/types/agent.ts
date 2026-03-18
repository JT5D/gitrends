/** Agent and swarm types */

export type AgentType =
	| "profile-learner"
	| "repo-recommender"
	| "dash-optimizer"
	| "tool-suggester"
	| "auto-fixer";

export type AgentStatus = "idle" | "running" | "error" | "stopped";

export interface AgentInfo {
	id: string;
	type: AgentType;
	status: AgentStatus;
	lastRunAt: string | null;
	taskCount: number;
	errorCount: number;
}

export interface AgentTask {
	id: string;
	agentType: AgentType;
	input: unknown;
	createdAt: string;
	startedAt: string | null;
	completedAt: string | null;
	status: "pending" | "running" | "completed" | "failed";
	result: unknown | null;
	error: string | null;
}

export interface UserProfile {
	userId: string;
	githubUsername: string;
	interests: InterestVector;
	preferredLanguages: string[];
	watchedRepos: string[];
	lastUpdatedAt: string;
}

export interface InterestVector {
	/** Language affinity scores (0-1) */
	languages: Record<string, number>;
	/** Topic affinity scores (0-1) */
	topics: Record<string, number>;
	/** Star-range preference (normalized) */
	starRange: [number, number];
	/** Preference for new vs established repos (0 = established, 1 = new) */
	noveltyBias: number;
}

export interface Recommendation {
	repoFullName: string;
	score: number;
	reasons: string[];
	agentId: string;
	generatedAt: string;
}

export interface LearningLoopState {
	cycle: number;
	lastObservedAt: string | null;
	lastLearnedAt: string | null;
	lastAdjustedAt: string | null;
	lastFixedAt: string | null;
	metrics: LearningMetrics;
}

export interface LearningMetrics {
	recommendationAcceptRate: number;
	crawlSuccessRate: number;
	avgEnrichmentLatencyMs: number;
	agentErrorRate: number;
	activePeers: number;
}
