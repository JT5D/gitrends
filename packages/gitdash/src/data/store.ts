/** Reactive data store with SSE connector */

import type {
	ExperimentResults,
	FeedbackSignal,
	GitrendsEvent,
	RepoSnapshot,
	ScoringWeights,
	TrendingRepo,
	VoteSession,
} from "@gitrends/core";

export interface DashStore {
	repos: TrendingRepo[];
	connected: boolean;
	lastUpdate: string | null;
	eventLog: GitrendsEvent[];
	userFeedback: Map<string, FeedbackSignal>;
	userId: string;
	experimentContext: ExperimentContext | null;
	voteSession: VoteSession | null;
	votedItemId: string | null;
	experimentResults: ExperimentResults | null;
	subscribe: (listener: () => void) => () => void;
	getSnapshot: () => DashStoreSnapshot;
	submitFeedback: (
		repoFullName: string,
		signal: FeedbackSignal,
		experimentId?: string | null,
		variantId?: string | null,
	) => void;
	castVote: (sessionId: string, itemId: string) => void;
	loadVoteSession: () => void;
	loadExperimentResults: (experimentId: string) => void;
}

export interface DashStoreSnapshot {
	repos: TrendingRepo[];
	connected: boolean;
	lastUpdate: string | null;
	eventCount: number;
}

interface ExperimentContext {
	experimentId: string;
	variantId: string;
	variantName: string;
	weights: ScoringWeights;
}

function getOrCreateUserId(): string {
	const stored = localStorage.getItem("gitrends-userId");
	if (stored) return stored;
	const id = crypto.randomUUID();
	localStorage.setItem("gitrends-userId", id);
	return id;
}

function loadFeedbackCache(): Map<string, FeedbackSignal> {
	try {
		const raw = localStorage.getItem("gitrends-feedback");
		if (!raw) return new Map();
		return new Map(Object.entries(JSON.parse(raw)));
	} catch {
		return new Map();
	}
}

function saveFeedbackCache(feedback: Map<string, FeedbackSignal>): void {
	localStorage.setItem("gitrends-feedback", JSON.stringify(Object.fromEntries(feedback)));
}

export function createStore(gitpulseUrl: string, swarmUrl?: string): DashStore {
	let repos: TrendingRepo[] = [];
	let connected = false;
	let lastUpdate: string | null = null;
	const eventLog: GitrendsEvent[] = [];
	const listeners = new Set<() => void>();
	const userFeedback = loadFeedbackCache();
	const userId = getOrCreateUserId();
	const experimentContext: ExperimentContext | null = null;
	let voteSession: VoteSession | null = null;
	let votedItemId: string | null = localStorage.getItem("gitrends-voted") ?? null;
	let experimentResults: ExperimentResults | null = null;

	const swarm = swarmUrl ?? "http://localhost:7403";

	function notify() {
		for (const l of listeners) l();
	}

	// Initial fetch
	fetch(`${gitpulseUrl}/trending`)
		.then((r) => r.json())
		.then((data: { repos: TrendingRepo[] }) => {
			repos = data.repos;
			lastUpdate = new Date().toISOString();
			notify();
		})
		.catch(() => {});

	// SSE connection
	function connect() {
		const eventSource = new EventSource(`${gitpulseUrl}/stream`);

		eventSource.onopen = () => {
			connected = true;
			notify();
		};

		eventSource.onerror = () => {
			connected = false;
			notify();
		};

		eventSource.addEventListener("TRENDING_UPDATE", (e) => {
			try {
				const event = JSON.parse(e.data) as GitrendsEvent & {
					payload: { repos: RepoSnapshot[] };
				};
				repos = event.payload.repos.map((s) => s.repo);
				lastUpdate = event.timestamp;
				eventLog.push(event);
				if (eventLog.length > 100) eventLog.splice(0, eventLog.length - 100);
				notify();
			} catch {}
		});

		eventSource.addEventListener("CRAWL_COMPLETED", (e) => {
			try {
				const event = JSON.parse(e.data) as GitrendsEvent;
				eventLog.push(event);
				notify();
			} catch {}
		});
	}

	connect();

	function submitFeedback(
		repoFullName: string,
		signal: FeedbackSignal,
		experimentId?: string | null,
		variantId?: string | null,
	): void {
		// Toggle: clicking same signal again removes it
		const current = userFeedback.get(repoFullName);
		if (current === signal) {
			userFeedback.delete(repoFullName);
		} else {
			userFeedback.set(repoFullName, signal);
		}
		saveFeedbackCache(userFeedback);
		notify();

		// Send to Swarm
		fetch(`${swarm}/feedback`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				userId,
				repoFullName,
				signal,
				experimentId: experimentId ?? experimentContext?.experimentId,
				variantId: variantId ?? experimentContext?.variantId,
			}),
		}).catch(() => {});
	}

	function castVote(sessionId: string, itemId: string): void {
		votedItemId = itemId;
		localStorage.setItem("gitrends-voted", itemId);
		notify();

		fetch(`${swarm}/vote`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ userId, sessionId, itemId }),
		})
			.then(() => loadVoteSession())
			.catch(() => {});
	}

	function loadVoteSession(): void {
		fetch(`${swarm}/vote/active`)
			.then((r) => r.json())
			.then((data: { session: VoteSession | null }) => {
				voteSession = data.session;
				notify();
			})
			.catch(() => {});
	}

	function loadExperimentResults(experimentId: string): void {
		fetch(`${swarm}/experiments/${experimentId}/results`)
			.then((r) => r.json())
			.then((data: ExperimentResults) => {
				experimentResults = data;
				notify();
			})
			.catch(() => {});
	}

	// Load vote session on startup
	loadVoteSession();

	return {
		get repos() {
			return repos;
		},
		get connected() {
			return connected;
		},
		get lastUpdate() {
			return lastUpdate;
		},
		get eventLog() {
			return eventLog;
		},
		get userFeedback() {
			return userFeedback;
		},
		get userId() {
			return userId;
		},
		get experimentContext() {
			return experimentContext;
		},
		get voteSession() {
			return voteSession;
		},
		get votedItemId() {
			return votedItemId;
		},
		get experimentResults() {
			return experimentResults;
		},
		subscribe(listener: () => void) {
			listeners.add(listener);
			return () => listeners.delete(listener);
		},
		getSnapshot() {
			return { repos, connected, lastUpdate, eventCount: eventLog.length };
		},
		submitFeedback,
		castVote,
		loadVoteSession,
		loadExperimentResults,
	};
}
