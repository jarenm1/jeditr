import { create } from "zustand";

/**
 * API function that plugins can expose for user keybind integration.
 * These functions become available as commands users can bind to custom keyboard shortcuts.
 *
 * @since 0.1.0
 * @example
 * ```typescript
 * // Plugin exposes API
 * const openModalAPI: PluginAPI = {
 *   id: 'openModal',
 *   name: 'Open Configuration Modal',
 *   description: 'Opens the plugin settings modal dialog',
 *   parameters: {
 *     tab: {
 *       type: 'string',
 *       default: 'general',
 *       description: 'Which settings tab to open'
 *     }
 *   }
 * };
 *
 * // User can bind in settings.json:
 * // { "key": "ctrl+,", "command": "user.MyPlugin.openModal", "args": { "tab": "advanced" } }
 * ```
 */
export interface PluginAPI {
  id: string;
  name: string;
  description?: string;
  parameters?: {
    [key: string]: {
      type: "string" | "number" | "boolean";
      default?: any;
      description?: string;
    };
  };
}

/**
 * Complete information about a registered plugin including its state and capabilities.
 * Tracks plugin lifecycle, exposed APIs, registered views, and metadata.
 *
 * @since 0.1.0
 * @example
 * ```typescript
 * const plugin: RegisteredPlugin = {
 *   name: 'GitIntegration',
 *   url: 'https://github.com/user/git-plugin/releases/latest/plugin.js',
 *   worker: gitWorker,
 *   isLoaded: true,
 *   version: '2.1.0',
 *   apis: [
 *     { id: 'commit', name: 'Git Commit', description: 'Commit staged changes' },
 *     { id: 'push', name: 'Git Push', description: 'Push to remote repository' }
 *   ],
 *   views: ['git-diff-viewer', 'git-history'],
 *   loadedAt: new Date('2024-01-01'),
 *   lastActivity: new Date('2024-01-01T10:30:00')
 * };
 * ```
 */
export interface RegisteredPlugin {
  name: string;
  url: string;
  worker: Worker;
  isLoaded: boolean;
  version?: string;
  /** API functions exposed by this plugin (see {@link PluginAPI} - callable functions users can bind to keyboard shortcuts) */
  apis: PluginAPI[];
  views: string[];
  loadedAt: Date;
  lastActivity?: Date;
}

interface PluginRegistryStore {
  plugins: Record<string, RegisteredPlugin>;

  addPlugin: (plugin: RegisteredPlugin) => void;
  removePlugin: (name: string) => void;
  updatePlugin: (name: string, updates: Partial<RegisteredPlugin>) => void;

  addPluginAPI: (pluginName: string, api: PluginAPI) => void;
  removePluginAPI: (pluginName: string, apiId: string) => void;
  getPluginAPI: (pluginName: string, apiId: string) => PluginAPI | null;
  getAllAPIs: () => Record<string, PluginAPI[]>;

  addPluginView: (pluginName: string, viewId: string) => void;
  removePluginView: (pluginName: string, viewId: string) => void;

  getPlugin: (name: string) => RegisteredPlugin | null;
  getAllPlugins: () => RegisteredPlugin[];
  getLoadedPlugins: () => RegisteredPlugin[];
}

/**
 * Central plugin registry store
 */
