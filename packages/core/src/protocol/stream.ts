/** SSE/WS stream utilities for bridging EventBus over network */

import type { GitrendsEvent } from "../types/events.ts";
import type { EventBus } from "./bus.ts";

export interface StreamSink {
	write(event: GitrendsEvent): void;
	close(): void;
}

/** Create an SSE stream sink that formats events as Server-Sent Events */
export function createSSESink(writer: WritableStreamDefaultWriter<Uint8Array>): StreamSink {
	const encoder = new TextEncoder();
	return {
		write(event: GitrendsEvent) {
			const data = `event: ${event.type}\ndata: ${JSON.stringify(event)}\nid: ${event.id}\n\n`;
			writer.write(encoder.encode(data)).catch(() => {});
		},
		close() {
			writer.close().catch(() => {});
		},
	};
}

/** Bridge EventBus events to a stream sink */
export function bridgeToSink(bus: EventBus, sink: StreamSink): () => void {
	return bus.onAny((event) => {
		sink.write(event);
	});
}

/** Parse SSE text data back into events */
export function parseSSEEvent(data: string): GitrendsEvent | null {
	try {
		const lines = data.split("\n");
		for (const line of lines) {
			if (line.startsWith("data: ")) {
				return JSON.parse(line.slice(6)) as GitrendsEvent;
			}
		}
	} catch {
		// Skip malformed
	}
	return null;
}

/** Connect to a remote SSE endpoint and feed events into local EventBus */
export async function connectSSESource(
	url: string,
	bus: EventBus,
	signal?: AbortSignal,
): Promise<void> {
	const resp = await fetch(url, {
		headers: { Accept: "text/event-stream" },
		signal,
	});

	if (!resp.ok || !resp.body) {
		throw new Error(`SSE connect failed: ${resp.status}`);
	}

	const reader = resp.body.getReader();
	const decoder = new TextDecoder();
	let buffer = "";

	try {
		while (true) {
			const { done, value } = await reader.read();
			if (done) break;

			buffer += decoder.decode(value, { stream: true });
			const parts = buffer.split("\n\n");
			buffer = parts.pop() ?? "";

			for (const part of parts) {
				const event = parseSSEEvent(part);
				if (event) bus.emit(event);
			}
		}
	} finally {
		reader.releaseLock();
	}
}
