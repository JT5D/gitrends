/** Health check utilities */

export interface HealthResponse {
	name: string;
	status: "healthy" | "degraded" | "down";
	version: string;
	uptime: number;
	port: number;
	startedAt: string;
	capabilities: string[];
	peers: PeerHealth[];
}

export interface PeerHealth {
	name: string;
	status: string;
	lastSeen: string | null;
}

const startTime = Date.now();

export function createHealthResponse(
	name: string,
	port: number,
	capabilities: string[],
	peers: PeerHealth[] = [],
): HealthResponse {
	return {
		name,
		status: "healthy",
		version: "0.1.0",
		uptime: Date.now() - startTime,
		port,
		startedAt: new Date(startTime).toISOString(),
		capabilities,
		peers,
	};
}
