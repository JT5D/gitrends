/** Experiment, feedback, voting, and preference types */

export type FeedbackSignal = "like" | "dislike" | "favorite" | "hide" | "click";

export interface UserFeedback {
	userId: string;
	repoFullName: string;
	signal: FeedbackSignal;
	variantId: string | null;
	experimentId: string | null;
	timestamp: string;
}

export interface ScoringWeights {
	language: number;
	topic: number;
	stars: number;
	momentum: number;
	novelty: number;
}

export const DEFAULT_WEIGHTS: ScoringWeights = {
	language: 0.4,
	topic: 0.3,
	stars: 0.15,
	momentum: 0.1,
	novelty: 0.05,
};

export interface ExperimentVariant {
	id: string;
	name: string;
	weights: ScoringWeights;
	assignedCount: number;
	feedbackCounts: Record<FeedbackSignal, number>;
}

export type ExperimentStatus = "draft" | "running" | "completed";

export interface Experiment {
	id: string;
	name: string;
	description: string;
	status: ExperimentStatus;
	variants: ExperimentVariant[];
	createdAt: string;
	startedAt: string | null;
	completedAt: string | null;
}

export interface VariantResult {
	variantId: string;
	variantName: string;
	acceptRate: number;
	feedbackCounts: Record<FeedbackSignal, number>;
	totalSignals: number;
}

export interface ExperimentResults {
	experimentId: string;
	variants: VariantResult[];
	winnerId: string | null;
}

export interface UserPreferences {
	userId: string;
	likedRepos: string[];
	dislikedRepos: string[];
	favoritedRepos: string[];
	hiddenRepos: string[];
	learnedWeights: ScoringWeights;
}

export type VotableItemType = "layout" | "theme" | "visualization";

export interface VotableItem {
	id: string;
	type: VotableItemType;
	name: string;
	description: string;
	voteCount: number;
}

export interface VoteSession {
	id: string;
	items: VotableItem[];
	userId: string | null;
	votedItemId: string | null;
	timestamp: string;
}
