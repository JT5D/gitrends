/** JSON export — wraps data in standardized envelope */

import type { JsonExportEnvelope } from "../types/export.ts";

export function exportJson<T>(data: T, source: string): JsonExportEnvelope<T> {
	return {
		format: "gitrends-json",
		version: "0.1.0",
		exportedAt: new Date().toISOString(),
		source,
		data,
	};
}

export function serializeJsonExport<T>(envelope: JsonExportEnvelope<T>): string {
	return JSON.stringify(envelope, null, 2);
}

export function parseJsonExport<T>(raw: string): JsonExportEnvelope<T> {
	const parsed = JSON.parse(raw);
	if (parsed.format !== "gitrends-json") {
		throw new Error(`Invalid format: expected "gitrends-json", got "${parsed.format}"`);
	}
	return parsed as JsonExportEnvelope<T>;
}
