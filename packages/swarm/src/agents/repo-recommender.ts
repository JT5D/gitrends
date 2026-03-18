/** RepoRecommender — cosine similarity scoring for personalized recommendations */

import type { Recommendation, ScoringWeights, TrendingRepo, UserProfile } from "@gitrends/core";
import { DEFAULT_WEIGHTS } from "@gitrends/core";
import { type AgentConfig, BaseAgent } from "./base-agent.ts";

interface RecommendInput {
	profile: UserProfile;
	repos: TrendingRepo[];
	limit?: number;
	weights?: ScoringWeights;
	hiddenRepos?: string[];
}

export class RepoRecommender extends BaseAgent<RecommendInput, Recommendation[]> {
	constructor(config: AgentConfig) {
		super({ ...config, type: "repo-recommender" });
	}

	protected buildPrompt(input: RecommendInput): string {
		const topRepos = input.repos
			.slice(0, 10)
			.map((r) => r.fullName)
			.join(", ");
		return `Given a user who prefers languages ${input.profile.preferredLanguages.join(", ")} and topics ${Object.keys(input.profile.interests.topics).join(", ")}, rank these trending repos and explain why they'd be interested:

Repos: ${topRepos}

Return JSON array: [{ "repoFullName": "...", "score": 0-1, "reasons": ["..."] }]`;
	}

	protected parseOutput(raw: unknown): Recommendation[] {
		const arr = Array.isArray(raw) ? raw : [];
		return arr.map((item: { repoFullName: string; score: number; reasons: string[] }) => ({
			repoFullName: item.repoFullName ?? "",
			score: item.score ?? 0,
			reasons: item.reasons ?? [],
			agentId: this.config.id,
			generatedAt: new Date().toISOString(),
		}));
	}

	protected fallbackDefaults(input: RecommendInput): Recommendation[] {
		return this.scoreWithCosine(input);
	}

	/** Rule-based: cosine similarity between user interests and repo attributes */
	private scoreWithCosine(input: RecommendInput): Recommendation[] {
		const { profile, repos, limit = 10, hiddenRepos = [] } = input;
		const w = input.weights ?? DEFAULT_WEIGHTS;

		// Filter out hidden repos
		const filteredRepos =
			hiddenRepos.length > 0 ? repos.filter((r) => !hiddenRepos.includes(r.fullName)) : repos;

		const scored = filteredRepos.map((repo) => {
			let score = 0;
			const reasons: string[] = [];

			// Language match
			if (repo.language && profile.interests.languages[repo.language]) {
				const langScore = profile.interests.languages[repo.language] ?? 0;
				score += langScore * w.language;
				reasons.push(`Language match: ${repo.language} (${(langScore * 100).toFixed(0)}%)`);
			}

			// Topic match (cosine-like similarity)
			const topicOverlap = repo.topics.filter((t) => profile.interests.topics[t]);
			if (topicOverlap.length > 0) {
				const topicScore =
					topicOverlap.reduce((sum, t) => sum + (profile.interests.topics[t] ?? 0), 0) /
					Math.max(repo.topics.length, 1);
				score += topicScore * w.topic;
				reasons.push(`Topic match: ${topicOverlap.join(", ")}`);
			}

			// Star popularity (normalized)
			const starScore = Math.min(repo.stars / 50000, 1) * w.stars;
			score += starScore;

			// Trending momentum
			if (repo.starsToday > 100) {
				score += w.momentum;
				reasons.push(`Hot: +${repo.starsToday} stars today`);
			}

			// Novelty bias
			const isNew = repo.starsToday > repo.stars * 0.01;
			if (isNew && profile.interests.noveltyBias > 0.5) {
				score += w.novelty;
				reasons.push("New and trending");
			}

			return {
				repoFullName: repo.fullName,
				score: Math.min(score, 1),
				reasons,
				agentId: this.config.id,
				generatedAt: new Date().toISOString(),
			};
		});

		return scored.sort((a, b) => b.score - a.score).slice(0, limit);
	}
}
