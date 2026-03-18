/** TrendingChart — ECharts line/bar chart for trending data */

import type { TrendingRepo } from "@gitrends/core";
import { useEffect, useRef } from "preact/hooks";

interface TrendingChartProps {
	repos: TrendingRepo[];
	mode?: "bar" | "line";
}

export function TrendingChart({ repos, mode = "bar" }: TrendingChartProps) {
	const chartRef = useRef<HTMLDivElement>(null);
	const chartInstance = useRef<unknown>(null);

	useEffect(() => {
		if (!chartRef.current) return;

		let disposed = false;

		import("echarts").then((echarts) => {
			if (disposed || !chartRef.current) return;

			if (!chartInstance.current) {
				chartInstance.current = echarts.init(chartRef.current, "dark");
			}

			const chart = chartInstance.current as {
				setOption: (opts: unknown) => void;
				resize: () => void;
				dispose: () => void;
			};

			const top = repos.slice(0, 15);
			const option = {
				backgroundColor: "transparent",
				grid: { left: 60, right: 20, top: 20, bottom: 60 },
				tooltip: { trigger: "axis" },
				xAxis: {
					type: "category",
					data: top.map((r) => r.name),
					axisLabel: { rotate: 45, fontSize: 10, color: "#888" },
					axisLine: { lineStyle: { color: "#2a2a2a" } },
				},
				yAxis: {
					type: "value",
					axisLine: { lineStyle: { color: "#2a2a2a" } },
					splitLine: { lineStyle: { color: "#1a1a1a" } },
					axisLabel: { color: "#888" },
				},
				series: [
					{
						name: "Stars",
						type: mode,
						data: top.map((r) => r.stars),
						itemStyle: { color: "#ffcc00" },
						...(mode === "line" ? { smooth: true, areaStyle: { opacity: 0.15 } } : {}),
					},
					{
						name: "Today",
						type: mode,
						data: top.map((r) => r.starsToday),
						itemStyle: { color: "#00cc66" },
						...(mode === "line" ? { smooth: true, areaStyle: { opacity: 0.15 } } : {}),
					},
				],
			};

			chart.setOption(option);

			const resizeObserver = new ResizeObserver(() => chart.resize());
			if (chartRef.current) resizeObserver.observe(chartRef.current);

			return () => {
				resizeObserver.disconnect();
			};
		});

		return () => {
			disposed = true;
		};
	}, [repos, mode]);

	return <div ref={chartRef} style={{ width: "100%", height: "100%" }} />;
}
