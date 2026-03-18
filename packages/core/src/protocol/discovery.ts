/** Module discovery — health probing + auto-connect */

import type { PeerConfig } from "../types/config.ts";

export interface ModuleInfo {
	name: string;
	version: string;
	port: number;
	startedAt: string;
	capabilities: string[];
}

export interface PeerState {
	config: PeerConfig;
	status: "unknown" | "healthy" | "degraded" | "down";
	lastCheckedAt: string | null;
	lastHealthyAt: string | null;
	info: ModuleInfo | null;
	consecutiveFailures: number;
}

export class ModuleRegistry {
	private peers = new Map<string, PeerState>();
	private selfName: string;
	private selfPort: number;
	private healthInterval: ReturnType<typeof setInterval> | null = null;
	private onPeerChange?: (name: string, state: PeerState) => void;

	constructor(selfName: string, selfPort: number) {
		this.selfName = selfName;
		this.selfPort = selfPort;
	}

	/** Register peers to monitor */
	registerPeers(configs: PeerConfig[]): void {
		for (const config of configs) {
			if (config.name === this.selfName) continue;
			this.peers.set(config.name, {
				config,
				status: "unknown",
				lastCheckedAt: null,
				lastHealthyAt: null,
				info: null,
				consecutiveFailures: 0,
			});
		}
	}

	/** Start periodic health checking */
	startHealthChecks(intervalMs: number, onChange?: (name: string, state: PeerState) => void): void {
		this.onPeerChange = onChange;
		this.checkAllPeers();
		this.healthInterval = setInterval(() => this.checkAllPeers(), intervalMs);
	}

	stopHealthChecks(): void {
		if (this.healthInterval) {
			clearInterval(this.healthInterval);
			this.healthInterval = null;
		}
	}

	private async checkAllPeers(): Promise<void> {
		const checks = [...this.peers.entries()].map(([name, state]) => this.checkPeer(name, state));
		await Promise.allSettled(checks);
	}

	private async checkPeer(name: string, state: PeerState): Promise<void> {
		const url = `http://${state.config.host}:${state.config.port}/health`;
		const now = new Date().toISOString();
		try {
			const resp = await fetch(url, {
				signal: AbortSignal.timeout(3000),
			});
			if (resp.ok) {
				const info = (await resp.json()) as ModuleInfo;
				const prev = state.status;
				state.status = "healthy";
				state.lastCheckedAt = now;
				state.lastHealthyAt = now;
				state.info = info;
				state.consecutiveFailures = 0;
				if (prev !== "healthy") {
					this.onPeerChange?.(name, state);
				}
			} else {
				this.markDegraded(name, state, now);
			}
		} catch {
			state.consecutiveFailures++;
			state.lastCheckedAt = now;
			if (state.consecutiveFailures >= 3) {
				const prev = state.status;
				state.status = "down";
				if (prev !== "down") this.onPeerChange?.(name, state);
			} else {
				this.markDegraded(name, state, now);
			}
		}
	}

	private markDegraded(name: string, state: PeerState, now: string): void {
		const prev = state.status;
		state.status = "degraded";
		state.lastCheckedAt = now;
		state.consecutiveFailures++;
		if (prev !== "degraded") this.onPeerChange?.(name, state);
	}

	getPeer(name: string): PeerState | undefined {
		return this.peers.get(name);
	}

	getHealthyPeers(): PeerState[] {
		return [...this.peers.values()].filter((p) => p.status === "healthy");
	}

	getAllPeers(): Map<string, PeerState> {
		return new Map(this.peers);
	}

	/** Build self health response */
	getSelfHealth(): ModuleInfo {
		return {
			name: this.selfName,
			version: "0.1.0",
			port: this.selfPort,
			startedAt: new Date().toISOString(),
			capabilities: [],
		};
	}
}
