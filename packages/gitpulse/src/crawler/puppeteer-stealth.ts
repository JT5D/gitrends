/** Puppeteer stealth crawler for github.com/trending */

import type { TrendingPeriod } from "@gitrends/core";
import type { RateLimiter } from "./rate-limiter.ts";

export interface CrawlOptions {
	language?: string;
	period: TrendingPeriod;
	rateLimiter: RateLimiter;
}

// biome-ignore lint/suspicious/noExplicitAny: dynamic import of puppeteer-extra has no shipped types
let browserInstance: any = null;

// biome-ignore lint/suspicious/noExplicitAny: puppeteer-extra returns untyped Browser
async function getBrowser(): Promise<any> {
	if (browserInstance) return browserInstance;
	try {
		const puppeteerExtra = await import("puppeteer-extra");
		const stealthPlugin = await import("puppeteer-extra-plugin-stealth");
		// biome-ignore lint/suspicious/noExplicitAny: puppeteer-extra default export is untyped
		const puppeteer = (puppeteerExtra as any).default;
		// biome-ignore lint/suspicious/noExplicitAny: stealth plugin default export is untyped
		puppeteer.use((stealthPlugin as any).default());
		browserInstance = await puppeteer.launch({
			headless: true,
			args: ["--no-sandbox", "--disable-setuid-sandbox"],
		});
		return browserInstance;
	} catch {
		const puppeteer = await import("puppeteer");
		browserInstance = await puppeteer.default.launch({
			headless: true,
			args: ["--no-sandbox", "--disable-setuid-sandbox"],
		});
		return browserInstance;
	}
}

export async function crawlTrending(opts: CrawlOptions): Promise<string> {
	await opts.rateLimiter.acquire();
	const url = buildTrendingUrl(opts.language ?? null, opts.period);
	const browser = await getBrowser();
	const page = await browser.newPage();
	try {
		await page.goto(url, { waitUntil: "networkidle2" });
		return await page.content();
	} finally {
		await page.close();
	}
}

function buildTrendingUrl(language: string | null, period: TrendingPeriod): string {
	const params = new URLSearchParams();
	params.set("since", period);
	const langPath = language ? `/${encodeURIComponent(language)}` : "";
	return `https://github.com/trending${langPath}?${params.toString()}`;
}

export async function closeBrowser(): Promise<void> {
	if (browserInstance) {
		await browserInstance.close();
		browserInstance = null;
	}
}
