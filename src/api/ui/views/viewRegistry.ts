import { create } from "zustand";
import type { DefaultView, PluginView, PluginViewRegistration } from "./types";

interface ViewRegistryStore {
  defaultView: DefaultView | null;
  pluginViews: PluginView[];

  setDefaultView: (view: DefaultView) => void;
  addPluginView: (view: PluginView) => void;
  removePluginView: (id: string) => void;
  removePluginViewsByPlugin: (pluginName: string) => void;
  getView: (id: string) => DefaultView | PluginView | null;
  getViewsForFileType: (fileType: string, mimeType?: string) => PluginView[];
}

/**
 * Zustand store for view registry
 */
const useViewRegistryStore = create<ViewRegistryStore>((set, get) => ({
  defaultView: null,
  pluginViews: [],

  setDefaultView: (view) => set({ defaultView: view }),

  addPluginView: (view) =>
    set((state) => {
      const filtered = state.pluginViews.filter((v) => v.id !== view.id);
      return { pluginViews: [...filtered, view] };
    }),

  removePluginView: (id) =>
    set((state) => ({
      pluginViews: state.pluginViews.filter((v) => v.id !== id),
    })),

  removePluginViewsByPlugin: (pluginName) =>
    set((state) => ({
      pluginViews: state.pluginViews.filter((v) => v.pluginName !== pluginName),
    })),

  getView: (id) => {
    const state = get();
    if (state.defaultView?.id === id) return state.defaultView;
    return state.pluginViews.find((v) => v.id === id) || null;
  },

  getViewsForFileType: (fileType, mimeType) => {
    const state = get();
    return state.pluginViews.filter((view) => {
      const matchesFileType = view.fileTypes.includes(fileType);
      const matchesMimeType = mimeType && view.mimeTypes?.includes(mimeType);
      return matchesFileType || matchesMimeType;
    });
  },
}));

/**
 * Register the default view that handles all file types not claimed by specialized views.
 * There can only be one default view (typically a text editor).
 *
 * @param view - The default view configuration
 * @throws {Error} If the view is invalid
 * @since 0.1.0
 * @example
 * ```typescript
 * registerDefaultView({
 *   id: 'text-editor',
 *   name: 'Text Editor',
 *   render: (props) => <TextEditor {...props} />
 * });
 * ```
 */
export function registerDefaultView(view: DefaultView): void {
  useViewRegistryStore.getState().setDefaultView(view);
  console.log(`Default view registered: ${view.name}`);
}

/**
 * Register a specialized view from a plugin for specific file types.
 * Plugin views run in web workers and have full control over their UI.
 *
 * @param pluginName - Name of the plugin registering the view
 * @param registration - View configuration data
 * @param worker - Web worker instance that handles the view
 * @throws {Error} If the registration data is invalid
 * @since 0.1.0
 * @example
 * ```typescript
 * registerView('MyPlugin', {
 *   id: 'svg-editor',
 *   name: 'SVG Editor',
 *   fileTypes: ['.svg'],
 *   mimeTypes: ['image/svg+xml'],
 *   priority: 10
 * }, pluginWorker);
 * ```
 */
export function registerView(
  pluginName: string,
  registration: PluginViewRegistration,
  worker: Worker,
): void {
  const view: PluginView = {
    ...registration,
    pluginName,
    worker,
  };

  useViewRegistryStore.getState().addPluginView(view);
  console.log(`Plugin view registered: ${view.name} (${pluginName})`);
}

/**
 * Unregister a view by its unique ID.
 *
 * @param id - The view ID to unregister
 * @since 0.1.0
 * @example
 * ```typescript
 * unregisterView('svg-editor');
 * ```
 */
export function unregisterView(id: string): void {
  useViewRegistryStore.getState().removePluginView(id);
}

/**
 * Unregister all views registered by a specific plugin.
 * Useful for cleanup when a plugin is unloaded.
 *
 * @param pluginName - Name of the plugin whose views to remove
 * @since 0.1.0
 * @example
 * ```typescript
 * unregisterPluginViews('MyPlugin');
 * ```
 */
export function unregisterPluginViews(pluginName: string): void {
  useViewRegistryStore.getState().removePluginViewsByPlugin(pluginName);
}

/**
 * Get a view by its unique ID.
 *
 * @param id - The view ID to look up
 * @returns The view if found, null otherwise
 * @since 0.1.0
 * @example
 * ```typescript
 * const view = getView('text-editor');
 * if (view) {
 *   console.log(`Found view: ${view.name}`);
 * }
 * ```
 */
export function getView(id: string): DefaultView | PluginView | null {
  return useViewRegistryStore.getState().getView(id);
}

/**
 * Find the best view to handle a specific file based on file extension and MIME type.
 * Uses priority system to resolve conflicts between multiple compatible views.
 * Falls back to default view if no specialized views can handle the file.
 *
 * @param filePath - Full path to the file
 * @param mimeType - Optional MIME type for additional matching
 * @returns The best view to handle the file
 * @throws {Error} If no default view is registered and no specialized views match
 * @since 0.1.0
 * @example
 * ```typescript
 * // Get view for an SVG file
 * const view = getViewForFile('/path/to/image.svg', 'image/svg+xml');
 * console.log(`Using view: ${view.name}`);
 *
 * // Get view for unknown file type (falls back to default)
 * const defaultView = getViewForFile('/path/to/config.unknown');
 * ```
 */
export function getViewForFile(
  filePath: string,
  mimeType?: string,
): DefaultView | PluginView {
  const extension = filePath.split(".").pop()?.toLowerCase();
  const fileType = extension ? `.${extension}` : "";

  const { getViewsForFileType, defaultView } = useViewRegistryStore.getState();
  const compatibleViews = getViewsForFileType(fileType, mimeType);

  if (compatibleViews.length === 0) {
    if (!defaultView) {
      throw new Error("No default view registered");
    }
    return defaultView;
  }

  return compatibleViews.sort(
    (a, b) => (b.priority || 0) - (a.priority || 0),
  )[0];
}

/**
 * Get all registered views in the system.
 * Useful for debugging or building plugin management UIs.
 *
 * @returns Object containing the default view and all plugin views
 * @since 0.1.0
 * @example
 * ```typescript
 * const { default: defaultView, plugins } = getAllViews();
 * console.log(`Default: ${defaultView?.name}`);
 * console.log(`Plugin views: ${plugins.map(v => v.name).join(', ')}`);
 * ```
 */
export function getAllViews(): {
  default: DefaultView | null;
  plugins: PluginView[];
} {
  const { defaultView, pluginViews } = useViewRegistryStore.getState();
  return { default: defaultView, plugins: pluginViews };
}
