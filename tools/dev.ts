/** Start all modules in dev mode */

import { type ChildProcess, spawn } from "node:child_process";

interface Module {
	name: string;
	pkg: string;
	port: number;
}

const modules: Module[] = [
	{ name: "GitPulse", pkg: "@gitrends/gitpulse", port: 7401 },
	{ name: "GitDash", pkg: "@gitrends/gitdash", port: 7402 },
	{ name: "Swarm", pkg: "@gitrends/swarm", port: 7403 },
];

const children: ChildProcess[] = [];

function startModule(mod: Module): ChildProcess {
	console.log(`[dev] Starting ${mod.name} on port ${mod.port}...`);
	const child = spawn("pnpm", ["--filter", mod.pkg, "dev"], {
		stdio: "pipe",
		env: { ...process.env },
	});

	child.stdout?.on("data", (data: Buffer) => {
		for (const line of data.toString().split("\n").filter(Boolean)) {
			console.log(`[${mod.name}] ${line}`);
		}
	});

	child.stderr?.on("data", (data: Buffer) => {
		for (const line of data.toString().split("\n").filter(Boolean)) {
			console.error(`[${mod.name}] ${line}`);
		}
	});

	child.on("exit", (code) => {
		console.log(`[dev] ${mod.name} exited with code ${code}`);
	});

	return child;
}

// Start all modules
for (const mod of modules) {
	children.push(startModule(mod));
}

// Graceful shutdown
function shutdown() {
	console.log("\n[dev] Shutting down all modules...");
	for (const child of children) {
		child.kill("SIGTERM");
	}
	setTimeout(() => {
		for (const child of children) {
			if (!child.killed) child.kill("SIGKILL");
		}
		process.exit(0);
	}, 3000);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

console.log("[dev] All modules started. Press Ctrl+C to stop.");
