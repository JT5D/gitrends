/** MCP server for Swarm agent tools */

import type { TrendingRepo } from "@gitrends/core";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { ProfileLearner } from "./agents/profile-learner.ts";
import { RepoRecommender } from "./agents/repo-recommender.ts";

export function createSwarmMcpServer(agentConfig: {
	id: string;
	type: "repo-recommender";
	llmApiKey: string | null;
	llmBaseUrl: string;
	llmModel: string;
}) {
	const profileLearner = new ProfileLearner(agentConfig);
	const recommender = new RepoRecommender(agentConfig);

	const server = new Server(
		{ name: "gitrends-swarm", version: "0.1.0" },
		{ capabilities: { tools: {} } },
	);

	server.setRequestHandler(ListToolsRequestSchema, async () => ({
		tools: [
			{
				name: "get_profile",
				description: "Get a GitHub user's interest profile for recommendations",
				inputSchema: {
					type: "object" as const,
					properties: {
						username: { type: "string", description: "GitHub username" },
					},
					required: ["username"],
				},
			},
			{
				name: "get_recommendations",
				description: "Get personalized repo recommendations for a user",
				inputSchema: {
					type: "object" as const,
					properties: {
						username: { type: "string", description: "GitHub username" },
						limit: { type: "number", description: "Max recommendations (default 10)" },
					},
					required: ["username"],
				},
			},
		],
	}));

	server.setRequestHandler(CallToolRequestSchema, async (request) => {
		const { name, arguments: args } = request.params;

		switch (name) {
			case "get_profile": {
				const username = (args as { username: string }).username;
				const profile = await profileLearner.enrichFromGitHub(username);
				return {
					content: [{ type: "text", text: JSON.stringify(profile, null, 2) }],
				};
			}

			case "get_recommendations": {
				const username = (args as { username: string }).username;
				const limit = (args as { limit?: number }).limit ?? 10;
				const profile = await profileLearner.enrichFromGitHub(username);

				// Fetch trending repos from GitPulse
				let repos: TrendingRepo[] = [];
				try {
					const resp = await fetch("http://localhost:7401/trending", {
						signal: AbortSignal.timeout(5000),
					});
					if (resp.ok) {
						const data = (await resp.json()) as { repos: TrendingRepo[] };
						repos = data.repos;
					}
				} catch {}

				const recommendations = await recommender.run({ profile, repos, limit });
				return {
					content: [{ type: "text", text: JSON.stringify(recommendations, null, 2) }],
				};
			}

			default:
				throw new Error(`Unknown tool: ${name}`);
		}
	});

	return server;
}

export async function startSwarmMcpServer(agentConfig: {
	id: string;
	type: "repo-recommender";
	llmApiKey: string | null;
	llmBaseUrl: string;
	llmModel: string;
}): Promise<void> {
	const server = createSwarmMcpServer(agentConfig);
	const transport = new StdioServerTransport();
	await server.connect(transport);
}
