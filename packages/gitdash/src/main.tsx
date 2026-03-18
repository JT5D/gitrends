/** GitDash entry point */

import { render } from "preact";
import { useEffect, useState } from "preact/hooks";
import { DashLayout } from "./dash/DashLayout.tsx";
import { useStore } from "./data/hooks.ts";
import { createStore } from "./data/store.ts";

const gitpulseUrl = import.meta.env.VITE_GITPULSE_URL ?? "/api";
const swarmUrl = import.meta.env.VITE_SWARM_URL ?? "http://localhost:7403";
const store = createStore(gitpulseUrl, swarmUrl);

function App() {
	const { repos, connected } = useStore(store);
	const [, setTick] = useState(0);

	// Re-render when feedback/vote state changes
	useEffect(() => {
		return store.subscribe(() => setTick((t) => t + 1));
	}, []);

	return (
		<DashLayout
			repos={repos}
			events={store.eventLog}
			connected={connected}
			onFeedback={(repoFullName, signal) => store.submitFeedback(repoFullName, signal)}
			feedbackMap={store.userFeedback}
			voteSession={store.voteSession}
			onVote={(sessionId, itemId) => store.castVote(sessionId, itemId)}
			votedItemId={store.votedItemId}
			experimentResults={store.experimentResults}
			variantTag={store.experimentContext?.variantName ?? null}
		/>
	);
}

const root = document.getElementById("app");
if (root) render(<App />, root);
