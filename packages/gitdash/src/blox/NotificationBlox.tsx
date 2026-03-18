/** NotificationBlox — tiny headline ticker */

import type { TrendingRepo } from "@gitrends/core";

interface NotificationBloxProps {
	repos: TrendingRepo[];
}

export function NotificationBlox({ repos }: NotificationBloxProps) {
	const items = repos.slice(0, 20).map((r) => ({
		name: r.fullName,
		stars: r.starsToday,
		up: r.starsToday > 0,
	}));

	// Double the items for seamless scrolling
	const doubled = [...items, ...items];

	return (
		<div class="ticker">
			<div class="ticker__content">
				{doubled.map((item, i) => (
					<span
						key={`${item.name}-${i}`}
						class={item.up ? "ticker__item--up" : "ticker__item--down"}
					>
						{item.name} {item.up ? "+" : ""}
						{item.stars}*
					</span>
				))}
			</div>
		</div>
	);
}
