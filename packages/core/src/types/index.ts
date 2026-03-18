export type {
	TrendingRepo,
	ContributorRef,
	TrendingPeriod,
	RepoSnapshot,
	DataSource,
	RepoEnrichment,
	RepoWithEnrichment,
} from "./repo.ts";

export type {
	EventType,
	BaseEvent,
	TrendingUpdateEvent,
	RepoEnrichedEvent,
	CrawlStartedEvent,
	CrawlCompletedEvent,
	CrawlErrorEvent,
	ModuleConnectedEvent,
	ModuleDisconnectedEvent,
	ModuleHealthEvent,
	AgentTaskEvent,
	RecommendationReadyEvent,
	DashLayoutChangedEvent,
	ExportCompletedEvent,
	ConfigChangedEvent,
	UserFeedbackEvent,
	VariantAssignedEvent,
	VoteCastEvent,
	GitrendsEvent,
	EventHandler,
} from "./events.ts";

export type {
	FeedbackSignal,
	UserFeedback,
	ScoringWeights,
	ExperimentVariant,
	ExperimentStatus,
	Experiment,
	VariantResult,
	ExperimentResults,
	UserPreferences,
	VotableItemType,
	VotableItem,
	VoteSession,
} from "./experiment.ts";
export { DEFAULT_WEIGHTS } from "./experiment.ts";

export type {
	GitrendsConfig,
	GitPulseConfig,
	CrawlSourceConfig,
	RateLimitConfig,
	GitDashConfig,
	SwarmConfig,
	ModuleDiscoveryConfig,
	PeerConfig,
} from "./config.ts";
export { defaultConfig } from "./config.ts";

export type {
	DisplaySize,
	BloxMeta,
	BloxCategory,
	BloxInstance,
	GridPosition,
	DashLayout,
	DashPreset,
	DashSharePayload,
} from "./dashboard.ts";

export type {
	AgentType,
	AgentStatus,
	AgentInfo,
	AgentTask,
	UserProfile,
	InterestVector,
	Recommendation,
	LearningLoopState,
	LearningMetrics,
} from "./agent.ts";

export type {
	JsonExportEnvelope,
	XraiExportEnvelope,
	XraiMetadata,
	OntologyDefinition,
	EntityTypeDefinition,
	RelationshipTypeDefinition,
	XraiRelationship,
} from "./export.ts";
