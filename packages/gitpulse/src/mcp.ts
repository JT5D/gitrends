/** MCP server — tools for AI agents to access trending data */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import type { RepoDeduplicator } from "./parser/dedup.ts";

export function createMcpServer(dedup: RepoDeduplicator) {
	const server = new Server(
		{ name: "gitpulse", version: "0.1.0" },
		{ capabilities: { tools: {} } },
	);

	server.setRequestHandler(ListToolsRequestSchema, async () => ({
		tools: [
			{
				name: "get_trending",
				description: "Get currently trending GitHub repositories",
				inputSchema: {
					type: "object" as const,
					properties: {
						language: {
							type: "string",
							description: "Filter by programming language",
						},
						limit: {
							type: "number",
							description: "Max number of repos to return (default 25)",
						},
					},
				},
			},
			{
				name: "search_trending",
				description: "Search trending repos by keyword",
				inputSchema: {
					type: "object" as const,
					properties: {
						query: {
							type: "string",
							description: "Search query (matches name, description, topics)",
						},
					},
					required: ["query"],
				},
			},
		],
	}));

	server.setRequestHandler(CallToolRequestSchema, async (request) => {
		const { name, arguments: args } = request.params;

		switch (name) {
			case "get_trending": {
				let repos = dedup.getAll();
				const lang = (args as { language?: string }).language;
				if (lang) {
					repos = repos.filter((r) => r.language?.toLowerCase() === lang.toLowerCase());
				}
				const limit = (args as { limit?: number }).limit ?? 25;
				repos = repos.slice(0, limit);
				return {
					content: [
						{
							type: "text",
							text: JSON.stringify(repos, null, 2),
						},
					],
				};
			}

			case "search_trending": {
				const query = ((args as { query: string }).query ?? "").toLowerCase();
				const repos = dedup.getAll().filter((r) => {
					return (
						r.fullName.toLowerCase().includes(query) ||
						r.description.toLowerCase().includes(query) ||
						r.topics.some((t) => t.toLowerCase().includes(query))
					);
				});
				return {
					content: [
						{
							type: "text",
							text: JSON.stringify(repos.slice(0, 25), null, 2),
						},
					],
				};
			}

			default:
				throw new Error(`Unknown tool: ${name}`);
		}
	});

	return server;
}

export async function startMcpServer(dedup: RepoDeduplicator): Promise<void> {
	const server = createMcpServer(dedup);
	const transport = new StdioServerTransport();
	await server.connect(transport);
}
