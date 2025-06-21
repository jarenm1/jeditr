import { create } from "zustand";
import React from "react";

export interface BottomBarItem {
	id: string;
	component: React.ComponentType;
	order?: number;
}

type BottomBarStore = {
	items: BottomBarItem[];
	register: (item: BottomBarItem) => void;
	unregister: (id: string) => void;
};

export const useBottomBarStore = create<BottomBarStore>((set, get) => ({
	items: [],
	register: (item) =>
		set((state) => {
			const filtered = state.items.filter((i) => i.id !== item.id);
			return {
				items: [...filtered, item].sort(
					(a, b) => (a.order ?? 0) - (b.order ?? 0),
				),
			};
		}),
	unregister: (id) =>
		set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
}));
