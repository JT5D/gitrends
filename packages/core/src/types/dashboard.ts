/** Dashboard layout and component types */

export type DisplaySize = "ticker" | "compact" | "standard" | "expanded" | "fullscreen";

export interface BloxMeta {
	id: string;
	type: string;
	label: string;
	description: string;
	supportedSizes: DisplaySize[];
	defaultSize: DisplaySize;
	category: BloxCategory;
}

export type BloxCategory = "chart" | "feed" | "card" | "graph" | "notification" | "custom";

export interface BloxInstance {
	id: string;
	bloxType: string;
	size: DisplaySize;
	position: GridPosition;
	config: Record<string, unknown>;
}

export interface GridPosition {
	col: number;
	row: number;
	colSpan: number;
	rowSpan: number;
}

export interface DashLayout {
	id: string;
	name: string;
	description: string;
	blox: BloxInstance[];
	columns: number;
	rowHeight: number;
	gap: number;
}

export interface DashPreset {
	id: string;
	name: string;
	description: string;
	layout: DashLayout;
	thumbnail?: string;
}

export interface DashSharePayload {
	version: string;
	layout: DashLayout;
	createdAt: string;
	source: string;
}
