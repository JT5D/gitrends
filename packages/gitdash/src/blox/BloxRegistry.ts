/** Dynamic component registry for GitBlox */

import type { BloxMeta, DisplaySize } from "@gitrends/core";
import type { ComponentType } from "preact";

export interface BloxProps {
	size: DisplaySize;
	config: Record<string, unknown>;
}

const registry = new Map<string, { meta: BloxMeta; component: ComponentType<BloxProps> }>();

export function registerBlox(meta: BloxMeta, component: ComponentType<BloxProps>): void {
	registry.set(meta.type, { meta, component });
}

export function getBlox(type: string) {
	return registry.get(type);
}

export function getAllBlox(): BloxMeta[] {
	return [...registry.values()].map((r) => r.meta);
}

export function getBloxComponent(type: string): ComponentType<BloxProps> | null {
	return registry.get(type)?.component ?? null;
}
