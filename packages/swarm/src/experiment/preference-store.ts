/** PreferenceStore — user preference tracking + weight learning */

import type { FeedbackSignal, ScoringWeights, TrendingRepo, UserPreferences } from "@gitrends/core";
import { DEFAULT_WEIGHTS } from "@gitrends/core";

export class PreferenceStore {
	private preferences: Map<string, UserPreferences> = new Map();

	getPreferences(userId: string): UserPreferences {
		if (!this.preferences.has(userId)) {
			this.preferences.set(userId, {
				userId,
				likedRepos: [],
				dislikedRepos: [],
				favoritedRepos: [],
				hiddenRepos: [],
				learnedWeights: { ...DEFAULT_WEIGHTS },
			});
		}
		// biome-ignore lint/style/noNonNullAssertion: guaranteed set above
		return this.preferences.get(userId)!;
	}

	applyFeedback(userId: string, repoFullName: string, signal: FeedbackSignal): void {
		const prefs = this.getPreferences(userId);

		// Remove from all lists first to handle toggles
		const lists = [prefs.likedRepos, prefs.dislikedRepos, prefs.favoritedRepos, prefs.hiddenRepos];
		for (const list of lists) {
			const idx = list.indexOf(repoFullName);
			if (idx !== -1) list.splice(idx, 1);
		}

		// Add to appropriate list
		switch (signal) {
			case "like":
				prefs.likedRepos.push(repoFullName);
				break;
			case "dislike":
				prefs.dislikedRepos.push(repoFullName);
				break;
			case "favorite":
				prefs.favoritedRepos.push(repoFullName);
				break;
			case "hide":
				prefs.hiddenRepos.push(repoFullName);
				break;
			// "click" is passive — no list update
		}
	}

	learnWeights(userId: string, repoLookup: Map<string, TrendingRepo>): ScoringWeights {
		const prefs = this.getPreferences(userId);
		const liked = [...prefs.likedRepos, ...prefs.favoritedRepos];
		if (liked.length < 3) return prefs.learnedWeights;

		const likedRepos = liked
			.map((name) => repoLookup.get(name))
			.filter((r): r is TrendingRepo => r != null);

		if (likedRepos.length < 3) return prefs.learnedWeights;

		const weights: ScoringWeights = { ...DEFAULT_WEIGHTS };

		// If 70%+ liked repos share a language, boost language weight
		const langCounts: Record<string, number> = {};
		for (const r of likedRepos) {
			if (r.language) langCounts[r.language] = (langCounts[r.language] ?? 0) + 1;
		}
		const topLangCount = Math.max(...Object.values(langCounts), 0);
		if (topLangCount / likedRepos.length >= 0.7) {
			weights.language = 0.55;
		}

		// If 70%+ liked repos have topics, boost topic weight
		const withTopics = likedRepos.filter((r) => r.topics.length > 0).length;
		if (withTopics / likedRepos.length >= 0.7) {
			weights.topic = 0.4;
		}

		// If 50%+ liked repos are high-star (>10k), boost stars weight
		const highStar = likedRepos.filter((r) => r.stars > 10000).length;
		if (highStar / likedRepos.length >= 0.5) {
			weights.stars = 0.25;
		}

		// Normalize weights to sum to 1.0
		const sum =
			weights.language + weights.topic + weights.stars + weights.momentum + weights.novelty;
		weights.language /= sum;
		weights.topic /= sum;
		weights.stars /= sum;
		weights.momentum /= sum;
		weights.novelty /= sum;

		prefs.learnedWeights = weights;
		return weights;
	}

	getUsersWithFeedback(): string[] {
		return Array.from(this.preferences.keys()).filter((userId) => {
			const prefs = this.preferences.get(userId);
			if (!prefs) return false;
			return (
				prefs.likedRepos.length > 0 ||
				prefs.dislikedRepos.length > 0 ||
				prefs.favoritedRepos.length > 0
			);
		});
	}
}
