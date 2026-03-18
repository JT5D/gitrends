/** Export format types (JSON and XRAI) */

export interface JsonExportEnvelope<T = unknown> {
	format: "gitrends-json";
	version: string;
	exportedAt: string;
	source: string;
	data: T;
}

export interface XraiExportEnvelope<T = unknown> {
	format: "gitrends-xrai";
	version: string;
	exportedAt: string;
	source: string;
	data: T;
	metadata: XraiMetadata;
}

export interface XraiMetadata {
	ontology: OntologyDefinition;
	relationships: XraiRelationship[];
}

export interface OntologyDefinition {
	entityTypes: EntityTypeDefinition[];
	relationshipTypes: RelationshipTypeDefinition[];
}

export interface EntityTypeDefinition {
	name: string;
	description: string;
	properties: string[];
}

export interface RelationshipTypeDefinition {
	name: string;
	description: string;
	sourceType: string;
	targetType: string;
}

export interface XraiRelationship {
	type: string;
	source: string;
	target: string;
	weight: number;
	properties?: Record<string, unknown>;
}
