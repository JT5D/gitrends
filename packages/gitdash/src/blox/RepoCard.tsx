/** RepoCard — summary card for a trending repo with feedback controls */

import type { FeedbackSignal, TrendingRepo } from "@gitrends/core";

interface RepoCardProps {
	repo: TrendingRepo;
	onFeedback?: (repoFullName: string, signal: FeedbackSignal) => void;
	activeFeedback?: FeedbackSignal | null;
	variantTag?: string | null;
}

function formatNumber(n: number): string {
	if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
	return n.toString();
}

export function RepoCard({ repo, onFeedback, activeFeedback, variantTag }: RepoCardProps) {
	const handleFeedback = (signal: FeedbackSignal, e: Event) => {
		e.preventDefault();
		e.stopPropagation();
		onFeedback?.(repo.fullName, signal);
	};

	const handleClick = () => {
		// Track click as passive signal
		onFeedback?.(repo.fullName, "click");
	};

	const btnClass = (signal: FeedbackSignal) => {
		const base = `repo-card__feedback-btn repo-card__feedback-btn--${signal}`;
		return activeFeedback === signal ? `${base} repo-card__feedback-btn--active` : base;
	};

	return (
		<a
			class="repo-card"
			href={repo.url}
			target="_blank"
			rel="noopener noreferrer"
			onClick={handleClick}
		>
			<div class="repo-card__name">
				{repo.fullName}
				{variantTag && <span class="repo-card__variant">{variantTag}</span>}
			</div>
			{repo.description && (
				<div class="repo-card__desc">
					{repo.description.slice(0, 120)}
					{repo.description.length > 120 ? "..." : ""}
				</div>
			)}
			<div class="repo-card__meta">
				<span class="repo-card__stat repo-card__stat--stars">* {formatNumber(repo.stars)}</span>
				<span class="repo-card__stat repo-card__stat--forks">Y {formatNumber(repo.forks)}</span>
				{repo.starsToday > 0 && (
					<span class="repo-card__stat repo-card__stat--today">
						+{formatNumber(repo.starsToday)} today
					</span>
				)}
				{repo.language && <span class="repo-card__stat">{repo.language}</span>}
			</div>
			{onFeedback && (
				<div class="repo-card__feedback">
					<button
						type="button"
						class={btnClass("like")}
						onClick={(e) => handleFeedback("like", e)}
						title="Like"
					>
						+
					</button>
					<button
						type="button"
						class={btnClass("dislike")}
						onClick={(e) => handleFeedback("dislike", e)}
						title="Dislike"
					>
						-
					</button>
					<button
						type="button"
						class={btnClass("favorite")}
						onClick={(e) => handleFeedback("favorite", e)}
						title="Favorite"
					>
						*
					</button>
					<button
						type="button"
						class={btnClass("hide")}
						onClick={(e) => handleFeedback("hide", e)}
						title="Hide"
					>
						x
					</button>
				</div>
			)}
		</a>
	);
}
