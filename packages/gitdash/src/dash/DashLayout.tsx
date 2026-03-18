/** DashLayout — responsive grid layout for GitBlox */

import type {
	ExperimentResults,
	FeedbackSignal,
	GitrendsEvent,
	TrendingRepo,
	VoteSession,
} from "@gitrends/core";
import { ActivityHeatmap } from "../blox/ActivityHeatmap.tsx";
import { ExperimentPanel } from "../blox/ExperimentPanel.tsx";
import { LiveFeed } from "../blox/LiveFeed.tsx";
import { NotificationBlox } from "../blox/NotificationBlox.tsx";
import { RepoCard } from "../blox/RepoCard.tsx";
import { RepoGraph } from "../blox/RepoGraph.tsx";
import { TrendingChart } from "../blox/TrendingChart.tsx";
import { VotePanel } from "../blox/VotePanel.tsx";

interface DashLayoutProps {
	repos: TrendingRepo[];
	events: GitrendsEvent[];
	connected: boolean;
	onFeedback?: (repoFullName: string, signal: FeedbackSignal) => void;
	feedbackMap?: Map<string, FeedbackSignal>;
	voteSession?: VoteSession | null;
	onVote?: (sessionId: string, itemId: string) => void;
	votedItemId?: string | null;
	experimentResults?: ExperimentResults | null;
	variantTag?: string | null;
}

export function DashLayout({
	repos,
	events,
	connected,
	onFeedback,
	feedbackMap,
	voteSession,
	onVote,
	votedItemId,
	experimentResults,
	variantTag,
}: DashLayoutProps) {
	return (
		<div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
			{/* Header */}
			<div class="header">
				<span class="header__logo">GITDASH</span>
				<span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
					{repos.length} trending repos
				</span>
				<span
					class={`header__status ${connected ? "header__status--connected" : "header__status--disconnected"}`}
				>
					{connected ? "LIVE" : "DISCONNECTED"}
				</span>
			</div>

			{/* Vote Panel */}
			{voteSession && onVote && (
				<div class="blox" style={{ margin: "var(--gap-xs)", flexShrink: 0 }}>
					<div class="blox__header">Vote</div>
					<div class="blox__body" style={{ padding: 0 }}>
						<VotePanel session={voteSession} onVote={onVote} votedItemId={votedItemId ?? null} />
					</div>
				</div>
			)}

			{/* Grid */}
			<div
				class="dash-grid"
				style={{
					gridTemplateColumns: "1fr 1fr 1fr",
					gridTemplateRows: "1fr 1fr 1fr auto",
				}}
			>
				{/* Chart — spans 2 cols */}
				<div class="blox" style={{ gridColumn: "1 / 3" }}>
					<div class="blox__header">Trending Stars</div>
					<div class="blox__body">
						<TrendingChart repos={repos} mode="bar" />
					</div>
				</div>

				{/* Live Feed */}
				<div class="blox blox--live">
					<div class="blox__header">Live Feed</div>
					<div class="blox__body">
						<LiveFeed events={events} />
					</div>
				</div>

				{/* Repo Graph — spans 2 cols */}
				<div class="blox" style={{ gridColumn: "1 / 3" }}>
					<div class="blox__header">Repo Graph</div>
					<div class="blox__body">
						<RepoGraph repos={repos} />
					</div>
				</div>

				{/* Heatmap */}
				<div class="blox">
					<div class="blox__header">Language Activity</div>
					<div class="blox__body">
						<ActivityHeatmap repos={repos} />
					</div>
				</div>

				{/* Repo List — spans full row */}
				<div class="blox" style={{ gridColumn: "1 / -1", maxHeight: "300px" }}>
					<div class="blox__header">Top Trending</div>
					<div class="blox__body">
						{repos.slice(0, 10).map((repo) => (
							<RepoCard
								key={repo.fullName}
								repo={repo}
								onFeedback={onFeedback}
								activeFeedback={feedbackMap?.get(repo.fullName) ?? null}
								variantTag={variantTag}
							/>
						))}
					</div>
				</div>

				{/* Experiment Panel — full row, only shown if results exist */}
				{experimentResults && (
					<div class="blox" style={{ gridColumn: "1 / -1" }}>
						<div class="blox__header">Experiment Results</div>
						<div class="blox__body" style={{ padding: 0 }}>
							<ExperimentPanel
								results={experimentResults}
								repos={repos}
								onFeedback={onFeedback}
								feedbackMap={feedbackMap}
							/>
						</div>
					</div>
				)}
			</div>

			{/* Ticker */}
			<NotificationBlox repos={repos} />
		</div>
	);
}
