import { describe, expect, it } from "vitest";
import { repairJson } from "./json-repair.ts";

describe("repairJson", () => {
	it("parses valid JSON (stage 1)", () => {
		const result = repairJson('{"key": "value"}');
		expect(result.data).toEqual({ key: "value" });
		expect(result.repaired).toBe(false);
		expect(result.stage).toBe(1);
	});

	it("strips markdown fences (stage 2)", () => {
		const result = repairJson('```json\n{"key": "value"}\n```');
		expect(result.data).toEqual({ key: "value" });
		expect(result.repaired).toBe(true);
		expect(result.stage).toBe(2);
	});

	it("fixes trailing commas (stage 3)", () => {
		const result = repairJson('{"key": "value",}');
		expect(result.data).toEqual({ key: "value" });
		expect(result.repaired).toBe(true);
	});

	it("extracts JSON from surrounding text (stage 4)", () => {
		const result = repairJson('Here is the result: {"key": "value"} and some more text');
		expect(result.data).toEqual({ key: "value" });
		expect(result.repaired).toBe(true);
	});

	it("handles arrays", () => {
		const result = repairJson("[1, 2, 3]");
		expect(result.data).toEqual([1, 2, 3]);
		expect(result.repaired).toBe(false);
	});

	it("returns null for completely invalid input", () => {
		const result = repairJson("not json at all");
		expect(result.data).toBeNull();
		expect(result.error).toBeTruthy();
	});
});