const usePluginRegistryStore = create<PluginRegistryStore>((set, get) => ({
  plugins: {},

  addPlugin: (plugin) =>
    set((state) => ({
      plugins: { ...state.plugins, [plugin.name]: plugin },
    })),

  removePlugin: (name) =>
    set((state) => {
      const { [name]: removed, ...rest } = state.plugins;
      return { plugins: rest };
    }),

  updatePlugin: (name, updates) =>
    set((state) => ({
      plugins: {
        ...state.plugins,
        [name]: state.plugins[name]
          ? { ...state.plugins[name], ...updates }
          : state.plugins[name],
      },
    })),

  addPluginAPI: (pluginName, api) =>
    set((state) => {
      const plugin = state.plugins[pluginName];
      if (!plugin) return state;

      const existingApis = plugin.apis.filter((a) => a.id !== api.id);
      return {
        plugins: {
          ...state.plugins,
          [pluginName]: {
            ...plugin,
            apis: [...existingApis, api],
            lastActivity: new Date(),
          },
        },
      };
    }),

  removePluginAPI: (pluginName, apiId) =>
    set((state) => {
      const plugin = state.plugins[pluginName];
      if (!plugin) return state;

      return {
        plugins: {
          ...state.plugins,
          [pluginName]: {
            ...plugin,
            apis: plugin.apis.filter((a) => a.id !== apiId),
          },
        },
      };
    }),

  getPluginAPI: (pluginName, apiId) => {
    const plugin = get().plugins[pluginName];
    return plugin?.apis.find((a) => a.id === apiId) || null;
  },

  getAllAPIs: () => {
    const plugins = get().plugins;
    const result: Record<string, PluginAPI[]> = {};

    Object.entries(plugins).forEach(([name, plugin]) => {
      if (plugin.apis.length > 0) {
        result[name] = plugin.apis;
      }
    });

    return result;
  },

  addPluginView: (pluginName, viewId) =>
    set((state) => {
      const plugin = state.plugins[pluginName];
      if (!plugin) return state;

      return {
        plugins: {
          ...state.plugins,
          [pluginName]: {
            ...plugin,
            views: [...plugin.views.filter((v) => v !== viewId), viewId],
          },
        },
      };
    }),

  removePluginView: (pluginName, viewId) =>
    set((state) => {
      const plugin = state.plugins[pluginName];
      if (!plugin) return state;

      return {
        plugins: {
          ...state.plugins,
          [pluginName]: {
            ...plugin,
            views: plugin.views.filter((v) => v !== viewId),
          },
        },
      };
    }),

  getPlugin: (name) => get().plugins[name] || null,

  getAllPlugins: () => Object.values(get().plugins),

  getLoadedPlugins: () =>
    Object.values(get().plugins).filter((p) => p.isLoaded),
}));

/**
 * Register a plugin in the central registry with initial empty APIs and views.
 * This establishes the plugin in the system before it can register specific capabilities.
 *
 * @param plugin - Plugin information excluding arrays that will be initialized
 * @since 0.1.0
 * @example
 * ```typescript
 * registerPlugin({
 *   name: 'GitIntegration',
 *   url: 'https://github.com/user/git-plugin/plugin.js',
 *   worker: gitWorker,
 *   isLoaded: true,
 *   version: '2.1.0'
 * });
 * ```
 */
export function registerPlugin(
  plugin: Omit<RegisteredPlugin, "apis" | "views" | "loadedAt">,
): void {
  const fullPlugin: RegisteredPlugin = {
    ...plugin,
    apis: [],
    views: [],
    loadedAt: new Date(),
  };

  usePluginRegistryStore.getState().addPlugin(fullPlugin);
  console.log(`Plugin registered: ${plugin.name}`);
}

/**
 * Unregister a plugin and clean up all its resources.
 * This removes the plugin from the registry, making its APIs and views unavailable.
 *
 * @param name - The unique name of the plugin to unregister
 * @since 0.1.0
 * @example
 * ```typescript
 * unregisterPlugin('GitIntegration');
 * ```
 */
export function unregisterPlugin(name: string): void {
  usePluginRegistryStore.getState().removePlugin(name);
  console.log(`Plugin unregistered: ${name}`);
}

/**
 * Register an API function that a plugin exposes for user keybind integration.
 * This makes the function available for users to bind to custom keyboard shortcuts.
 *
 * @param pluginName - Name of the plugin exposing the API
 * @param api - The API function definition (see {@link PluginAPI} - defines callable function with parameters and metadata)
 * @since 0.1.0
 * @example
 * ```typescript
 * registerPluginAPI('GitIntegration', {
 *   id: 'commit',
 *   name: 'Git Commit',
 *   description: 'Commit staged changes with a message',
 *   parameters: {
 *     message: {
 *       type: 'string',
 *       description: 'Commit message',
 *       default: 'Auto-commit'
 *     }
 *   }
 * });
 * ```
 */
export function registerPluginAPI(pluginName: string, api: PluginAPI): void {
  usePluginRegistryStore.getState().addPluginAPI(pluginName, api);
  console.log(`Plugin API registered: ${pluginName}.${api.id}`);
}

