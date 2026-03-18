/** RepoGraph — 3D force-directed graph using ECharts-GL */

import type { TrendingRepo } from "@gitrends/core";
import { useEffect, useRef } from "preact/hooks";

interface RepoGraphProps {
	repos: TrendingRepo[];
}

export function RepoGraph({ repos }: RepoGraphProps) {
	const chartRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!chartRef.current || repos.length === 0) return;

		let disposed = false;

		Promise.all([import("echarts"), import("echarts-gl")]).then(([echarts]) => {
			if (disposed || !chartRef.current) return;

			const chart = echarts.init(chartRef.current, "dark");
			const subset = repos.slice(0, 30);
			const { nodes, edges, categories } = buildGraph(subset);

			chart.setOption({
				backgroundColor: "transparent",
				tooltip: {},
				series: [
					{
						type: "graph",
						layout: "force",
						data: nodes,
						links: edges,
						categories,
						roam: true,
						force: { repulsion: 200, edgeLength: 100 },
						label: {
							show: true,
							position: "right",
							fontSize: 9,
							color: "#888",
							formatter: (p: { data: { name: string } }) =>
								p.data.name.split("/")[1] ?? p.data.name,
						},
						lineStyle: { color: "#333", width: 1, opacity: 0.3 },
					},
				],
			});

			const obs = new ResizeObserver(() => chart.resize());
			if (chartRef.current) obs.observe(chartRef.current);

			return () => {
				obs.disconnect();
				chart.dispose();
			};
		});

		return () => {
			disposed = true;
		};
	}, [repos]);

	return <div ref={chartRef} style={{ width: "100%", height: "100%" }} />;
}

function buildGraph(repos: TrendingRepo[]) {
	const nodes = repos.map((r) => ({
		name: r.fullName,
		value: r.stars,
		symbolSize: Math.max(8, Math.log10(r.stars + 1) * 8),
		category: r.language ?? "Other",
		itemStyle: { color: languageColor(r.language) },
	}));

	const edges: { source: string; target: string }[] = [];
	for (let i = 0; i < repos.length; i++) {
		for (let j = i + 1; j < repos.length; j++) {
			const a = repos[i];
			const b = repos[j];
			if (!a || !b) continue;
			if (a.language && a.language === b.language) {
				edges.push({ source: a.fullName, target: b.fullName });
			}
		}
	}

	const categories = [...new Set(repos.map((r) => r.language ?? "Other"))].map((name) => ({
		name,
	}));
	return { nodes, edges, categories };
}

function languageColor(lang: string | null): string {
	const colors: Record<string, string> = {
		TypeScript: "#3178c6",
		JavaScript: "#f1e05a",
		Python: "#3572A5",
		Rust: "#dea584",
		Go: "#00ADD8",
		Java: "#b07219",
		"C++": "#f34b7d",
		C: "#555555",
		Ruby: "#701516",
		Swift: "#F05138",
	};
	return colors[lang ?? ""] ?? "#666";
}
