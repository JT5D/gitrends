/** Parse GitHub trending HTML page into TrendingRepo objects using cheerio */

import type { TrendingPeriod, TrendingRepo } from "@gitrends/core";
import * as cheerio from "cheerio";

export function parseTrendingPage(html: string, period: TrendingPeriod): TrendingRepo[] {
	const $ = cheerio.load(html);
	const repos: TrendingRepo[] = [];

	$("article.Box-row").each((_i, el) => {
		const $el = $(el);
		const repoLink = $el.find("h2 a").first();
		const href = repoLink.attr("href")?.trim();
		if (!href) return;

		const parts = href.split("/").filter(Boolean);
		const owner = parts[0] ?? "";
		const name = parts[1] ?? "";
		const fullName = `${owner}/${name}`;

		const description = $el.find("p.col-9").text().trim();
		const language = $el.find("[itemprop='programmingLanguage']").text().trim() || null;

		const starsText = $el.find("a[href$='/stargazers']").text().trim().replace(/,/g, "");
		const forksText = $el.find("a[href$='/forks']").text().trim().replace(/,/g, "");
		const todayText = $el.find("span.d-inline-block.float-sm-right").text().trim();

		const starsToday = Number.parseInt(todayText.replace(/[^0-9]/g, ""), 10) || 0;

		const builtBy: { username: string; avatarUrl: string }[] = [];
		$el.find("span.d-inline-block a img").each((_j, img) => {
			const $img = $(img);
			const src = $img.attr("src") ?? "";
			const alt = $img.attr("alt") ?? "";
			const username = alt.replace("@", "");
			if (username) builtBy.push({ username, avatarUrl: src });
		});

		repos.push({
			fullName,
			owner,
			name,
			description,
			language,
			stars: Number.parseInt(starsText, 10) || 0,
			starsToday,
			forks: Number.parseInt(forksText, 10) || 0,
			openIssues: 0,
			builtBy,
			url: `https://github.com/${fullName}`,
			firstSeenAt: new Date().toISOString(),
			lastSeenAt: new Date().toISOString(),
			trendingPeriod: period,
			topics: [],
			license: null,
			archived: false,
		});
	});

	return repos;
}
