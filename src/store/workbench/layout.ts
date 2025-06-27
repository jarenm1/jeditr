/**
 * @fileoverview
 * @author @jarenm1
 *
 * Layout Slice
 * Manages vertical view splitting and resizing
 * Layout is ALWAYS vertical splits - side by side views
 */

import type { StateCreator } from "zustand";

// Type for view dimensions calculation
export interface ViewDimensions {
  viewId: string;
  x: number;        // Horizontal position (varies)
  width: number;    // View width (varies based on split ratios)
  // Note: y is always 0, height is always containerHeight for vertical splits
}

// Type for split ratios - ensures they're between 0 and 1
export type SplitRatio = number; // Should be between 0.1 and 0.9

// Interface for layout state and operations
export interface LayoutSlice {
  splitRatios: SplitRatio[]; // Array of ratios for vertical splits
  activeViewId: string | null;
  viewOrder: string[]; // Left-to-right order of view IDs

  // Split management
  setSplitRatio: (index: number, ratio: SplitRatio) => void;
  setSplitRatios: (ratios: SplitRatio[]) => void;
  addSplit: () => void; // Adds a new vertical split
  removeSplit: (index: number) => void; // Removes a split

  // View operations
  setActiveView: (viewId: string) => void;
  getActiveView: () => string | null; // Returns activeViewId (typed properly)

  // Layout operations
  splitView: (viewId: string) => string; // Always vertical split
  mergeViews: (viewId1: string, viewId2: string) => void;
  swapViews: (viewId1: string, viewId2: string) => void;

  // Layout utilities - simplified for vertical-only layout
  calculateViewDimensions: (containerWidth: number) => ViewDimensions[];
  getViewOrder: () => string[];
  setViewOrder: (viewIds: string[]) => void;
  getTotalSplits: () => number;
  
  // View order management
  addViewToOrder: (viewId: string, position?: number) => void;
  removeViewFromOrder: (viewId: string) => void;
  getViewPosition: (viewId: string) => number;
}

// Type for combined store properties that this slice needs access to
// This will be properly typed when slices are combined
interface CombinedStoreForLayout {
  views: Array<{ id: string; tabs: any[] }>;
  addView: () => string;
  removeView: (viewId: string) => void;
  hasView: (viewId: string) => boolean;
  moveTabBetweenViews: (tabId: string, fromViewId: string, toViewId: string) => void;
  removeViewFromOrder: (viewId: string) => void;
}

export const createLayoutSlice: StateCreator<
  LayoutSlice,
  [],
  [],
  LayoutSlice
