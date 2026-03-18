/** ToolSuggester — suggests actions/tools based on context */

import type { TrendingRepo, UserProfile } from "@gitrends/core";
import { type AgentConfig, BaseAgent } from "./base-agent.ts";

interface SuggestInput {
	profile: UserProfile;
	currentView: string;
	repos: TrendingRepo[];
}

export interface ToolSuggestion {
	action: string;
	label: string;
	reason: string;
	confidence: number;
}

export class ToolSuggester extends BaseAgent<SuggestInput, ToolSuggestion[]> {
	constructor(config: AgentConfig) {
		super({ ...config, type: "tool-suggester" });
	}

	protected buildPrompt(input: SuggestInput): string {
		return `User is viewing "${input.currentView}" with ${input.repos.length} repos.
Their interests: ${JSON.stringify(input.profile.interests.topics)}.

Suggest 2-3 helpful actions they could take right now.
Return JSON: [{ "action": "...", "label": "...", "reason": "...", "confidence": 0-1 }]`;
	}

	protected parseOutput(raw: unknown): ToolSuggestion[] {
		return Array.isArray(raw)
			? raw.map((item: ToolSuggestion) => ({
					action: item.action ?? "",
					label: item.label ?? "",
					reason: item.reason ?? "",
					confidence: item.confidence ?? 0.5,
				}))
			: [];
	}

	protected fallbackDefaults(input: SuggestInput): ToolSuggestion[] {
		const suggestions: ToolSuggestion[] = [];

		if (input.repos.length > 0) {
			suggestions.push({
				action: "export",
				label: "Export trending data",
				reason: "Save current trending snapshot for analysis",
				confidence: 0.7,
			});
		}

		if (input.profile.preferredLanguages.length > 0) {
			suggestions.push({
				action: "filter",
				label: `Filter by ${input.profile.preferredLanguages[0]}`,
				reason: "Focus on your preferred language",
				confidence: 0.8,
			});
		}

		suggestions.push({
			action: "refresh",
			label: "Refresh data",
			reason: "Get the latest trending repos",
			confidence: 0.5,
		});

		return suggestions;
	}
}
