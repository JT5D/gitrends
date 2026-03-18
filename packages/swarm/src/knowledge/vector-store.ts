/** In-memory vector store with cosine similarity search */

export interface VectorEntry {
	id: string;
	vector: number[];
	metadata: Record<string, unknown>;
}

export class VectorStore {
	private entries: VectorEntry[] = [];

	add(id: string, vector: number[], metadata: Record<string, unknown> = {}): void {
		const existing = this.entries.findIndex((e) => e.id === id);
		if (existing >= 0) {
			this.entries[existing] = { id, vector, metadata };
		} else {
			this.entries.push({ id, vector, metadata });
		}
	}

	search(query: number[], topK = 10): { entry: VectorEntry; score: number }[] {
		return this.entries
			.map((entry) => ({
				entry,
				score: cosineSimilarity(query, entry.vector),
			}))
			.sort((a, b) => b.score - a.score)
			.slice(0, topK);
	}

	get(id: string): VectorEntry | null {
		return this.entries.find((e) => e.id === id) ?? null;
	}

	remove(id: string): boolean {
		const idx = this.entries.findIndex((e) => e.id === id);
		if (idx >= 0) {
			this.entries.splice(idx, 1);
			return true;
		}
		return false;
	}

	size(): number {
		return this.entries.length;
	}

	clear(): void {
		this.entries = [];
	}
}

function cosineSimilarity(a: number[], b: number[]): number {
	if (a.length !== b.length || a.length === 0) return 0;

	let dotProduct = 0;
	let normA = 0;
	let normB = 0;

	for (let i = 0; i < a.length; i++) {
		const ai = a[i] ?? 0;
		const bi = b[i] ?? 0;
		dotProduct += ai * bi;
		normA += ai * ai;
		normB += bi * bi;
	}

	const denominator = Math.sqrt(normA) * Math.sqrt(normB);
	return denominator === 0 ? 0 : dotProduct / denominator;
}

/** Convert a set of string tags into a sparse vector using a vocabulary */
export function tagsToVector(tags: string[], vocabulary: string[]): number[] {
	return vocabulary.map((word) => (tags.includes(word) ? 1 : 0));
}

/** Build a vocabulary from all tags seen */
export function buildVocabulary(tagSets: string[][]): string[] {
	const all = new Set<string>();
	for (const tags of tagSets) {
		for (const tag of tags) {
			all.add(tag);
		}
	}
	return [...all].sort();
}
