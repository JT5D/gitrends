/** Preact hooks for store integration */

import { useEffect, useState } from "preact/hooks";
import type { DashStore, DashStoreSnapshot } from "./store.ts";

export function useStore(store: DashStore): DashStoreSnapshot {
	const [snapshot, setSnapshot] = useState(store.getSnapshot());

	useEffect(() => {
		return store.subscribe(() => {
			setSnapshot(store.getSnapshot());
		});
	}, [store]);

	return snapshot;
}

export function useRepos(store: DashStore) {
	const [repos, setRepos] = useState(store.repos);

	useEffect(() => {
		return store.subscribe(() => {
			setRepos([...store.repos]);
		});
	}, [store]);

	return repos;
}
