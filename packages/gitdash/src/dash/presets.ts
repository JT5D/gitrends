/** Dashboard layout presets */

import type { DashPreset } from "@gitrends/core";

export const presets: DashPreset[] = [
	{
		id: "overview",
		name: "Overview",
		description: "Default overview with charts, graph, feed, and repo list",
		layout: {
			id: "overview-layout",
			name: "Overview",
			description: "3-column responsive grid",
			blox: [
				{
					id: "trending-chart",
					bloxType: "TrendingChart",
					size: "expanded",
					position: { col: 0, row: 0, colSpan: 2, rowSpan: 1 },
					config: { mode: "bar" },
				},
				{
					id: "live-feed",
					bloxType: "LiveFeed",
					size: "standard",
					position: { col: 2, row: 0, colSpan: 1, rowSpan: 1 },
					config: {},
				},
				{
					id: "repo-graph",
					bloxType: "RepoGraph",
					size: "expanded",
					position: { col: 0, row: 1, colSpan: 2, rowSpan: 1 },
					config: {},
				},
				{
					id: "heatmap",
					bloxType: "ActivityHeatmap",
					size: "standard",
					position: { col: 2, row: 1, colSpan: 1, rowSpan: 1 },
					config: {},
				},
				{
					id: "repo-list",
					bloxType: "RepoCard",
					size: "standard",
					position: { col: 0, row: 2, colSpan: 3, rowSpan: 1 },
					config: { limit: 10 },
				},
			],
			columns: 3,
			rowHeight: 250,
			gap: 8,
		},
	},
	{
		id: "compact",
		name: "Compact",
		description: "Minimal view with chart and repo list only",
		layout: {
			id: "compact-layout",
			name: "Compact",
			description: "2-column compact grid",
			blox: [
				{
					id: "trending-chart",
					bloxType: "TrendingChart",
					size: "standard",
					position: { col: 0, row: 0, colSpan: 2, rowSpan: 1 },
					config: { mode: "line" },
				},
				{
					id: "repo-list",
					bloxType: "RepoCard",
					size: "standard",
					position: { col: 0, row: 1, colSpan: 2, rowSpan: 1 },
					config: { limit: 20 },
				},
			],
			columns: 2,
			rowHeight: 300,
			gap: 8,
		},
	},
	{
		id: "hud",
		name: "HUD",
		description: "Ultra-dense 4-column layout with maximum data density and scanline overlay",
		layout: {
			id: "hud-layout",
			name: "HUD",
			description: "4-column ultra-dense grid",
			blox: [
				{
					id: "trending-chart",
					bloxType: "TrendingChart",
					size: "standard",
					position: { col: 0, row: 0, colSpan: 2, rowSpan: 1 },
					config: { mode: "bar" },
				},
				{
					id: "live-feed",
					bloxType: "LiveFeed",
					size: "standard",
					position: { col: 2, row: 0, colSpan: 1, rowSpan: 1 },
					config: {},
				},
				{
					id: "heatmap",
					bloxType: "ActivityHeatmap",
					size: "standard",
					position: { col: 3, row: 0, colSpan: 1, rowSpan: 1 },
					config: {},
				},
				{
					id: "repo-graph",
					bloxType: "RepoGraph",
					size: "standard",
					position: { col: 0, row: 1, colSpan: 2, rowSpan: 1 },
					config: {},
				},
				{
					id: "repo-list",
					bloxType: "RepoCard",
					size: "standard",
					position: { col: 2, row: 1, colSpan: 2, rowSpan: 1 },
					config: { limit: 20 },
				},
			],
			columns: 4,
			rowHeight: 200,
			gap: 4,
		},
	},
];
