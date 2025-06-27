/**
 * @fileoverview
 * @author @jarenm1
 *
 * Views Slice
 * Manages view containers in the workbench
 */

import type { StateCreator } from "zustand";
import type { ViewContainer } from "./types";
import { nanoid } from "nanoid";

export interface ViewsSlice {
  views: ViewContainer[];

  // View container management
  addView: () => string;
  removeView: (viewId: string) => void;
  getView: (viewId: string) => ViewContainer | null;
  hasView: (viewId: string) => boolean;
  removeAllViews: () => void;

  // View positioning (for advanced layouts)
  updateViewPosition: (
    viewId: string,
    position: ViewContainer["position"],
  ) => void;
}

// Combined store interface for cross-slice coordination
interface CombinedStoreForViews {
  addViewToOrder: (viewId: string, position?: number) => void;
  removeViewFromOrder: (viewId: string) => void;
}

export const createViewsSlice: StateCreator<
  ViewsSlice & CombinedStoreForViews,
  [],
  [],
  ViewsSlice
> = (set, get) => ({
  views: [],

  addView: () => {
    const newViewId = `view-${nanoid()}`;
    const newView: ViewContainer = {
      id: newViewId,
      tabs: [],
      activeTabId: null,
      position: { x: 0, width: 0 },
    };
    
    set((state) => ({
      views: [...state.views, newView],
    }));
    
    // TODO: Add the view to the layout order as well
    const combinedState = get() as ViewsSlice & CombinedStoreForViews;
    combinedState.addViewToOrder(newViewId);
    
    return newViewId;
  },

  removeView: (viewId) =>
    set((state) => {
      const viewToRemove = state.views.find((view) => view.id === viewId);
      if (!viewToRemove) {
        return state; // View not found, do nothing
      }

      // TODO: Remove from layout order as well
      const combinedState = get() as ViewsSlice & CombinedStoreForViews;
      combinedState.removeViewFromOrder(viewId);

      return {
        views: state.views.filter((view) => view.id !== viewId),
      };
    }),

  getView: (viewId) => get().views.find((view) => view.id === viewId) || null,

  hasView: (viewId) => get().views.some((view) => view.id === viewId),

  removeAllViews: () =>
    set((state) => {
      // TODO: Remove all views from layout order as well
      const combinedState = get() as ViewsSlice & CombinedStoreForViews;
      state.views.forEach(view => {
        combinedState.removeViewFromOrder(view.id);
      });
      
      return { views: [] };
    }),

  updateViewPosition: (viewId, position) =>
    set((state) => ({
      views: state.views.map((view) =>
        view.id === viewId ? { ...view, position } : view,
      ),
    })),
});
