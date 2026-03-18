/** Zod schemas for GitPulse config validation */

import { z } from "zod";

export const crawlSourceSchema = z.object({
	type: z.enum(["puppeteer", "github-api", "ossinsight"]),
	enabled: z.boolean().default(true),
	priority: z.number().int().min(1).default(1),
	languages: z.array(z.string()).default([]),
	periods: z.array(z.enum(["daily", "weekly", "monthly"])).default(["daily"]),
});

export const rateLimitSchema = z.object({
	maxRequestsPerMinute: z.number().int().min(1).default(30),
	backoffMultiplier: z.number().min(1).default(2),
	maxBackoffSec: z.number().min(1).default(120),
});

export const gitpulseConfigSchema = z.object({
	port: z.number().int().default(7401),
	crawlIntervalSec: z.number().min(10).default(45),
	sources: z.array(crawlSourceSchema).default([
		{ type: "puppeteer", enabled: true, priority: 1, languages: [], periods: ["daily"] },
		{ type: "ossinsight", enabled: true, priority: 2, languages: [], periods: ["daily"] },
	]),
	rateLimit: rateLimitSchema.default({}),
	githubToken: z.string().nullable().default(null),
});

export type GitPulseConfigParsed = z.infer<typeof gitpulseConfigSchema>;

export function loadConfigFromEnv(): GitPulseConfigParsed {
	return gitpulseConfigSchema.parse({
		port: Number.parseInt(process.env.GITPULSE_PORT ?? "7401", 10),
		crawlIntervalSec: Number.parseInt(process.env.CRAWL_INTERVAL ?? "45", 10),
		githubToken: process.env.GITHUB_TOKEN || null,
	});
}
