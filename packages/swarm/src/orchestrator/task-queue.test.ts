import { describe, expect, it } from "vitest";
import { TaskQueue } from "./task-queue.ts";

describe("TaskQueue", () => {
	it("enqueues and dequeues tasks", () => {
		const q = new TaskQueue();
		const task = q.enqueue("profile-learner", { userId: "u1" });
		expect(task.status).toBe("pending");
		expect(q.pending()).toBe(1);

		const dequeued = q.dequeue();
		expect(dequeued).not.toBeNull();
		expect(dequeued?.id).toBe(task.id);
		expect(dequeued?.status).toBe("running");
		expect(q.pending()).toBe(0);
		expect(q.runningCount()).toBe(1);
	});

	it("dequeues by agent type", () => {
		const q = new TaskQueue();
		q.enqueue("profile-learner", {});
		q.enqueue("repo-recommender", {});

		const task = q.dequeue("repo-recommender");
		expect(task?.agentType).toBe("repo-recommender");
		expect(q.pending()).toBe(1);
	});

	it("returns null when queue is empty", () => {
		const q = new TaskQueue();
		expect(q.dequeue()).toBeNull();
	});

	it("completes a running task", () => {
		const q = new TaskQueue();
		q.enqueue("auto-fixer", { error: "test" });
		const running = q.dequeue();
		expect(running).not.toBeNull();

		q.complete(running?.id ?? "", { fixed: true });
		expect(q.runningCount()).toBe(0);
	});

	it("fails a running task", () => {
		const q = new TaskQueue();
		q.enqueue("dash-optimizer", {});
		const running = q.dequeue();
		expect(running).not.toBeNull();

		q.fail(running?.id ?? "", "timeout");
		expect(q.runningCount()).toBe(0);
	});
});
