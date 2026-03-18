/** Filesystem JSON command/response IPC (~150 lines) */

import { mkdir, readFile, readdir, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";

export interface IpcCommand<T = unknown> {
	id: string;
	command: string;
	payload: T;
	timestamp: string;
	sender: string;
}

export interface IpcResponse<T = unknown> {
	id: string;
	commandId: string;
	status: "ok" | "error";
	payload: T;
	timestamp: string;
	responder: string;
}

export interface IpcOptions {
	baseDir: string;
	pollIntervalMs?: number;
	timeoutMs?: number;
}

/**
 * Filesystem-based IPC using JSON files.
 * Commands go in `baseDir/commands/`, responses in `baseDir/responses/`.
 * No network dependency — works for process-isolated architectures.
 */
export class IpcBridge {
	private commandsDir: string;
	private responsesDir: string;
	private pollIntervalMs: number;
	private timeoutMs: number;
	private initialized = false;

	constructor(opts: IpcOptions) {
		this.commandsDir = join(opts.baseDir, "commands");
		this.responsesDir = join(opts.baseDir, "responses");
		this.pollIntervalMs = opts.pollIntervalMs ?? 200;
		this.timeoutMs = opts.timeoutMs ?? 30000;
	}

	private async ensureDirs(): Promise<void> {
		if (this.initialized) return;
		await mkdir(this.commandsDir, { recursive: true });
		await mkdir(this.responsesDir, { recursive: true });
		this.initialized = true;
	}

	/** Send a command and wait for a response */
	async send<TReq, TRes>(
		command: string,
		payload: TReq,
		sender: string,
	): Promise<IpcResponse<TRes>> {
		await this.ensureDirs();
		const id = crypto.randomUUID();
		const cmd: IpcCommand<TReq> = {
			id,
			command,
			payload,
			timestamp: new Date().toISOString(),
			sender,
		};
		await writeFile(join(this.commandsDir, `${id}.json`), JSON.stringify(cmd, null, 2));
		return this.waitForResponse<TRes>(id);
	}

	/** Read pending commands */
	async readCommands(): Promise<IpcCommand[]> {
		await this.ensureDirs();
		const files = await readdir(this.commandsDir).catch(() => []);
		const commands: IpcCommand[] = [];
		for (const file of files) {
			if (!file.endsWith(".json")) continue;
			try {
				const raw = await readFile(join(this.commandsDir, file), "utf-8");
				commands.push(JSON.parse(raw));
			} catch {
				// Skip malformed
			}
		}
		return commands;
	}

	/** Respond to a command */
	async respond<T>(
		commandId: string,
		status: "ok" | "error",
		payload: T,
		responder: string,
	): Promise<void> {
		await this.ensureDirs();
		const response: IpcResponse<T> = {
			id: crypto.randomUUID(),
			commandId,
			status,
			payload,
			timestamp: new Date().toISOString(),
			responder,
		};
		await writeFile(
			join(this.responsesDir, `${commandId}.json`),
			JSON.stringify(response, null, 2),
		);
		// Clean up command file
		await unlink(join(this.commandsDir, `${commandId}.json`)).catch(() => {});
	}

	private async waitForResponse<T>(commandId: string): Promise<IpcResponse<T>> {
		const deadline = Date.now() + this.timeoutMs;
		while (Date.now() < deadline) {
			try {
				const raw = await readFile(join(this.responsesDir, `${commandId}.json`), "utf-8");
				const response = JSON.parse(raw) as IpcResponse<T>;
				// Clean up response file
				await unlink(join(this.responsesDir, `${commandId}.json`)).catch(() => {});
				return response;
			} catch {
				await new Promise((r) => setTimeout(r, this.pollIntervalMs));
			}
		}
		throw new Error(`IPC timeout waiting for response to command ${commandId}`);
	}

	/** Clean up all IPC files */
	async cleanup(): Promise<void> {
		const cleanDir = async (dir: string) => {
			const files = await readdir(dir).catch(() => []);
			await Promise.all(files.map((f) => unlink(join(dir, f)).catch(() => {})));
		};
		await cleanDir(this.commandsDir);
		await cleanDir(this.responsesDir);
	}
}
