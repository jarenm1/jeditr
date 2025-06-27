/**
 * @fileoverview
 * @author @jarenm1
 *
 * Navigation Slice
 * Manages focus history and navigation between views and tabs
 */

import type { StateCreator } from "zustand";
import type { FocusHistoryEntry } from "./types";

export interface NavigationSlice {
  focusHistory: FocusHistoryEntry[];
  historyIndex: number;

  // Focus management
  addToFocusHistory: (viewId: string, tabId: string) => void;
  clearFocusHistory: () => void;

  // Navigation operations
  navigateBack: () => boolean;
  navigateForward: () => boolean;
  canNavigateBack: () => boolean;
  canNavigateForward: () => boolean;

  // View navigation
  focusNextView: () => void;
  focusPreviousView: () => void;
  focusLastAccessedTab: () => void;

  // Tab navigation within views
  focusNextTabInView: (viewId: string) => void;
  focusPreviousTabInView: (viewId: string) => void;

  // Quick navigation
  jumpToRecentTab: (index: number) => void;
  getRecentTabs: (limit?: number) => FocusHistoryEntry[];
}

export const createNavigationSlice: StateCreator<
  NavigationSlice,
  [],
  [],
  NavigationSlice
> = (set, get) => ({
  focusHistory: [],
  historyIndex: -1,

  addToFocusHistory: (viewId, tabId) =>
    set((state) => {
      const newEntry: FocusHistoryEntry = {
        viewId,
        tabId,
        timestamp: new Date(),
      };

      // Truncate history after the current index to discard forward history
      const historyUpToIndex = state.focusHistory.slice(
        0,
        state.historyIndex + 1,
      );

      // Remove previous entries for the same tab to avoid clutter
      const filteredHistory = historyUpToIndex.filter(
        (entry) => !(entry.viewId === viewId && entry.tabId === tabId),
      );

      const newHistory = [...filteredHistory, newEntry];

      // Trim history if it gets too long
      const maxHistoryLength = 50;
      if (newHistory.length > maxHistoryLength) {
        newHistory.splice(0, newHistory.length - maxHistoryLength);
      }

      return {
        focusHistory: newHistory,
        historyIndex: newHistory.length - 1,
      };
    }),

  clearFocusHistory: () =>
    set({
      focusHistory: [],
      historyIndex: -1,
    }),

  navigateBack: () => {
    if (!get().canNavigateBack()) return false;

    const newIndex = get().historyIndex - 1;
    const targetEntry = get().focusHistory[newIndex];

    if (targetEntry) {
      const { setActiveView, setActiveTabInView } = get() as any;
      setActiveView(targetEntry.viewId);
      setActiveTabInView(targetEntry.viewId, targetEntry.tabId);
      set({ historyIndex: newIndex });
      return true;
    }

    return false;
  },

  navigateForward: () => {
    if (!get().canNavigateForward()) return false;

    const newIndex = get().historyIndex + 1;
    const targetEntry = get().focusHistory[newIndex];

    if (targetEntry) {
      const { setActiveView, setActiveTabInView } = get() as any;
      setActiveView(targetEntry.viewId);
      setActiveTabInView(targetEntry.viewId, targetEntry.tabId);
      set({ historyIndex: newIndex });
      return true;
    }

    return false;
  },

  canNavigateBack: () => get().historyIndex > 0,

  canNavigateForward: () => get().historyIndex < get().focusHistory.length - 1,

  focusNextView: () => {
    const { getActiveView, getViewOrder, setActiveView } = get() as any;
    const currentActiveView = getActiveView();
    const viewOrder = getViewOrder();

    if (!currentActiveView || viewOrder.length === 0) return;

    const currentIndex = viewOrder.indexOf(currentActiveView.id);
    const nextIndex = (currentIndex + 1) % viewOrder.length;
    const nextViewId = viewOrder[nextIndex];

    setActiveView(nextViewId);
  },

  // TODO: Implement focusPreviousView - focuses the previous view in order
  focusPreviousView: () => {
    const { getActiveView, getViewOrder, setActiveView } = get() as any;
    const currentActiveView = getActiveView();
    const viewOrder = getViewOrder();

    if (!currentActiveView || viewOrder.length === 0) return;

    const currentIndex = viewOrder.indexOf(currentActiveView.id);
    const previousIndex =
      (currentIndex - 1 + viewOrder.length) % viewOrder.length;
    const previousViewId = viewOrder[previousIndex];

    setActiveView(previousViewId);
  },

  focusLastAccessedTab: () => {
    const { focusHistory } = get();

    if (focusHistory.length > 0) {
      const lastEntry = focusHistory[focusHistory.length - 1];
      const { setActiveView, setActiveTabInView } = get() as any;
      setActiveView(lastEntry.viewId);
      setActiveTabInView(lastEntry.viewId, lastEntry.tabId);
    }
  },

  focusNextTabInView: (viewId) => {
    const { getTabInView, setActiveTabInView, views } = get() as any;
    const view = views.find((v: any) => v.id === viewId);

    if (!view || !view.tabs || view.tabs.length === 0) return;

    const currentActiveTabId = view.activeTabId;
    const currentIndex = view.tabs.findIndex(
      (tab: any) => tab.id === currentActiveTabId,
    );

    const nextIndex = (currentIndex + 1) % view.tabs.length;
    const nextTabId = view.tabs[nextIndex].id;

    setActiveTabInView(viewId, nextTabId);
  },

  focusPreviousTabInView: (viewId) => {
    const { getTabInView, setActiveTabInView, views } = get() as any;
    const view = views.find((v: any) => v.id === viewId);

    if (!view || !view.tabs || view.tabs.length === 0) return;

    const currentActiveTabId = view.activeTabId;
    const currentIndex = view.tabs.findIndex(
      (tab: any) => tab.id === currentActiveTabId,
    );

    const previousIndex =
      (currentIndex - 1 + view.tabs.length) % view.tabs.length;
    const previousTabId = view.tabs[previousIndex].id;

    setActiveTabInView(viewId, previousTabId);
  },

  jumpToRecentTab: (index) => {
    const { focusHistory } = get();

    if (index >= 0 && index < focusHistory.length) {
      const targetEntry = focusHistory[index];
      const { setActiveView, setActiveTabInView } = get() as any;
      setActiveView(targetEntry.viewId);
      setActiveTabInView(targetEntry.viewId, targetEntry.tabId);
      set({ historyIndex: index });
    }
  },

  getRecentTabs: (limit = 10) => {
    const uniqueTabs = new Map<string, FocusHistoryEntry>();

    // Process history in reverse order to get most recent first
    for (let i = get().focusHistory.length - 1; i >= 0; i--) {
      const entry = get().focusHistory[i];
      const key = `${entry.viewId}-${entry.tabId}`;

      if (!uniqueTabs.has(key)) {
        uniqueTabs.set(key, entry);

        if (uniqueTabs.size >= limit) {
          break;
        }
      }
    }

    return Array.from(uniqueTabs.values());
  },
});
