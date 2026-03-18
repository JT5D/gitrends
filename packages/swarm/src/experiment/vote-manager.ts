/** VoteManager — layout/viz voting sessions */

import type { EventBus, VotableItem, VoteSession } from "@gitrends/core";

export class VoteManager {
	private sessions: Map<string, VoteSession> = new Map();
	private votes: Map<string, Map<string, string>> = new Map(); // sessionId -> userId -> itemId
	private activeSessionId: string | null = null;
	private bus: EventBus;

	constructor(bus: EventBus) {
		this.bus = bus;
	}

	createSession(items: Omit<VotableItem, "voteCount">[]): VoteSession {
		const id = crypto.randomUUID();
		const session: VoteSession = {
			id,
			items: items.map((item) => ({ ...item, voteCount: 0 })),
			userId: null,
			votedItemId: null,
			timestamp: new Date().toISOString(),
		};

		this.sessions.set(id, session);
		this.votes.set(id, new Map());
		this.activeSessionId = id;
		return session;
	}

	castVote(userId: string, sessionId: string, itemId: string): boolean {
		const session = this.sessions.get(sessionId);
		if (!session) return false;

		const item = session.items.find((i) => i.id === itemId);
		if (!item) return false;

		const sessionVotes = this.votes.get(sessionId);
		if (!sessionVotes) return false;

		// If user already voted, undo previous vote
		const previousVote = sessionVotes.get(userId);
		if (previousVote) {
			const prevItem = session.items.find((i) => i.id === previousVote);
			if (prevItem) prevItem.voteCount--;
		}

		// Record new vote
		sessionVotes.set(userId, itemId);
		item.voteCount++;

		// Emit event
		this.bus.emit(
			this.bus.createEvent(
				"VOTE_CAST",
				{ userId, sessionId, itemId, itemType: item.type },
				"vote-manager",
			),
		);

		return true;
	}

	getResults(sessionId: string): VoteSession | null {
		return this.sessions.get(sessionId) ?? null;
	}

	getActiveSession(): VoteSession | null {
		if (!this.activeSessionId) return null;
		return this.sessions.get(this.activeSessionId) ?? null;
	}
}
