/** ExperimentPanel — side-by-side A/B experiment comparison */

import type {
	ExperimentResults,
	FeedbackSignal,
	TrendingRepo,
	VariantResult,
} from "@gitrends/core";
import { RepoCard } from "./RepoCard.tsx";

interface ExperimentPanelProps {
	results: ExperimentResults | null;
	repos: TrendingRepo[];
	onFeedback?: (repoFullName: string, signal: FeedbackSignal) => void;
	feedbackMap?: Map<string, FeedbackSignal>;
}

function VariantColumn({
	variant,
	isWinner,
	repos,
	onFeedback,
	feedbackMap,
}: {
	variant: VariantResult;
	isWinner: boolean;
	repos: TrendingRepo[];
	onFeedback?: (repoFullName: string, signal: FeedbackSignal) => void;
	feedbackMap?: Map<string, FeedbackSignal>;
}) {
	return (
		<div class={`experiment-panel__variant${isWinner ? " experiment-panel__variant--winner" : ""}`}>
			<div class="experiment-panel__variant-name">
				{variant.variantName}
				{isWinner && <span class="experiment-panel__winner-badge">WINNER</span>}
			</div>
			<div class="experiment-panel__accept-rate">{(variant.acceptRate * 100).toFixed(1)}%</div>
			<div class="experiment-panel__stats">
				{variant.totalSignals} signals | +{variant.feedbackCounts.like} -
				{variant.feedbackCounts.dislike} *{variant.feedbackCounts.favorite}
			</div>
			{repos.slice(0, 3).map((repo) => (
				<RepoCard
					key={repo.fullName}
					repo={repo}
					onFeedback={onFeedback}
					activeFeedback={feedbackMap?.get(repo.fullName) ?? null}
				/>
			))}
		</div>
	);
}

export function ExperimentPanel({ results, repos, onFeedback, feedbackMap }: ExperimentPanelProps) {
	if (!results || results.variants.length === 0) return null;

	return (
		<div class="experiment-panel">
			{results.variants.map((variant) => (
				<VariantColumn
					key={variant.variantId}
					variant={variant}
					isWinner={variant.variantId === results.winnerId}
					repos={repos}
					onFeedback={onFeedback}
					feedbackMap={feedbackMap}
				/>
			))}
		</div>
	);
}
