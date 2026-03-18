/** ProfileLearner — builds user interest model from GitHub profile */

import type { InterestVector, UserProfile } from "@gitrends/core";
import { type AgentConfig, BaseAgent } from "./base-agent.ts";

interface ProfileInput {
	githubUsername: string;
}

export class ProfileLearner extends BaseAgent<ProfileInput, UserProfile> {
	constructor(config: AgentConfig) {
		super({ ...config, type: "profile-learner" });
	}

	protected buildPrompt(input: ProfileInput): string {
		return `Analyze the GitHub user "${input.githubUsername}" and produce a JSON interest profile.

Return JSON with these fields:
{
  "preferredLanguages": ["lang1", "lang2"],
  "interests": {
    "languages": {"lang": 0.0-1.0},
    "topics": {"topic": 0.0-1.0},
    "starRange": [min, max],
    "noveltyBias": 0.0-1.0
  }
}

Focus on: main languages used, starred repos topics, contribution patterns.`;
	}

	protected parseOutput(raw: unknown): UserProfile {
		const data = raw as {
			preferredLanguages?: string[];
			interests?: Partial<InterestVector>;
		};
		return {
			userId: "",
			githubUsername: "",
			interests: {
				languages: data.interests?.languages ?? {},
				topics: data.interests?.topics ?? {},
				starRange: data.interests?.starRange ?? [0, 100000],
				noveltyBias: data.interests?.noveltyBias ?? 0.5,
			},
			preferredLanguages: data.preferredLanguages ?? [],
			watchedRepos: [],
			lastUpdatedAt: new Date().toISOString(),
		};
	}

	protected fallbackDefaults(input: ProfileInput): UserProfile {
		return {
			userId: input.githubUsername,
			githubUsername: input.githubUsername,
			interests: {
				languages: {},
				topics: {},
				starRange: [100, 50000],
				noveltyBias: 0.5,
			},
			preferredLanguages: [],
			watchedRepos: [],
			lastUpdatedAt: new Date().toISOString(),
		};
	}

	/** Enrich profile with public GitHub data */
	async enrichFromGitHub(username: string): Promise<UserProfile> {
		const profile = await this.run({ githubUsername: username });
		profile.userId = username;
		profile.githubUsername = username;

		// Fetch public repos to build interest vector
		try {
			const resp = await fetch(
				`https://api.github.com/users/${username}/repos?sort=updated&per_page=30`,
				{
					headers: { "User-Agent": "gitrends/0.1" },
					signal: AbortSignal.timeout(5000),
				},
			);
			if (resp.ok) {
				const repos = (await resp.json()) as {
					language: string | null;
					topics: string[];
					stargazers_count: number;
				}[];

				// Build language affinity
				const langCounts = new Map<string, number>();
				for (const repo of repos) {
					if (repo.language) {
						langCounts.set(repo.language, (langCounts.get(repo.language) ?? 0) + 1);
					}
				}
				const maxLang = Math.max(...langCounts.values(), 1);
				for (const [lang, count] of langCounts) {
					profile.interests.languages[lang] = count / maxLang;
				}
				profile.preferredLanguages = [...langCounts.entries()]
					.sort((a, b) => b[1] - a[1])
					.slice(0, 5)
					.map(([l]) => l);

				// Build topic affinity
				const topicCounts = new Map<string, number>();
				for (const repo of repos) {
					for (const topic of repo.topics ?? []) {
						topicCounts.set(topic, (topicCounts.get(topic) ?? 0) + 1);
					}
				}
				const maxTopic = Math.max(...topicCounts.values(), 1);
				for (const [topic, count] of topicCounts) {
					profile.interests.topics[topic] = count / maxTopic;
				}
			}
		} catch {
			// Non-critical, keep defaults
		}

		return profile;
	}
}
