/**
 * @fileoverview
 * @author @jarenm1
 *
 * Jeditr Plugin API
 *
 * Provides a unified interface for plugin management including:
 * - Loading local and GitHub plugins
 * - Plugin configuration and installation
 * - Dynamic plugin management
 * - Plugin registry and types
 */

// Core plugin functionality
export * from "./loader";
export * from "./githubLoader";

// Plugin registry (renamed exports to avoid conflicts)
export {
  registerPlugin,
  unregisterPlugin,
  registerPluginAPI,
  executePluginAPI,
  getAllPluginAPIs,
  getPlugin,
  getLoadedPlugins as getRegisteredPlugins,
  type PluginAPI,
  type RegisteredPlugin,
} from "./pluginRegistry";

// Legacy plugin types for backward compatibility
export interface BottomBarPlugin {
  id: string;
  render: () => React.ReactNode;
  order?: number;
}

export interface EditorPanePlugin {
  contentType: string;
  render: (props: any) => React.ReactNode;
}

export type LanguageDetector = (
  filePath: string,
  content?: string,
) => string | undefined;

export interface LanguagePlugin {
  id: string;
  names: string[];
  extensions: string[];
  loader: () => Promise<any>; // LanguageSupport from @codemirror/language
  detectors?: LanguageDetector[];
  priority?: number;
}

// Legacy registry implementations (deprecated)
export const bottomBarRegistry: BottomBarPlugin[] = [];
export const editorPaneRegistry: EditorPanePlugin[] = [];

export function registerBottomBarPlugin(plugin: BottomBarPlugin) {
  bottomBarRegistry.push(plugin);
}

export function registerEditorPanePlugin(plugin: EditorPanePlugin) {
  editorPaneRegistry.push(plugin);
}
