/** DashOptimizer — suggests dashboard layout improvements based on usage */

import type { DashLayout, UserProfile } from "@gitrends/core";
import { type AgentConfig, BaseAgent } from "./base-agent.ts";

interface OptimizeInput {
	profile: UserProfile;
	currentLayout: DashLayout;
	interactionCounts: Record<string, number>;
}

interface OptimizeOutput {
	suggestions: LayoutSuggestion[];
}

export interface LayoutSuggestion {
	bloxId: string;
	action: "resize" | "move" | "remove" | "add";
	reason: string;
	priority: number;
}

export class DashOptimizer extends BaseAgent<OptimizeInput, OptimizeOutput> {
	constructor(config: AgentConfig) {
		super({ ...config, type: "dash-optimizer" });
	}

	protected buildPrompt(input: OptimizeInput): string {
		const bloxList = input.currentLayout.blox
			.map((b) => `${b.id} (${b.bloxType}, ${b.size})`)
			.join(", ");
		const interactions = JSON.stringify(input.interactionCounts);
		return `Optimize this dashboard layout for a user who prefers ${input.profile.preferredLanguages.join(", ")}.

Current blox: ${bloxList}
Interaction counts: ${interactions}

Return JSON: { "suggestions": [{ "bloxId": "...", "action": "resize|move|remove|add", "reason": "...", "priority": 1-10 }] }`;
	}

	protected parseOutput(raw: unknown): OptimizeOutput {
		const data = raw as { suggestions?: LayoutSuggestion[] };
		return { suggestions: data.suggestions ?? [] };
	}

	protected fallbackDefaults(input: OptimizeInput): OptimizeOutput {
		const suggestions: LayoutSuggestion[] = [];

		// Rule: if a blox has zero interactions, suggest removing it
		for (const blox of input.currentLayout.blox) {
			const interactions = input.interactionCounts[blox.id] ?? 0;
			if (interactions === 0) {
				suggestions.push({
					bloxId: blox.id,
					action: "resize",
					reason: "No interactions detected, consider minimizing",
					priority: 3,
				});
			}
		}

		// Rule: most-used blox should be expanded
		const sorted = Object.entries(input.interactionCounts).sort((a, b) => b[1] - a[1]);
		if (sorted[0]) {
			suggestions.push({
				bloxId: sorted[0][0],
				action: "resize",
				reason: "Most used component, consider expanding",
				priority: 7,
			});
		}

		return { suggestions };
	}
}
