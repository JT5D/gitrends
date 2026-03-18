/** Swarm Hono REST API server */

import {
	EventBus,
	type FeedbackSignal,
	ModuleRegistry,
	type ScoringWeights,
	type TrendingRepo,
	createHealthResponse,
	defaultConfig,
} from "@gitrends/core";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { AutoFixer } from "./agents/auto-fixer.ts";
import { ProfileLearner } from "./agents/profile-learner.ts";
import { RepoRecommender } from "./agents/repo-recommender.ts";
import { ExperimentEngine } from "./experiment/experiment-engine.ts";
import { PreferenceStore } from "./experiment/preference-store.ts";
import { VoteManager } from "./experiment/vote-manager.ts";
import { LearningLoop } from "./orchestrator/learning-loop.ts";

const config = defaultConfig();
const port = Number.parseInt(process.env.SWARM_PORT ?? "7403", 10);
const llmApiKey = process.env.LLM_API_KEY ?? null;
const llmBaseUrl = process.env.LLM_BASE_URL ?? "https://api.anthropic.com";
const llmModel = process.env.LLM_MODEL ?? "claude-sonnet-4-20250514";

const bus = new EventBus();
const registry = new ModuleRegistry("swarm", port);
registry.registerPeers(config.modules.peers);

const agentConfig = {
	id: "swarm-main",
	type: "repo-recommender" as const,
	llmApiKey,
	llmBaseUrl,
	llmModel,
};

const profileLearner = new ProfileLearner(agentConfig);
const recommender = new RepoRecommender(agentConfig);
const autoFixer = new AutoFixer(bus);
autoFixer.start();

const experimentEngine = new ExperimentEngine(bus);
const preferenceStore = new PreferenceStore();
const voteManager = new VoteManager(bus);

// Shared repo cache for preference learning
let cachedRepos: TrendingRepo[] = [];

const learningLoop = new LearningLoop({
	intervalSec: Number.parseInt(process.env.LEARNING_LOOP_INTERVAL ?? "300", 10),
	bus,
	experimentEngine,
	preferenceStore,
	getRepos: () => cachedRepos,
	onAdjust: (metrics) => {
		console.log("[Swarm] Metrics adjusted:", metrics);
	},
});
learningLoop.start();

// Fetch trending repos from GitPulse
async function fetchTrendingRepos(): Promise<TrendingRepo[]> {
	try {
		const resp = await fetch(`http://localhost:${config.gitpulse.port}/trending`, {
			signal: AbortSignal.timeout(5000),
		});
		if (!resp.ok) return cachedRepos;
		const data = (await resp.json()) as { repos: TrendingRepo[] };
		cachedRepos = data.repos;
		return data.repos;
	} catch {
		return cachedRepos;
	}
}

const app = new Hono();
app.use("/*", cors());

app.get("/health", (c) => {
	return c.json(createHealthResponse("swarm", port, ["recommend", "profile", "auto-fix"]));
});

app.get("/recommend", async (c) => {
	const username = c.req.query("user") ?? "anonymous";
	const limit = Number.parseInt(c.req.query("limit") ?? "10", 10);

	// Build profile
	const profile = await profileLearner.enrichFromGitHub(username);

	// Get trending repos
	const repos = await fetchTrendingRepos();
	if (repos.length === 0) {
		return c.json({ error: "No trending data available. Is GitPulse running?" }, 503);
	}

	// Get experiment-aware weights
	const weights = experimentEngine.getWeightsForUser(username);
	const activeVariant = experimentEngine.getActiveVariantForUser(username);

	// Get user preferences for hidden repos
	const prefs = preferenceStore.getPreferences(username);

	// Generate recommendations
	const recommendations = await recommender.run({
		profile,
		repos,
		limit,
		weights,
		hiddenRepos: prefs.hiddenRepos,
	});

	return c.json({
		user: username,
		profile: {
			preferredLanguages: profile.preferredLanguages,
			topTopics: Object.entries(profile.interests.topics)
				.sort((a, b) => b[1] - a[1])
				.slice(0, 5)
				.map(([t]) => t),
		},
		recommendations,
		weights,
		experiment: activeVariant
			? {
					experimentId: activeVariant.experimentId,
					variantId: activeVariant.variant.id,
					variantName: activeVariant.variant.name,
				}
			: null,
	});
});

