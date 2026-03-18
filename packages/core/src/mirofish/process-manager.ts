/** Process spawn/stop manager with SIGTERM→timeout→SIGKILL (~200 lines) */

import { type ChildProcess, spawn } from "node:child_process";
import { EventEmitter } from "node:events";

export interface ProcessConfig {
	id: string;
	command: string;
	args: string[];
	cwd?: string;
	env?: Record<string, string>;
	/** Grace period before SIGKILL (ms) */
	killTimeoutMs?: number;
	/** Auto-restart on unexpected exit */
	autoRestart?: boolean;
	/** Max restart attempts */
	maxRestarts?: number;
	/** Restart delay (ms) */
	restartDelayMs?: number;
}

export interface ProcessState {
	id: string;
	pid: number | null;
	status: "starting" | "running" | "stopping" | "stopped" | "crashed";
	startedAt: string | null;
	stoppedAt: string | null;
	restartCount: number;
	exitCode: number | null;
}

export class ProcessManager extends EventEmitter {
	private processes = new Map<string, ManagedProcess>();

	/** Spawn a new managed process */
	async start(config: ProcessConfig): Promise<ProcessState> {
		if (this.processes.has(config.id)) {
			await this.stop(config.id);
		}

		const managed = new ManagedProcess(config, this);
		this.processes.set(config.id, managed);
		return managed.start();
	}

	/** Graceful stop: SIGTERM → timeout → SIGKILL */
	async stop(id: string): Promise<void> {
		const managed = this.processes.get(id);
		if (!managed) return;
		await managed.stop();
		this.processes.delete(id);
	}

	/** Stop all managed processes */
	async stopAll(): Promise<void> {
		const stops = [...this.processes.keys()].map((id) => this.stop(id));
		await Promise.allSettled(stops);
	}

	getState(id: string): ProcessState | null {
		return this.processes.get(id)?.getState() ?? null;
	}

	getAllStates(): ProcessState[] {
		return [...this.processes.values()].map((p) => p.getState());
	}

	isRunning(id: string): boolean {
		const state = this.getState(id);
		return state?.status === "running" || state?.status === "starting";
	}
}

class ManagedProcess {
	private child: ChildProcess | null = null;
	private state: ProcessState;
	private config: ProcessConfig;
	private manager: ProcessManager;
	private restartCount = 0;

	constructor(config: ProcessConfig, manager: ProcessManager) {
		this.config = config;
		this.manager = manager;
		this.state = {
			id: config.id,
			pid: null,
			status: "stopped",
			startedAt: null,
			stoppedAt: null,
			restartCount: 0,
			exitCode: null,
		};
	}

	start(): ProcessState {
		const { command, args, cwd, env } = this.config;
		this.child = spawn(command, args, {
			cwd,
			env: { ...process.env, ...env },
			detached: true,
			stdio: ["ignore", "pipe", "pipe"],
		});

		this.state.pid = this.child.pid ?? null;
		this.state.status = "running";
		this.state.startedAt = new Date().toISOString();
		this.state.exitCode = null;
		this.state.stoppedAt = null;

		this.child.stdout?.on("data", (data: Buffer) => {
			this.manager.emit("output", { id: this.config.id, stream: "stdout", data: data.toString() });
		});

		this.child.stderr?.on("data", (data: Buffer) => {
			this.manager.emit("output", { id: this.config.id, stream: "stderr", data: data.toString() });
		});

		this.child.on("exit", (code, signal) => {
			this.state.exitCode = code;
			this.state.stoppedAt = new Date().toISOString();

			if (this.state.status === "stopping") {
				this.state.status = "stopped";
				this.manager.emit("stopped", { id: this.config.id, code, signal });
			} else {
				this.state.status = "crashed";
				this.manager.emit("crashed", { id: this.config.id, code, signal });
				this.maybeRestart();
			}
		});

		this.child.on("error", (err) => {
			this.manager.emit("error", { id: this.config.id, error: err.message });
		});

		this.manager.emit("started", { id: this.config.id, pid: this.state.pid });
		return { ...this.state };
	}

	async stop(): Promise<void> {
		if (!this.child || this.state.status === "stopped") return;
		this.state.status = "stopping";

		const killTimeout = this.config.killTimeoutMs ?? 5000;

		// SIGTERM first
		if (this.child.pid) {
			try {
				process.kill(-this.child.pid, "SIGTERM");
			} catch {
				this.child.kill("SIGTERM");
			}
		}

		// Wait for exit or force SIGKILL
		await new Promise<void>((resolve) => {
			const timer = setTimeout(() => {
				if (this.child?.pid) {
					try {
						process.kill(-this.child.pid, "SIGKILL");
					} catch {
						this.child?.kill("SIGKILL");
					}
				}
				resolve();
			}, killTimeout);

			this.child?.once("exit", () => {
				clearTimeout(timer);
				resolve();
			});
		});

		this.state.status = "stopped";
		this.state.stoppedAt = new Date().toISOString();
	}

	private async maybeRestart(): Promise<void> {
		if (!this.config.autoRestart) return;
		const maxRestarts = this.config.maxRestarts ?? 3;
		if (this.restartCount >= maxRestarts) return;

		this.restartCount++;
		this.state.restartCount = this.restartCount;
		const delay = this.config.restartDelayMs ?? 2000;
		await new Promise((r) => setTimeout(r, delay));

		if (this.state.status === "crashed") {
			this.manager.emit("restarted", { id: this.config.id, attempt: this.restartCount });
			this.start();
		}
	}

	getState(): ProcessState {
		return { ...this.state };
	}
}
