/** Byte-position JSONL tailing reader (~120 lines) */

import { open, stat } from "node:fs/promises";

export interface LogReaderOptions {
	/** Path to JSONL file */
	filePath: string;
	/** Polling interval in ms */
	pollIntervalMs?: number;
	/** Start from end of file (tail mode) */
	startFromEnd?: boolean;
}

export interface LogEntry<T = unknown> {
	data: T;
	byteOffset: number;
	lineNumber: number;
}

/**
 * Tails a JSONL file from a byte position, yielding parsed entries.
 * Remembers position across reads for efficient polling.
 */
export class LogReader<T = unknown> {
	private filePath: string;
	private byteOffset = 0;
	private lineNumber = 0;
	private pollIntervalMs: number;
	private running = false;
	private partial = "";

	constructor(opts: LogReaderOptions) {
		this.filePath = opts.filePath;
		this.pollIntervalMs = opts.pollIntervalMs ?? 1000;
		if (opts.startFromEnd) {
			this.seekToEnd().catch(() => {});
		}
	}

	private async seekToEnd(): Promise<void> {
		try {
			const s = await stat(this.filePath);
			this.byteOffset = s.size;
		} catch {
			// File doesn't exist yet, start from 0
		}
	}

	/** Read new entries since last position */
	async readNew(): Promise<LogEntry<T>[]> {
		const entries: LogEntry<T>[] = [];
		let fh;
		try {
			fh = await open(this.filePath, "r");
			const s = await fh.stat();
			if (s.size <= this.byteOffset) return entries;

			const buf = Buffer.alloc(s.size - this.byteOffset);
			await fh.read(buf, 0, buf.length, this.byteOffset);
			this.byteOffset = s.size;

			const text = this.partial + buf.toString("utf-8");
			const lines = text.split("\n");

			// Last element might be partial (no trailing newline)
			this.partial = lines.pop() ?? "";

			for (const line of lines) {
				const trimmed = line.trim();
				if (!trimmed) continue;
				try {
					const data = JSON.parse(trimmed) as T;
					entries.push({
						data,
						byteOffset: this.byteOffset,
						lineNumber: ++this.lineNumber,
					});
				} catch {
					// Skip malformed lines
				}
			}
		} finally {
			await fh?.close();
		}
		return entries;
	}

	/** Start polling for new entries */
	async *poll(signal?: AbortSignal): AsyncGenerator<LogEntry<T>> {
		this.running = true;
		while (this.running && !signal?.aborted) {
			const entries = await this.readNew();
			for (const entry of entries) {
				yield entry;
			}
			if (entries.length === 0) {
				await new Promise((r) => setTimeout(r, this.pollIntervalMs));
			}
		}
	}

	stop(): void {
		this.running = false;
	}

	getOffset(): number {
		return this.byteOffset;
	}

	getLineNumber(): number {
		return this.lineNumber;
	}
}
