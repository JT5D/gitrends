/** XRAI export — JSON + ontology metadata for 3D/spatial consumption */

import type { OntologyDefinition, XraiExportEnvelope, XraiRelationship } from "../types/export.ts";
import type { TrendingRepo } from "../types/repo.ts";

const GITRENDS_ONTOLOGY: OntologyDefinition = {
	entityTypes: [
		{
			name: "Repository",
			description: "A GitHub repository",
			properties: ["fullName", "owner", "name", "language", "stars", "forks", "description"],
		},
		{
			name: "Developer",
			description: "A GitHub user or organization",
			properties: ["username", "avatarUrl"],
		},
		{
			name: "Language",
			description: "A programming language",
			properties: ["name"],
		},
		{
			name: "Topic",
			description: "A repository topic/tag",
			properties: ["name"],
		},
	],
	relationshipTypes: [
		{
			name: "OWNED_BY",
			description: "Repository owned by developer",
			sourceType: "Repository",
			targetType: "Developer",
		},
		{
			name: "WRITTEN_IN",
			description: "Repository uses language",
			sourceType: "Repository",
			targetType: "Language",
		},
		{
			name: "TAGGED_WITH",
			description: "Repository tagged with topic",
			sourceType: "Repository",
			targetType: "Topic",
		},
		{
			name: "CONTRIBUTED_BY",
			description: "Repository built by developer",
			sourceType: "Repository",
			targetType: "Developer",
		},
		{
			name: "SIMILAR_TO",
			description: "Repos sharing language/topics",
			sourceType: "Repository",
			targetType: "Repository",
		},
	],
};

export function exportXrai(
	repos: TrendingRepo[],
	source: string,
): XraiExportEnvelope<TrendingRepo[]> {
	const relationships = buildRelationships(repos);
	return {
		format: "gitrends-xrai",
		version: "0.1.0",
		exportedAt: new Date().toISOString(),
		source,
		data: repos,
		metadata: {
			ontology: GITRENDS_ONTOLOGY,
			relationships,
		},
	};
}

function buildRelationships(repos: TrendingRepo[]): XraiRelationship[] {
	const rels: XraiRelationship[] = [];

	for (const repo of repos) {
		// OWNED_BY
		rels.push({
			type: "OWNED_BY",
			source: repo.fullName,
			target: repo.owner,
			weight: 1.0,
		});

		// WRITTEN_IN
		if (repo.language) {
			rels.push({
				type: "WRITTEN_IN",
				source: repo.fullName,
				target: repo.language,
				weight: 1.0,
			});
		}

		// TAGGED_WITH
		for (const topic of repo.topics) {
			rels.push({
				type: "TAGGED_WITH",
				source: repo.fullName,
				target: topic,
				weight: 0.8,
			});
		}

		// CONTRIBUTED_BY
		for (const contributor of repo.builtBy) {
			rels.push({
				type: "CONTRIBUTED_BY",
				source: repo.fullName,
				target: contributor.username,
				weight: 0.6,
			});
		}
	}

	// SIMILAR_TO (shared language)
	for (let i = 0; i < repos.length; i++) {
		for (let j = i + 1; j < repos.length; j++) {
			const a = repos[i]!;
			const b = repos[j]!;
			if (a.language && a.language === b.language) {
				const sharedTopics = a.topics.filter((t) => b.topics.includes(t));
				const weight = 0.3 + sharedTopics.length * 0.15;
				rels.push({
					type: "SIMILAR_TO",
					source: a.fullName,
					target: b.fullName,
					weight: Math.min(weight, 1.0),
				});
			}
		}
	}

	return rels;
}

export function serializeXraiExport(envelope: XraiExportEnvelope): string {
	return JSON.stringify(envelope, null, 2);
}
