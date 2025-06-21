import React from "react";

export interface BottomBarItem {
  id: string;
  render: () => React.ReactNode;
  order?: number;
}

const registry: Record<string, BottomBarItem> = {};

export function registerBottomBarItem(item: BottomBarItem) {
  registry[item.id] = item;
}

export function unregisterBottomBarItem(id: string) {
  delete registry[id];
}

export function getBottomBarItems(): BottomBarItem[] {
  return Object.values(registry).sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0),
  );
}