> = (set, get) => ({
  splitRatios: [], // Empty = single view, [0.5] = 50/50 split, [0.33, 0.33] = 3-way split, etc.
  activeViewId: null,
  viewOrder: [], // Left-to-right order of view IDs

  // TODO: Implement setSplitRatio - updates a specific split ratio with type safety
  setSplitRatio: (index: number, ratio: SplitRatio) =>
    set((state) => {
      // TODO: Validate ratio is between 0.1 and 0.9 to prevent views from becoming too small
      const clampedRatio: SplitRatio = Math.max(0.1, Math.min(0.9, ratio));
      const newRatios = [...state.splitRatios];

      if (index < newRatios.length) {
        newRatios[index] = clampedRatio;

        // TODO: Normalize ratios to sum to 1
        const total = newRatios.reduce((acc, r) => acc + r, 0);
        if (total > 1) {
          const overflow = total - 1;
          // Distribute overflow reduction proportionally
          for (let i = 0; i < newRatios.length; i++) {
            if (i !== index) {
              newRatios[i] = Math.max(
                0.1, 
                newRatios[i] - overflow * (newRatios[i] / (total - clampedRatio))
              );
            }
          }
        }
      }

      return { splitRatios: newRatios };
    }),

  // TODO: Implement setSplitRatios - sets all split ratios at once with validation
  setSplitRatios: (ratios: SplitRatio[]) =>
    set(() => {
      // TODO: Validate all ratios and ensure they make sense
      const validatedRatios: SplitRatio[] = ratios.map((r) =>
        Math.max(0.1, Math.min(0.9, r)) as SplitRatio
      );
      const total = validatedRatios.reduce((acc, r) => acc + r, 0);

      // TODO: Normalize if total is not 1
      if (total !== 1 && total > 0) {
        const normalizedRatios: SplitRatio[] = validatedRatios.map(
          (r) => (r / total) as SplitRatio
        );
        return { splitRatios: normalizedRatios };
      }

      return { splitRatios: validatedRatios };
    }),

  // TODO: Implement addSplit - adds a new vertical split
  addSplit: () =>
    set((state) => {
      // TODO: When adding a split, distribute space evenly
      const currentSplits = state.splitRatios.length;
      const newSplitCount = currentSplits + 1;
      const evenRatio: SplitRatio = (1 / (newSplitCount + 1)) as SplitRatio;
      const newRatios: SplitRatio[] = Array(newSplitCount).fill(evenRatio);

      return { splitRatios: newRatios };
    }),

  // TODO: Implement removeSplit - removes a split with proper index validation
  removeSplit: (index: number) =>
    set((state) => {
      if (index < 0 || index >= state.splitRatios.length) {
        console.warn(`Invalid split index: ${index}`);
        return state;
      }

      // TODO: Remove the split and redistribute space
      const newRatios = state.splitRatios.filter((_, i) => i !== index);

      // TODO: If no splits left, we have a single view
      if (newRatios.length === 0) {
        return { splitRatios: [] };
      }

      // TODO: Redistribute space evenly
      const total = newRatios.reduce((acc, r) => acc + r, 0);
      const normalizedRatios: SplitRatio[] = newRatios.map(
        (r) => (r / total) as SplitRatio
      );

      return { splitRatios: normalizedRatios };
    }),

  // TODO: Implement setActiveView - sets which view has focus with validation
  setActiveView: (viewId: string) =>
    set((state) => {
      // TODO: Verify view exists in viewOrder before setting as active
      if (!state.viewOrder.includes(viewId)) {
        console.warn(`View ${viewId} does not exist in viewOrder.`);
        return state;
      }
      return { activeViewId: viewId };
    }),

  // TODO: Implement getActiveView - gets the currently active view ID (type-safe)
  getActiveView: () => {
    const state = get();
    return state.activeViewId;
  },

  // TODO: Implement splitView - creates a new view by splitting existing one vertically
  splitView: (viewId: string) => {
    const state = get();
    
    // TODO: Find the index of the view being split
    const splitIndex = state.viewOrder.indexOf(viewId);
    if (splitIndex === -1) {
      console.error("View to split not found in viewOrder.");
      return "";
    }
    
    // TODO: Create a new view through the views slice
    const combinedState = get() as LayoutSlice & CombinedStoreForLayout;
    const newViewId = combinedState.addView();
    
    // TODO: Move the new view to the correct position in the order
    combinedState.removeViewFromOrder(newViewId);
    get().addViewToOrder(newViewId, splitIndex + 1);
    get().addSplit();
    
    return newViewId;
  },

  // TODO: Implement mergeViews - combines two adjacent views
  mergeViews: (viewId1: string, viewId2: string) => {
    const state = get();
    
    // TODO: Validate both views exist
    if (!state.viewOrder.includes(viewId1) || !state.viewOrder.includes(viewId2)) {
      console.error("One or both views not found for merging.");
      return;
    }
    
    console.log(`TODO: Merge views ${viewId1} and ${viewId2}`);
    
    // TODO: Remove view2 from order
    get().removeViewFromOrder(viewId2);
    
    // TODO: Find which split index to remove
    const view2Index = state.viewOrder.indexOf(viewId2);
    if (view2Index > 0) {
      get().removeSplit(view2Index - 1);
    }
  },

  // TODO: Implement swapViews - swaps the positions of two adjacent views
  swapViews: (viewId1: string, viewId2: string) =>
    set((state) => {
      const index1 = state.viewOrder.indexOf(viewId1);
      const index2 = state.viewOrder.indexOf(viewId2);

      if (index1 === -1 || index2 === -1) {
        console.error("One or both views not found for swapping.");
        return state;
      }

      const newViewOrder = [...state.viewOrder];
      newViewOrder[index1] = viewId2;
      newViewOrder[index2] = viewId1;
      
      return { viewOrder: newViewOrder };
    }),

  // TODO: Implement calculateViewDimensions - calculates pixel dimensions for vertical layout
  calculateViewDimensions: (containerWidth: number): ViewDimensions[] => {
    const state = get();

    if (state.viewOrder.length === 0) {
      return [];
    }

    if (state.splitRatios.length === 0) {
      // Single view case
      return [
        {
          viewId: state.viewOrder[0],
          x: 0,
          width: containerWidth,
        },
      ];
    }

    // TODO: Calculate widths for multiple views (all same height)
    const dimensions: ViewDimensions[] = [];
    let currentX = 0;

    for (let i = 0; i < state.viewOrder.length; i++) {
      const viewId = state.viewOrder[i];
      
      // TODO: Get ratio for this view or calculate remaining space
      const ratio =
        i < state.splitRatios.length
          ? state.splitRatios[i]
          : 1 - state.splitRatios.reduce((a, b) => a + b, 0);
      
      const width = Math.max(1, containerWidth * ratio); // Ensure minimum 1px width

      dimensions.push({
        viewId,
        x: currentX,
        width,
      });

      currentX += width;
    }

    return dimensions;
  },

  // TODO: Implement getViewOrder - gets the current left-to-right order of views
  getViewOrder: () => {
    const state = get();
    return [...state.viewOrder]; // Return copy to prevent mutation
  },

  // TODO: Implement setViewOrder - reorders views (for drag & drop)
  setViewOrder: (viewIds: string[]) =>
    set((state) => {
      // TODO: Validate that all view IDs are unique and valid
      const uniqueViewIds = Array.from(new Set(viewIds));
      if (uniqueViewIds.length !== viewIds.length) {
        console.warn("Duplicate view IDs detected in setViewOrder");
      }
      
      return { viewOrder: uniqueViewIds };
    }),

  // TODO: Implement getTotalSplits - gets the number of current splits
  getTotalSplits: () => {
    const state = get();
    return state.splitRatios.length;
  },

  // TODO: Implement addViewToOrder - adds a view to the order at specified position
  addViewToOrder: (viewId: string, position?: number) =>
    set((state) => {
      // TODO: Check if view already exists
      if (state.viewOrder.includes(viewId)) {
        console.warn(`View ${viewId} already exists in viewOrder`);
        return state;
      }

      const newViewOrder = [...state.viewOrder];
      const insertPosition = position ?? newViewOrder.length;
      
      // TODO: Validate position
      const safePosition = Math.max(0, Math.min(insertPosition, newViewOrder.length));
      newViewOrder.splice(safePosition, 0, viewId);

      return { viewOrder: newViewOrder };
    }),

  // TODO: Implement removeViewFromOrder - removes a view from the order
  removeViewFromOrder: (viewId: string) =>
    set((state) => {
      const viewIndex = state.viewOrder.indexOf(viewId);
      if (viewIndex === -1) {
        console.warn(`View ${viewId} not found in viewOrder`);
        return state;
      }

      const newViewOrder = state.viewOrder.filter(id => id !== viewId);
      console.log(`[Layout] Removing view ${viewId} at index ${viewIndex}. Remaining views: ${newViewOrder.length}`);
      
      // TODO: Handle split ratio removal and redistribution
      let newSplitRatios = [...state.splitRatios];
      
      if (newViewOrder.length === 0) {
        // No views left, clear split ratios
        newSplitRatios = [];
        console.log(`[Layout] No views remaining, cleared split ratios`);
      } else if (newViewOrder.length === 1) {
        // Only one view left, no splits needed
        newSplitRatios = [];
        console.log(`[Layout] Single view remaining, cleared split ratios`);
      } else {
        // Multiple views remaining, need to handle split removal and redistribution
        console.log(`[Layout] Multiple views remaining, redistributing splits. Old ratios:`, state.splitRatios);
        
        // Find which split to remove based on view position
        let splitIndexToRemove = -1;
        
        if (viewIndex === 0) {
          // Removing first view - remove the first split (if it exists)
          splitIndexToRemove = 0;
        } else if (viewIndex === state.viewOrder.length - 1) {
          // Removing last view - remove the split before it
          splitIndexToRemove = viewIndex - 1;
        } else {
          // Removing middle view - remove the split after it
          splitIndexToRemove = viewIndex;
        }
        
        // Remove the split and redistribute space
        if (splitIndexToRemove >= 0 && splitIndexToRemove < newSplitRatios.length) {
          newSplitRatios.splice(splitIndexToRemove, 1);
          console.log(`[Layout] Removed split at index ${splitIndexToRemove}`);
        }
        
        // Redistribute remaining ratios to sum to 1
        if (newSplitRatios.length > 0) {
          const currentTotal = newSplitRatios.reduce((sum, ratio) => sum + ratio, 0);
          const remainingSpace = 1 - currentTotal;
          
          if (remainingSpace > 0) {
            // Distribute the remaining space evenly among existing ratios
            const redistributionPerRatio = remainingSpace / newSplitRatios.length;
            newSplitRatios = newSplitRatios.map(ratio => 
              Math.min(0.9, Math.max(0.1, ratio + redistributionPerRatio)) as SplitRatio
            );
          }
          
          // Ensure total doesn't exceed 1 and normalize if needed
          const finalTotal = newSplitRatios.reduce((sum, ratio) => sum + ratio, 0);
          if (finalTotal > 1) {
            newSplitRatios = newSplitRatios.map(ratio => 
              (ratio / finalTotal) as SplitRatio
            );
          }
        }
        
        console.log(`[Layout] New split ratios:`, newSplitRatios);
      }

      return { 
        viewOrder: newViewOrder,
        splitRatios: newSplitRatios
      };
    }),

  // TODO: Implement getViewPosition - gets the position of a view in the order
  getViewPosition: (viewId: string) => {
    const state = get();
    return state.viewOrder.indexOf(viewId);
  },
});
