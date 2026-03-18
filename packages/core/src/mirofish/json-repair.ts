/** 5-stage JSON repair pipeline (~80 lines) */

export interface RepairResult {
	data: unknown;
	repaired: boolean;
	stage: number;
	error: string | null;
}

/**
 * Attempts to parse JSON through a 5-stage repair pipeline:
 * 1. Direct parse
 * 2. Strip leading/trailing noise (markdown fences, BOM, whitespace)
 * 3. Fix common LLM output issues (trailing commas, single quotes)
 * 4. Extract JSON from surrounding text
 * 5. Bracket balancing
 */
export function repairJson(raw: string): RepairResult {
	// Stage 1: Direct parse
	const s1 = tryParse(raw);
	if (s1 !== undefined) return { data: s1, repaired: false, stage: 1, error: null };

	// Stage 2: Strip noise
	let cleaned = raw.trim();
	cleaned = cleaned.replace(/^\uFEFF/, "");
	cleaned = cleaned.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/, "");
	cleaned = cleaned.trim();
	const s2 = tryParse(cleaned);
	if (s2 !== undefined) return { data: s2, repaired: true, stage: 2, error: null };

	// Stage 3: Fix common issues
	let fixed = cleaned;
	fixed = fixed.replace(/,\s*([}\]])/g, "$1"); // trailing commas
	fixed = fixed.replace(/'/g, '"'); // single quotes → double
	fixed = fixed.replace(/(\w+)\s*:/g, '"$1":'); // unquoted keys
	fixed = fixed.replace(/:\s*undefined/g, ": null"); // undefined → null
	const s3 = tryParse(fixed);
	if (s3 !== undefined) return { data: s3, repaired: true, stage: 3, error: null };

	// Stage 4: Extract JSON from text
	const jsonMatch = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
	if (jsonMatch) {
		let extracted = jsonMatch[1]!;
		extracted = extracted.replace(/,\s*([}\]])/g, "$1");
		const s4 = tryParse(extracted);
		if (s4 !== undefined) return { data: s4, repaired: true, stage: 4, error: null };
	}

	// Stage 5: Bracket balancing
	const balanced = balanceBrackets(fixed);
	const s5 = tryParse(balanced);
	if (s5 !== undefined) return { data: s5, repaired: true, stage: 5, error: null };

	return { data: null, repaired: false, stage: 5, error: "All repair stages failed" };
}

function tryParse(s: string): unknown | undefined {
	try {
		return JSON.parse(s);
	} catch {
		return undefined;
	}
}

function balanceBrackets(s: string): string {
	let result = s;
	let opens = 0;
	let closes = 0;
	for (const ch of result) {
		if (ch === "{" || ch === "[") opens++;
		if (ch === "}" || ch === "]") closes++;
	}
	while (closes < opens) {
		const lastOpen = result.lastIndexOf("{") > result.lastIndexOf("[") ? "}" : "]";
		result += lastOpen;
		closes++;
	}
	return result;
}