/**
 * Execute a plugin API function through web worker communication.
 * This is used by the keybind system to invoke plugin commands with parameters.
 *
 * @param pluginName - Name of the plugin whose API to call
 * @param apiId - ID of the specific API function to execute
 * @param parameters - Optional parameters to pass to the API function
 * @returns Promise that resolves with the API function's return value
 * @throws {Error} If plugin is not loaded or API doesn't exist
 * @throws {Error} If API call times out (5 second limit)
 * @throws {Error} If plugin API function throws an error
 * @since 0.1.0
 * @example
 * ```typescript
 * // Execute a simple API call
 * await executePluginAPI('GitIntegration', 'status');
 *
 * // Execute with parameters
 * await executePluginAPI('GitIntegration', 'commit', {
 *   message: 'Fix critical bug',
 *   amend: false
 * });
 *
 * // Handle errors
 * try {
 *   const result = await executePluginAPI('MyPlugin', 'complexOperation', { data: 'test' });
 *   console.log('Operation succeeded:', result);
 * } catch (error) {
 *   console.error('Plugin API call failed:', error.message);
 * }
 * ```
 */
export async function executePluginAPI(
  pluginName: string,
  apiId: string,
  parameters?: Record<string, any>,
): Promise<any> {
  const plugin = usePluginRegistryStore.getState().getPlugin(pluginName);
  if (!plugin || !plugin.isLoaded) {
    throw new Error(`Plugin ${pluginName} not loaded`);
  }

  const api = usePluginRegistryStore.getState().getPluginAPI(pluginName, apiId);
  if (!api) {
    throw new Error(`API ${apiId} not found in plugin ${pluginName}`);
  }

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`Plugin API call timeout: ${pluginName}.${apiId}`));
    }, 5000);

    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "api-response" && event.data.apiId === apiId) {
        clearTimeout(timeout);
        plugin.worker.removeEventListener("message", handleMessage);

        if (event.data.error) {
          reject(new Error(event.data.error));
        } else {
          resolve(event.data.result);
        }
      }
    };

    plugin.worker.addEventListener("message", handleMessage);
    plugin.worker.postMessage({
      type: "api-call",
      apiId,
      parameters: parameters || {},
    });
  });
}

/**
 * Get all available plugin APIs organized by plugin name.
 * Used by the keybind system to populate available commands and by UIs to show plugin capabilities.
 *
 * Each PluginAPI represents a callable function with metadata (id, name, description, parameters)
 * that users can bind to custom keyboard shortcuts.
 *
 * @returns Record mapping plugin names to their exposed API arrays
 * @since 0.1.0
 * @example
 * ```typescript
 * const allAPIs = getAllPluginAPIs();
 * console.log('Available plugin commands:');
 *
 * Object.entries(allAPIs).forEach(([pluginName, apis]) => {
 *   apis.forEach(api => {
 *     console.log(`  user.${pluginName}.${api.id} - ${api.description || api.name}`);
 *   });
 * });
 *
 * // Check if specific API is available
 * const gitAPIs = allAPIs['GitIntegration'];
 * const hasCommitAPI = gitAPIs?.some(api => api.id === 'commit');
 * ```
 */
export function getAllPluginAPIs(): Record<string, PluginAPI[]> {
  return usePluginRegistryStore.getState().getAllAPIs();
}

/**
 * Get detailed information about a specific plugin by its name.
 *
 * @param name - The unique plugin name to look up
 * @returns The plugin information if found, null otherwise
 * @since 0.1.0
 * @example
 * ```typescript
 * const plugin = getPlugin('GitIntegration');
 * if (plugin) {
 *   console.log(`Plugin: ${plugin.name} v${plugin.version}`);
 *   console.log(`Loaded: ${plugin.isLoaded}`);
 *   console.log(`APIs: ${plugin.apis.length}`);
 *   console.log(`Views: ${plugin.views.length}`);
 * } else {
 *   console.log('Plugin not found');
 * }
 * ```
 */
export function getPlugin(name: string): RegisteredPlugin | null {
  return usePluginRegistryStore.getState().getPlugin(name);
}

/**
 * Get all currently loaded and functional plugins.
 * Excludes plugins that are registered but failed to load or have been disabled.
 *
 * @returns Array of loaded plugin information
 * @since 0.1.0
 * @example
 * ```typescript
 * const loadedPlugins = getLoadedPlugins();
 * console.log(`${loadedPlugins.length} plugins are currently active`);
 *
 * loadedPlugins.forEach(plugin => {
 *   const uptime = Date.now() - plugin.loadedAt.getTime();
 *   console.log(`${plugin.name}: running for ${uptime}ms`);
 * });
 * ```
 */
export function getLoadedPlugins(): RegisteredPlugin[] {
  return usePluginRegistryStore.getState().getLoadedPlugins();
}
