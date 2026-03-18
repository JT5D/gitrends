/** VotePanel — voting UI for layouts/themes/visualizations */

import type { VoteSession } from "@gitrends/core";

interface VotePanelProps {
	session: VoteSession | null;
	onVote: (sessionId: string, itemId: string) => void;
	votedItemId: string | null;
}

export function VotePanel({ session, onVote, votedItemId }: VotePanelProps) {
	if (!session) return null;

	const maxVotes = Math.max(...session.items.map((i) => i.voteCount), 0);

	return (
		<div class="vote-panel">
			{session.items.map((item) => {
				const isWinner = item.voteCount > 0 && item.voteCount === maxVotes;
				const isVoted = votedItemId === item.id;
				let cls = "vote-panel__item";
				if (isWinner) cls += " vote-panel__item--winner";
				if (isVoted) cls += " vote-panel__item--voted";

				return (
					<div key={item.id} class={cls}>
						<div class="vote-panel__name">{item.name}</div>
						<div class="vote-panel__desc">{item.description}</div>
						<div class="vote-panel__count">
							{item.voteCount} vote{item.voteCount !== 1 ? "s" : ""}
						</div>
						<button
							type="button"
							class="vote-panel__btn"
							disabled={isVoted}
							onClick={() => onVote(session.id, item.id)}
						>
							{isVoted ? "Voted" : "Vote"}
						</button>
					</div>
				);
			})}
		</div>
	);
}
