import { create } from "zustand";

export interface Keybind {
	id: string;
	keys: string[];
	description?: string;
	handler: () => void;
}

interface KeybindStore {
	keybinds: Keybind[];
	registerKeybind: (bind: Keybind) => void;
	unregisterKeybind: (id: string) => void;
	updateKeybind: (id: string, update: Partial<Omit<Keybind, "id">>) => void;
	getKeybindById: (id: string) => Keybind | undefined;
}

// Internal type for fast lookup
type KeybindMap = Record<string, Keybind>;

export const useKeybindStore = create<KeybindStore>((set, get) => {
	// Internal state: keybinds as a map
	let keybindMap: KeybindMap = {};

	const syncArray = () => Object.values(keybindMap);

	return {
		keybinds: [],
		registerKeybind: (bind) =>
			set((state) => {
				keybindMap = { ...keybindMap, [bind.id]: bind };
				return { keybinds: syncArray() };
			}),
		unregisterKeybind: (id) =>
			set((state) => {
				const { [id]: _, ...rest } = keybindMap;
				keybindMap = rest;
				return { keybinds: syncArray() };
			}),
		updateKeybind: (id, update) =>
			set((state) => {
				if (keybindMap[id]) {
					keybindMap = {
						...keybindMap,
						[id]: { ...keybindMap[id], ...update },
					};
				}
				return { keybinds: syncArray() };
			}),
		getKeybindById: (id) => keybindMap[id],
	};
});
