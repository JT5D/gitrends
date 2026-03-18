/** CLI export tool — fetch trending data and output as JSON or XRAI */

import { exportJson, exportXrai, serializeJsonExport, serializeXraiExport } from "@gitrends/core";
import type { TrendingRepo } from "@gitrends/core";

const format = process.argv[2] === "--format" ? process.argv[3] : "json";
const gitpulseUrl = process.env.GITPULSE_URL ?? "http://localhost:7401";

async function main() {
	// Fetch current trending data from GitPulse
	let repos: TrendingRepo[];
	try {
		const resp = await fetch(`${gitpulseUrl}/trending`, {
			signal: AbortSignal.timeout(5000),
		});
		if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
		const data = (await resp.json()) as { repos: TrendingRepo[] };
		repos = data.repos;
	} catch (err) {
		console.error(`Failed to fetch from GitPulse (${gitpulseUrl}):`, (err as Error).message);
		console.error("Make sure GitPulse is running: pnpm --filter @gitrends/gitpulse dev");
		process.exit(1);
	}

	if (repos.length === 0) {
		console.error("No trending repos available.");
		process.exit(1);
	}

	switch (format) {
		case "json": {
			const envelope = exportJson(repos, "gitrends-cli");
			console.log(serializeJsonExport(envelope));
			break;
		}
		case "xrai": {
			const envelope = exportXrai(repos, "gitrends-cli");
			console.log(serializeXraiExport(envelope));
			break;
		}
		default:
			console.error(`Unknown format: ${format}. Use: json, xrai`);
			process.exit(1);
	}
}

main().catch((err) => {
	console.error("Export failed:", err);
	process.exit(1);
});
