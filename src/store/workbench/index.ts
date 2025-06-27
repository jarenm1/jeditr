/**
 * @fileoverview
 * @author @jarenm1
 *
 * Workbench store
 *
 * This store combines all workbench slices:
 * - Views: Manages view containers
 * - Tabs: Manages tabs within views
 * - Layout: Manages splitting, resizing, and arrangements
 * - Navigation: Manages focus history and navigation
 */

import { create } from "zustand";
import { createViewsSlice, type ViewsSlice } from "./views";
import { createTabsSlice, type TabsSlice } from "./tabs";
import { createLayoutSlice, type LayoutSlice } from "./layout";
import { createNavigationSlice, type NavigationSlice } from "./navigation";

// Combined store interface
export interface WorkbenchStore
  extends ViewsSlice,
    TabsSlice,
    LayoutSlice,
    NavigationSlice {}

/**
 * Combined workbench store using zustand slices
 */
export const useWorkbenchStore = create<WorkbenchStore>((...a) => ({
  ...createViewsSlice(...a),
  ...createTabsSlice(...a),
  ...createLayoutSlice(...a),
  ...createNavigationSlice(...a),
}));

// TODO: You might want to add some convenience functions that use multiple slices:

/**
 * High-level convenience functions that orchestrate multiple slices
 */

export function openFileInWorkbench(
  filePath: string,
  viewType: string,
  name?: string,
) {
  const store = useWorkbenchStore.getState();

  const existingTab = store.getTabByFilePath(filePath);
  if (existingTab) {
    store.setActiveTabInView(existingTab.viewId, existingTab.tab.id);
    store.setActiveView(existingTab.viewId);
    store.addToFocusHistory(existingTab.viewId, existingTab.tab.id);
    return existingTab.tab.id;
  }

  let targetViewId = store.activeViewId;
  if (!targetViewId || !store.hasView(targetViewId)) {
    targetViewId = store.addView();
  }

  const tabId = store.addTabToView(targetViewId, {
    name: name || filePath.split("/").pop() || "Untitled",
    filePath,
    viewType,
    isModified: false,
  });

  store.setActiveView(targetViewId);
  store.addToFocusHistory(targetViewId, tabId);

  return tabId;
}

export function closeTabInWorkbench(viewId: string, tabId: string) {
  const store = useWorkbenchStore.getState();

  store.removeTabFromView(viewId, tabId);

  const view = store.getView(viewId);
  if (view && view.tabs && view.tabs.length === 0) {
    store.removeView(viewId);

    if (store.activeViewId === viewId) {
      const remainingViews = store.views;
      if (remainingViews.length > 0) {
        store.setActiveView(remainingViews[0].id);
      } else {
        // if we have no views left, close all views.
        store.removeAllViews();
      }
    }
  }
}

export function splitViewWithFile(
  sourceViewId: string,
  filePath: string,
  viewType: string,
  name?: string,
) {
  const store = useWorkbenchStore.getState();

  const newViewId = store.splitView(sourceViewId);

  if (newViewId) {
    const tabId = store.addTabToView(newViewId, {
      name: name || filePath.split("/").pop() || "Untitled",
      filePath,
      viewType,
      isModified: false,
    });

    store.setActiveView(newViewId);
    store.addToFocusHistory(newViewId, tabId);

    return { viewId: newViewId, tabId };
  }

  return null;
}

export function splitViewWithActiveTab(sourceViewId: string) {
  const store = useWorkbenchStore.getState();

  const activeTab = store.getActiveTabInView(sourceViewId);
  if (!activeTab) {
    console.warn(`No active tab in view ${sourceViewId} to split`);
    return null;
  }

  const newViewId = store.splitView(sourceViewId);
  if (!newViewId) {
    console.warn("Failed to create new view for split");
    return null;
  }

  store.moveTabBetweenViews(activeTab.id, sourceViewId, newViewId);

  store.setActiveView(newViewId);
  store.addToFocusHistory(newViewId, activeTab.id);

  return {
    sourceViewId,
    newViewId,
    movedTabId: activeTab.id,
  };
}

export function splitViewWithNewTab(sourceViewId: string) {
  const store = useWorkbenchStore.getState();

  const newViewId = store.splitView(sourceViewId);
  if (!newViewId) {
    console.warn("Failed to create new view for split");
    return null;
  }

  const tabId = store.addTabToView(newViewId, {
    name: "Untitled",
    filePath: "",
    viewType: "text-editor", // Default view type
    isModified: false,
  });

  store.setActiveView(newViewId);
  store.addToFocusHistory(newViewId, tabId);

  return { viewId: newViewId, tabId };
}

// Export types for use in components
export type { ViewsSlice, TabsSlice, LayoutSlice, NavigationSlice };
export * from "./types";
