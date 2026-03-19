/** GitDash entry point */

import { render } from "preact";
import { useEffect, useState } from "preact/hooks";
import { StrategicIntel } from "./blox/StrategicIntel.tsx";
import { DashLayout } from "./dash/DashLayout.tsx";
import { useStore } from "./data/hooks.ts";
import { createStore } from "./data/store.ts";

const gitpulseUrl = import.meta.env.VITE_GITPULSE_URL ?? "/api";
const swarmUrl = import.meta.env.VITE_SWARM_URL ?? "http://localhost:7403";
const store = createStore(gitpulseUrl, swarmUrl);

type View = "dashboard" | "intel";

function App() {
	const { repos, connected } = useStore(store);
	const [, setTick] = useState(0);
	const [view, setView] = useState<View>("dashboard");

	// Re-render when feedback/vote state changes
	useEffect(() => {
		return store.subscribe(() => setTick((t) => t + 1));
	}, []);

	return (
		<div>
			{/* Nav */}
			<div
				style={{
					display: "flex",
					gap: 4,
					padding: "8px 16px",
					borderBottom: "0.5px solid var(--color-border-tertiary)",
					background: "var(--color-background-primary)",
				}}
			>
				{(["dashboard", "intel"] as View[]).map((v) => (
					<button
						key={v}
						type="button"
						onClick={() => setView(v)}
						style={{
							padding: "4px 12px",
							fontSize: 12,
							cursor: "pointer",
							border: "none",
							borderRadius: "var(--border-radius-md)",
							fontWeight: view === v ? 500 : 400,
							background: view === v ? "var(--color-background-secondary)" : "transparent",
							color: view === v ? "var(--color-text-primary)" : "var(--color-text-secondary)",
						}}
					>
						{v === "dashboard" ? "Trending" : "Strategic Intel"}
					</button>
				))}
			</div>

			{view === "dashboard" ? (
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
			) : (
				<div style={{ padding: "0 16px", maxWidth: 900, margin: "0 auto" }}>
					<StrategicIntel />
				</div>
			)}
		</div>
	);
}

const root = document.getElementById("app");
if (root) render(<App />, root);