app.get("/profile/:username", async (c) => {
	const username = c.req.param("username");
	const profile = await profileLearner.enrichFromGitHub(username);
	return c.json(profile);
});

app.get("/agents", (c) => {
	return c.json({
		agents: [profileLearner.getInfo(), recommender.getInfo()],
		learningLoop: learningLoop.getState(),
		autoFixer: {
			actions: autoFixer.getActions().slice(-10),
			errorCounts: Object.fromEntries(autoFixer.getErrorCounts()),
		},
	});
});

app.get("/metrics", (c) => {
	return c.json(learningLoop.getState());
});

// --- Feedback ---

app.post("/feedback", async (c) => {
	const body = (await c.req.json()) as {
		userId: string;
		repoFullName: string;
		signal: FeedbackSignal;
		experimentId?: string;
		variantId?: string;
	};

	const { userId, repoFullName, signal, experimentId, variantId } = body;
	if (!userId || !repoFullName || !signal) {
		return c.json({ error: "userId, repoFullName, and signal are required" }, 400);
	}

	// Record in experiment engine
	experimentEngine.recordFeedback(
		userId,
		repoFullName,
		signal,
		experimentId ?? null,
		variantId ?? null,
	);

	// Update user preferences
	preferenceStore.applyFeedback(userId, repoFullName, signal);

	return c.json({ ok: true });
});

// --- Experiments ---

app.get("/experiments", (c) => {
	return c.json({ experiments: experimentEngine.getExperiments() });
});

app.post("/experiments", async (c) => {
	const body = (await c.req.json()) as {
		name: string;
		description: string;
		variants: Array<{ name: string; weights: ScoringWeights }>;
	};

	if (!body.name || !body.variants?.length) {
		return c.json({ error: "name and variants are required" }, 400);
	}

	const experiment = experimentEngine.createExperiment(body.name, body.description, body.variants);
	return c.json(experiment, 201);
});

app.post("/experiments/:id/start", (c) => {
	const id = c.req.param("id");
	const experiment = experimentEngine.startExperiment(id);
	if (!experiment) return c.json({ error: "Experiment not found or not in draft" }, 404);
	return c.json(experiment);
});

app.get("/experiments/:id/results", (c) => {
	const id = c.req.param("id");
	const results = experimentEngine.getResults(id);
	if (!results) return c.json({ error: "Experiment not found" }, 404);
	return c.json(results);
});

// --- Preferences ---

app.get("/preferences/:userId", (c) => {
	const userId = c.req.param("userId");
	return c.json(preferenceStore.getPreferences(userId));
});

// --- Voting ---

app.post("/vote/session", async (c) => {
	const body = (await c.req.json()) as {
		items: Array<{
			id: string;
			type: "layout" | "theme" | "visualization";
			name: string;
			description: string;
		}>;
	};

	if (!body.items?.length) {
		return c.json({ error: "items are required" }, 400);
	}

	const session = voteManager.createSession(body.items);
	return c.json(session, 201);
});

app.post("/vote", async (c) => {
	const body = (await c.req.json()) as {
		userId: string;
		sessionId: string;
		itemId: string;
	};

	if (!body.userId || !body.sessionId || !body.itemId) {
		return c.json({ error: "userId, sessionId, and itemId are required" }, 400);
	}

	const ok = voteManager.castVote(body.userId, body.sessionId, body.itemId);
	if (!ok) return c.json({ error: "Session or item not found" }, 404);
	return c.json({ ok: true });
});

app.get("/vote/active", (c) => {
	const session = voteManager.getActiveSession();
	if (!session) return c.json({ session: null });
	return c.json({ session });
});

// Start
registry.startHealthChecks(config.modules.healthCheckIntervalMs, (name, state) => {
	console.log(`[Swarm/Discovery] ${name}: ${state.status}`);
});

console.log(`[Swarm] Starting on port ${port}`);
serve({ fetch: app.fetch, port });
