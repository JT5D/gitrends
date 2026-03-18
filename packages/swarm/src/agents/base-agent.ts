/** BaseAgent — three-layer fallback: LLM → JSON repair → rule-based defaults */

import { repairJson, retry } from "@gitrends/core";
import type { AgentInfo, AgentStatus, AgentType } from "@gitrends/core";

export interface AgentConfig {
	id: string;
	type: AgentType;
	llmApiKey: string | null;
	llmBaseUrl: string;
	llmModel: string;
}

export interface LLMResponse {
	content: string;
}

export abstract class BaseAgent<TInput = unknown, TOutput = unknown> {
	protected config: AgentConfig;
	private status: AgentStatus = "idle";
	private taskCount = 0;
	private errorCount = 0;
	private lastRunAt: string | null = null;

	constructor(config: AgentConfig) {
		this.config = config;
	}

	/** Override: build the LLM prompt from input */
	protected abstract buildPrompt(input: TInput): string;

	/** Override: parse LLM output into typed result */
	protected abstract parseOutput(raw: unknown): TOutput;

	/** Override: rule-based fallback when LLM fails */
	protected abstract fallbackDefaults(input: TInput): TOutput;

	/** Execute with three-layer fallback */
	async run(input: TInput): Promise<TOutput> {
		this.status = "running";
		this.lastRunAt = new Date().toISOString();
		this.taskCount++;

		try {
			// Layer 1: LLM call
			if (this.config.llmApiKey) {
				try {
					const prompt = this.buildPrompt(input);
					const response = await this.callLLM(prompt);

					// Layer 2: JSON repair if needed
					const repaired = repairJson(response.content);
					if (repaired.data !== null) {
						const result = this.parseOutput(repaired.data);
						this.status = "idle";
						return result;
					}
				} catch (err) {
					console.warn(`[${this.config.id}] LLM failed, falling back:`, (err as Error).message);
				}
			}

			// Layer 3: Rule-based defaults
			const result = this.fallbackDefaults(input);
			this.status = "idle";
			return result;
		} catch (err) {
			this.errorCount++;
			this.status = "error";
			throw err;
		}
	}

	private async callLLM(prompt: string): Promise<LLMResponse> {
		return retry(
			async () => {
				const resp = await fetch(`${this.config.llmBaseUrl}/v1/messages`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						"x-api-key": this.config.llmApiKey!,
						"anthropic-version": "2023-06-01",
					},
					body: JSON.stringify({
						model: this.config.llmModel,
						max_tokens: 1024,
						messages: [{ role: "user", content: prompt }],
					}),
				});

				if (!resp.ok) {
					throw new Error(`LLM API ${resp.status}: ${await resp.text()}`);
				}

				const data = (await resp.json()) as {
					content: { type: string; text: string }[];
				};
				return { content: data.content[0]?.text ?? "" };
			},
			{ maxRetries: 1, baseDelayMs: 1000 },
		);
	}

	getInfo(): AgentInfo {
		return {
			id: this.config.id,
			type: this.config.type,
			status: this.status,
			lastRunAt: this.lastRunAt,
			taskCount: this.taskCount,
			errorCount: this.errorCount,
		};
	}

	getStatus(): AgentStatus {
		return this.status;
	}
}
