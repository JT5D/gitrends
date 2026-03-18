/** Node.js Transform stream pipeline for repo processing */

import { Transform, type TransformCallback } from "node:stream";
import type { RepoSnapshot, TrendingRepo } from "@gitrends/core";

/** Transform: raw HTML string → TrendingRepo[] */
export class HtmlParserTransform extends Transform {
	private parser: (html: string) => Promise<TrendingRepo[]>;

	constructor(parser: (html: string) => Promise<TrendingRepo[]>) {
		super({ objectMode: true });
		this.parser = parser;
	}

	async _transform(chunk: string, _encoding: string, callback: TransformCallback): Promise<void> {
		try {
			const repos = await this.parser(chunk);
			for (const repo of repos) {
				this.push(repo);
			}
			callback();
		} catch (err) {
			callback(err as Error);
		}
	}
}

/** Transform: TrendingRepo → RepoSnapshot (add rank + source) */
export class SnapshotTransform extends Transform {
	private rank = 0;
	private source: string;

	constructor(source: string) {
		super({ objectMode: true });
		this.source = source;
	}

	_transform(repo: TrendingRepo, _encoding: string, callback: TransformCallback): void {
		this.rank++;
		const snapshot: RepoSnapshot = {
			repo,
			timestamp: new Date().toISOString(),
			rank: this.rank,
			source: this.source as RepoSnapshot["source"],
		};
		this.push(snapshot);
		callback();
	}
}

/** Transform: deduplicate by fullName */
export class DeduplicateTransform extends Transform {
	private seen = new Set<string>();

	constructor() {
		super({ objectMode: true });
	}

	_transform(snapshot: RepoSnapshot, _encoding: string, callback: TransformCallback): void {
		if (!this.seen.has(snapshot.repo.fullName)) {
			this.seen.add(snapshot.repo.fullName);
			this.push(snapshot);
		}
		callback();
	}
}

/** Writable: output JSONL to stdout */
export class JsonlWritable extends Transform {
	constructor() {
		super({ objectMode: true });
	}

	_transform(obj: unknown, _encoding: string, callback: TransformCallback): void {
		this.push(`${JSON.stringify(obj)}\n`);
		callback();
	}
}
