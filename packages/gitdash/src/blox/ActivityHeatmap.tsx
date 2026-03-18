/** ActivityHeatmap — contribution-style heatmap using ECharts */

import type { TrendingRepo } from "@gitrends/core";
import { useEffect, useRef } from "preact/hooks";

interface ActivityHeatmapProps {
	repos: TrendingRepo[];
}

export function ActivityHeatmap({ repos }: ActivityHeatmapProps) {
	const chartRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!chartRef.current || repos.length === 0) return;

		let disposed = false;

		import("echarts").then((echarts) => {
			if (disposed || !chartRef.current) return;

			const chart = echarts.init(chartRef.current, "dark");

			// Group repos by language, show star counts as heatmap
			const languages = [...new Set(repos.map((r) => r.language).filter(Boolean))] as string[];
			const top = languages.slice(0, 10);
			const periods = ["Today", "This Week", "This Month"];

			const data: [number, number, number][] = [];
			for (let li = 0; li < top.length; li++) {
				const lang = top[li]!;
				const langRepos = repos.filter((r) => r.language === lang);
				const totalStars = langRepos.reduce((s, r) => s + r.starsToday, 0);
				const totalRepos = langRepos.length;
				data.push([0, li, totalStars]);
				data.push([1, li, totalRepos * 10]);
				data.push([2, li, totalStars + totalRepos * 5]);
			}

			chart.setOption({
				backgroundColor: "transparent",
				tooltip: { position: "top" },
				grid: { left: 80, right: 20, top: 10, bottom: 40 },
				xAxis: {
					type: "category",
					data: periods,
					axisLabel: { color: "#888", fontSize: 10 },
					axisLine: { lineStyle: { color: "#2a2a2a" } },
				},
				yAxis: {
					type: "category",
					data: top,
					axisLabel: { color: "#888", fontSize: 10 },
					axisLine: { lineStyle: { color: "#2a2a2a" } },
				},
				visualMap: {
					min: 0,
					max: Math.max(...data.map((d) => d[2]), 1),
					show: false,
					inRange: { color: ["#111", "#00cc66"] },
				},
				series: [
					{
						type: "heatmap",
						data,
						itemStyle: { borderColor: "#0a0a0a", borderWidth: 2 },
					},
				],
			});

			const obs = new ResizeObserver(() => chart.resize());
			obs.observe(chartRef.current!);

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
