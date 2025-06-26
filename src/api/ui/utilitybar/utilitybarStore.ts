import { create } from "zustand";
import React from "react";

/**
 * Interface for a utility bar widget that appears in the bottom status bar.
 * Widgets are automatically sorted by order and can conflict-resolve by priority.
 * 
 * @since 0.1.0
 * @example
 * ```typescript
 * const languageWidget: UtilityBarWidget = {
 *   id: 'language-display',
 *   render: () => <LanguageIndicator />,
 *   order: 100, // Appears towards the right
 *   priority: 10 // Higher priority than other language widgets
 * };
 * ```
 */
export interface UtilityBarWidget {
  id: string;
  render: () => React.ReactNode;
  order?: number;
  priority?: number;
}

/**
 * Store interface for the utility bar
 */
interface UtilityBarStore {  
  widgets: UtilityBarWidget[];
  register: (widget: UtilityBarWidget) => void;
  unregister: (id: string) => void;
  getSortedWidgets: () => UtilityBarWidget[];
}

/**
 * Zustand store for managing utility bar widgets
 */
export const useUtilityBarStore = create<UtilityBarStore>((set, get) => ({
  widgets: [],
  
  register: (widget) =>
    set((state) => {
      const filtered = state.widgets.filter((w) => w.id !== widget.id);
      
      const newWidgets = [...filtered, widget].sort(
        (a, b) => (a.order ?? 0) - (b.order ?? 0)
      );
      
      return { widgets: newWidgets };
    }),
    
  unregister: (id) =>
    set((state) => ({
      widgets: state.widgets.filter((w) => w.id !== id)
    })),
    
  getSortedWidgets: () => {
    const state = get();
    return state.widgets.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }
}));

/**
 * Register a widget to appear in the utility bar.
 * If a widget with the same ID already exists, it will be replaced.
 * 
 * @param widget - The widget configuration to register
 * @since 0.1.0
 * @example
 * ```typescript
 * registerUtilityBarWidget({
 *   id: 'git-status',
 *   render: () => <GitBranchIndicator />,
 *   order: 50
 * });
 * ```
 */
export function registerUtilityBarWidget(widget: UtilityBarWidget): void {
  useUtilityBarStore.getState().register(widget);
}

/**
 * Remove a widget from the utility bar by its ID.
 * 
 * @param id - The unique ID of the widget to remove
 * @since 0.1.0
 * @example
 * ```typescript
 * unregisterUtilityBarWidget('git-status');
 * ```
 */
export function unregisterUtilityBarWidget(id: string): void {
  useUtilityBarStore.getState().unregister(id);
}
