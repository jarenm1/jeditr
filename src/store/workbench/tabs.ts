/**
 * @fileoverview
 * @author @jarenm1
 *
 * Tabs Slice
 * Manages tabs within view containers
 */

import type { StateCreator } from "zustand";
import type { TabInterface } from "./types";
import type { WorkbenchStore } from "./index";
import { nanoid } from "nanoid";

export interface TabsSlice {
  // Tab management within views
  addTabToView: (viewId: string, tab: Omit<TabInterface, "id">) => string;
  removeTabFromView: (viewId: string, tabId: string) => void;
  setActiveTabInView: (viewId: string, tabId: string) => void;
  updateTabInView: (
    viewId: string,
    tabId: string,
    updates: Partial<TabInterface>,
  ) => void;

  // Tab operations between views
  moveTabBetweenViews: (
    tabId: string,
    fromViewId: string,
    toViewId: string,
  ) => void;
  duplicateTab: (viewId: string, tabId: string) => string;

  // Tab queries
  getActiveTabInView: (viewId: string) => TabInterface | null;
  getTabInView: (viewId: string, tabId: string) => TabInterface | null;
  getTabByFilePath: (
    filePath: string,
  ) => { viewId: string; tab: TabInterface } | null;
  hasTabWithFilePath: (filePath: string) => boolean;

  // Bulk operations
  removeAllTabsFromView: (viewId: string) => void;
  getModifiedTabs: () => Array<{ viewId: string; tab: TabInterface }>;
}

export const createTabsSlice: StateCreator<WorkbenchStore, [], [], TabsSlice> = (
  set,
  get,
) => ({
  addTabToView: (viewId, tabData) => {
    const newTabId = `tab-${nanoid()}`;
    const newTab: TabInterface = {
      ...tabData,
      id: newTabId,
      lastAccessed: new Date(),
    };

    const existingTabInfo = get().getTabByFilePath(newTab.filePath);
    if (existingTabInfo) {
      get().setActiveTabInView(existingTabInfo.viewId, existingTabInfo.tab.id);
      return existingTabInfo.tab.id;
    }

    set((state) => ({
      views: state.views.map((view) => {
        if (view.id !== viewId) return view;

        return {
          ...view,
          tabs: [...view.tabs, newTab],
          activeTabId: view.activeTabId || newTabId,
        };
      }),
    }));

    return newTabId;
  },

  removeTabFromView: (viewId, tabId) =>
    set((state) => ({
      views: state.views.map((view) => {
        if (view.id !== viewId || !view.tabs) return view;

        const remainingTabs = view.tabs.filter((tab) => tab.id !== tabId);
        let newActiveTabId = view.activeTabId;

        if (view.activeTabId === tabId) {
          if (remainingTabs.length > 0) {
            // Sort by lastAccessed to find the most recent tab
            const sortedTabs = [...remainingTabs].sort(
              (a, b) =>
                new Date(b.lastAccessed!).getTime() -
                new Date(a.lastAccessed!).getTime(),
            );
            newActiveTabId = sortedTabs[0].id;
          } else {
            newActiveTabId = null;
          }
        }

        return {
          ...view,
          tabs: remainingTabs,
          activeTabId: newActiveTabId,
        };
      }),
    })),

  setActiveTabInView: (viewId, tabId) =>
    set((state) => ({
      views: state.views.map((view) => {
        if (view.id !== viewId || !view.tabs) return view;

        const tabExists = view.tabs.some((tab) => tab.id === tabId);
        if (!tabExists) {
          console.warn(`Tab ${tabId} not found in view ${viewId}`);
          return view;
        }

        const updatedTabs = view.tabs.map((tab) =>
          tab.id === tabId ? { ...tab, lastAccessed: new Date() } : tab,
        );

        return {
          ...view,
          tabs: updatedTabs,
          activeTabId: tabId,
        };
      }),
    })),

  updateTabInView: (viewId, tabId, updates) =>
    set((state) => ({
      views: state.views.map((view) => {
        if (view.id !== viewId || !view.tabs) return view;

        return {
          ...view,
          tabs: view.tabs.map((tab) =>
            tab.id === tabId ? { ...tab, ...updates } : tab,
          ),
        };
      }),
    })),

  moveTabBetweenViews: (tabId, fromViewId, toViewId) =>
    set((state) => {
      let tabToMove: TabInterface | null = null;
      let sourceViewHasTabs = false;

      const updatedViews = state.views.map((view) => {
        if (view.id === fromViewId && view.tabs) {
          const tab = view.tabs.find((t) => t.id === tabId);
          if (tab) {
            tabToMove = tab;
            sourceViewHasTabs = view.tabs.length > 1;
            const remainingTabs = view.tabs.filter((t) => t.id !== tabId);
            return {
              ...view,
              tabs: remainingTabs,
              activeTabId:
                view.activeTabId === tabId
                  ? remainingTabs[0]?.id || null
                  : view.activeTabId,
            };
          }
        }
        return view;
      });

      if (!tabToMove) return state;

      return {
        views: updatedViews.map((view) => {
          if (view.id === toViewId) {
            return {
              ...view,
              tabs: [...(view.tabs || []), tabToMove!],
              activeTabId: tabToMove!.id,
            };
          }
          return view;
        }),
      };
    }),

  duplicateTab: (viewId, tabId) => {
    const view = get().views.find((v) => v.id === viewId);
    const tab = view?.tabs?.find((t) => t.id === tabId);

    if (!tab) return "";

    const duplicateTabData: Omit<TabInterface, "id"> = {
      ...tab,
      name: `${tab.name} (Copy)`,
      isModified: true, // Duplicated tabs are often considered modified
    };

    return get().addTabToView(viewId, duplicateTabData);
  },

  getActiveTabInView: (viewId) => {
    const view = get().views.find((v) => v.id === viewId);
    if (!view || !view.activeTabId || !view.tabs) return null;

    return view.tabs.find((tab) => tab.id === view.activeTabId) || null;
  },

  getTabInView: (viewId, tabId) => {
    const view = get().views.find((v) => v.id === viewId);
    return view?.tabs?.find((tab) => tab.id === tabId) || null;
  },

  getTabByFilePath: (filePath) => {
    for (const view of get().views) {
      if (view.tabs) {
        const tab = view.tabs.find((t) => t.filePath === filePath);
        if (tab) {
          return { viewId: view.id, tab };
        }
      }
    }
    return null;
  },

  hasTabWithFilePath: (filePath) => {
    return get().getTabByFilePath(filePath) !== null;
  },

  removeAllTabsFromView: (viewId) =>
    set((state) => ({
      views: state.views.map((view) =>
        view.id === viewId ? { ...view, tabs: [], activeTabId: null } : view,
      ),
    })),

  getModifiedTabs: () => {
    const modifiedTabs: Array<{ viewId: string; tab: TabInterface }> = [];
    get().views.forEach((view) => {
      if (view.tabs) {
        view.tabs.forEach((tab) => {
          if (tab.isModified) {
            modifiedTabs.push({ viewId: view.id, tab });
          }
        });
      }
    });
    return modifiedTabs;
  },
});
