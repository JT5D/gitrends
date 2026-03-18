/** Event types for cross-module communication via EventBus */

import type { FeedbackSignal, VotableItemType } from "./experiment.ts";
import type { RepoSnapshot, TrendingPeriod, TrendingRepo } from "./repo.ts";

export type EventType =
	| "TRENDING_UPDATE"
	| "REPO_ENRICHED"
	| "CRAWL_STARTED"
	| "CRAWL_COMPLETED"
	| "CRAWL_ERROR"
	| "MODULE_CONNECTED"
	| "MODULE_DISCONNECTED"
	| "MODULE_HEALTH"
	| "AGENT_TASK_STARTED"
	| "AGENT_TASK_COMPLETED"
	| "AGENT_TASK_FAILED"
	| "RECOMMENDATION_READY"
	| "DASH_LAYOUT_CHANGED"
	| "EXPORT_COMPLETED"
	| "CONFIG_CHANGED"
	| "USER_FEEDBACK"
	| "VARIANT_ASSIGNED"
	| "VOTE_CAST";

export interface BaseEvent<T extends EventType = EventType, P = unknown> {
	type: T;
	payload: P;
	source: string;
	timestamp: string;
	id: string;
}

export type TrendingUpdateEvent = BaseEvent<
	"TRENDING_UPDATE",
	{
		repos: RepoSnapshot[];
		period: TrendingPeriod;
		language: string | null;
	}
>;

export type RepoEnrichedEvent = BaseEvent<
	"REPO_ENRICHED",
	{
		fullName: string;
		enrichment: Record<string, unknown>;
	}
>;

export type CrawlStartedEvent = BaseEvent<
	"CRAWL_STARTED",
	{
		source: string;
		language: string | null;
		period: TrendingPeriod;
	}
>;

export type CrawlCompletedEvent = BaseEvent<
	"CRAWL_COMPLETED",
	{
		source: string;
		repoCount: number;
		durationMs: number;
	}
>;

export type CrawlErrorEvent = BaseEvent<
	"CRAWL_ERROR",
	{
		source: string;
		error: string;
		retryCount: number;
	}
>;

export type ModuleConnectedEvent = BaseEvent<
	"MODULE_CONNECTED",
	{
		moduleId: string;
		moduleName: string;
		port: number;
	}
>;

export type ModuleDisconnectedEvent = BaseEvent<
	"MODULE_DISCONNECTED",
	{
		moduleId: string;
		reason: string;
	}
>;

export type ModuleHealthEvent = BaseEvent<
	"MODULE_HEALTH",
	{
		moduleId: string;
		status: "healthy" | "degraded" | "down";
		uptimeMs: number;
	}
>;

export type AgentTaskEvent = BaseEvent<
	"AGENT_TASK_STARTED" | "AGENT_TASK_COMPLETED" | "AGENT_TASK_FAILED",
	{
		agentId: string;
		taskId: string;
		taskType: string;
		result?: unknown;
		error?: string;
	}
>;

export type RecommendationReadyEvent = BaseEvent<
	"RECOMMENDATION_READY",
	{
		userId: string;
		repos: TrendingRepo[];
		score: number;
	}
>;

export type DashLayoutChangedEvent = BaseEvent<
	"DASH_LAYOUT_CHANGED",
	{
		layoutId: string;
		bloxIds: string[];
	}
>;

export type ExportCompletedEvent = BaseEvent<
	"EXPORT_COMPLETED",
	{
		format: "json" | "xrai";
		path: string;
		sizeBytes: number;
	}
>;

export type ConfigChangedEvent = BaseEvent<
	"CONFIG_CHANGED",
	{
		key: string;
		oldValue: unknown;
		newValue: unknown;
	}
>;

export type UserFeedbackEvent = BaseEvent<
	"USER_FEEDBACK",
	{
		signal: FeedbackSignal;
		repoFullName: string;
		userId: string;
		variantId: string | null;
		experimentId: string | null;
	}
>;

export type VariantAssignedEvent = BaseEvent<
	"VARIANT_ASSIGNED",
	{
		userId: string;
		experimentId: string;
		variantId: string;
	}
>;

export type VoteCastEvent = BaseEvent<
	"VOTE_CAST",
	{
		userId: string;
		sessionId: string;
		itemId: string;
		itemType: VotableItemType;
	}
>;

export type GitrendsEvent =
	| TrendingUpdateEvent
	| RepoEnrichedEvent
	| CrawlStartedEvent
	| CrawlCompletedEvent
	| CrawlErrorEvent
	| ModuleConnectedEvent
	| ModuleDisconnectedEvent
	| ModuleHealthEvent
	| AgentTaskEvent
	| RecommendationReadyEvent
	| DashLayoutChangedEvent
	| ExportCompletedEvent
	| ConfigChangedEvent
	| UserFeedbackEvent
	| VariantAssignedEvent
	| VoteCastEvent;

export type EventHandler<T extends GitrendsEvent = GitrendsEvent> = (
	event: T,
) => void | Promise<void>;
