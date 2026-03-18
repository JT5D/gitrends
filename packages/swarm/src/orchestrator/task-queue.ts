/** Simple in-memory task queue for agent work */

import type { AgentTask, AgentType } from "@gitrends/core";

export class TaskQueue {
	private queue: AgentTask[] = [];
	private running = new Map<string, AgentTask>();

	enqueue(agentType: AgentType, input: unknown): AgentTask {
		const task: AgentTask = {
			id: crypto.randomUUID(),
			agentType,
			input,
			createdAt: new Date().toISOString(),
			startedAt: null,
			completedAt: null,
			status: "pending",
			result: null,
			error: null,
		};
		this.queue.push(task);
		return task;
	}

	dequeue(agentType?: AgentType): AgentTask | null {
		const idx = agentType
			? this.queue.findIndex((t) => t.agentType === agentType && t.status === "pending")
			: this.queue.findIndex((t) => t.status === "pending");
		if (idx === -1) return null;

		const task = this.queue[idx];
		if (!task) return null;
		task.status = "running";
		task.startedAt = new Date().toISOString();
		this.running.set(task.id, task);
		this.queue.splice(idx, 1);
		return task;
	}

	complete(taskId: string, result: unknown): void {
		const task = this.running.get(taskId);
		if (!task) return;
		task.status = "completed";
		task.completedAt = new Date().toISOString();
		task.result = result;
		this.running.delete(taskId);
	}

	fail(taskId: string, error: string): void {
		const task = this.running.get(taskId);
		if (!task) return;
		task.status = "failed";
		task.completedAt = new Date().toISOString();
		task.error = error;
		this.running.delete(taskId);
	}

	pending(): number {
		return this.queue.filter((t) => t.status === "pending").length;
	}

	runningCount(): number {
		return this.running.size;
	}
}
