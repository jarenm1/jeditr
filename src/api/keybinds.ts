// Keybind API - enhanced from old plugin keybind system
import type { Keybind, PluginKeybind } from "./types";
import {
  registerKeybind as registerKeybindService,
  unregisterKeybind as unregisterKeybindService,
} from "../services/keybinds";
import {
  executePluginAPI,
  getAllPluginAPIs,
} from "./plugins/pluginRegistry";

// TODO: Import stores for built-in handlers
import { useWorkbenchStore } from "../store/workbench";
import { useNotificationStore } from "./ui/notifications/notificationStore";

// Store for plugin workers to enable plugin action dispatch
const pluginWorkers = new Map<string, Worker>();

/**
 * Built-in keybind handler registry for settings-based keybinds.
 * Maps keybind IDs to their handler functions.
 */
const builtinHandlers: Record<string, () => void> = {};

/**
 * Register a built-in keybind handler that can be used from settings.json.
 * This allows built-in functionality to be bound via settings instead of hardcoding.
 *
 * @param id - Unique identifier for the keybind
 * @param handler - Function to execute when the keybind is triggered
 * @param description - Optional description for the keybind
 * @since 0.1.0
 * @example
 * ```typescript
 * registerBuiltinHandler('workbench.newView', () => {
 *   const { addView, setActiveView } = useWorkbenchStore.getState();
 *   const newViewId = addView();
 *   setActiveView(newViewId);
 * }, 'Create new view');
 *
 * // Now users can configure this in settings.json:
 * // "keybinds": {
 * //   "workbench.newView": { "keys": ["Ctrl", "N"], "enabled": true }
 * // }
 * ```
 */
export function registerBuiltinHandler(
  id: string,
  handler: () => void,
  description?: string,
): void {
  builtinHandlers[id] = handler;
}

/**
 * Register a keybind with a direct handler function for built-in functionality.
 * Use this for core editor features that don't require plugin communication.
 *
 * @param keybind - Complete keybind definition with handler function
 * @since 1.0.0
 * @example
 * ```typescript
 * registerDirectKeybind({
 *   id: 'editor.save',
 *   keys: ['Ctrl', 'S'],
 *   description: 'Save current file',
 *   handler: () => saveCurrentFile()
 * });
 *
 * // Multiple key combinations
 * registerDirectKeybind({
 *   id: 'editor.quickOpen',
 *   keys: ['Ctrl', 'P'],
 *   description: 'Quick open file',
 *   handler: () => showFilePickerModal()
 * });
 * ```
 */
export function registerDirectKeybind(keybind: Keybind): void {
  registerKeybindService(keybind);
}

/**
 * Register a keybind for legacy plugin that sends action messages to a web worker.
 * This is for backward compatibility - new plugins should use the API system.
 *
 * @param pluginName - Unique name of the plugin
 * @param keybind - Plugin keybind definition with action instead of handler
 * @param worker - Web worker instance to receive action messages
 * @since 0.1.0
 * @deprecated Use registerPluginAPIKeybind for new plugins
 * @example
 * ```typescript
 * registerPluginKeybind('LegacyPlugin', {
 *   id: 'legacyPlugin.openModal',
 *   keys: ['Ctrl', 'Shift', 'M'],
 *   description: 'Open plugin modal',
 *   action: 'openModal'
 * }, pluginWorker);
 * ```
 */
export function registerPluginKeybind(
  pluginName: string,
  keybind: PluginKeybind,
  worker: Worker,
): void {
  pluginWorkers.set(pluginName, worker);

  registerKeybindService({
    id: keybind.id,
    keys: keybind.keys,
    description: keybind.description,
    handler: () => {
      worker.postMessage({
        type: "plugin-action",
        action: keybind.action,
      });
    },
  });
}

/**
 * Unregister a keybind by its unique ID.
 *
 * @param id - The keybind ID to remove
 * @since 1.0.0
 * @example
 * ```typescript
 * unregisterKeybind('editor.save');
 * unregisterKeybind('user.MyPlugin.openModal');
 * ```
 */
export function unregisterKeybind(id: string): void {
  unregisterKeybindService(id);
}

/**
 * Unregister all keybinds registered by a specific plugin.
 * Useful for cleanup when a plugin is unloaded.
 *
 * @param pluginName - Name of the plugin whose keybinds to remove
 * @since 1.0.0
 * @example
 * ```typescript
 * unregisterPluginKeybinds('MyPlugin');
 * ```
 */
export function unregisterPluginKeybinds(pluginName: string): void {
  // This would need to be implemented in the keybinds service
  // to track which keybinds belong to which plugins
  console.warn("unregisterPluginKeybinds not fully implemented yet");
}

/**
 * Register multiple keybinds simultaneously for bulk registration.
 * More efficient than calling registerDirectKeybind multiple times.
 *
 * @param keybinds - Array of keybind definitions to register
 * @since 1.0.0
 * @example
 * ```typescript
 * registerKeybinds([
 *   { id: 'file.new', keys: ['Ctrl', 'N'], description: 'New file', handler: newFile },
 *   { id: 'file.open', keys: ['Ctrl', 'O'], description: 'Open file', handler: openFile },
 *   { id: 'file.save', keys: ['Ctrl', 'S'], description: 'Save file', handler: saveFile }
 * ]);
 * ```
 */
export function registerKeybinds(keybinds: Keybind[]): void {
  keybinds.forEach((keybind) => registerKeybindService(keybind));
}

/**
 * Register multiple legacy plugin keybinds at once.
 *
 * @param pluginName - Name of the plugin registering the keybinds
 * @param keybinds - Array of plugin keybind definitions
 * @param worker - Web worker instance for the plugin
 * @since 1.0.0
 * @deprecated Use registerPluginAPIKeybind for new plugins
 * @example
 * ```typescript
 * registerPluginKeybinds('LegacyPlugin', [
 *   { id: 'legacy.action1', keys: ['Ctrl', '1'], description: 'Action 1', action: 'action1' },
 *   { id: 'legacy.action2', keys: ['Ctrl', '2'], description: 'Action 2', action: 'action2' }
 * ], pluginWorker);
 * ```
 */
export function registerPluginKeybinds(
  pluginName: string,
  keybinds: PluginKeybind[],
  worker: Worker,
): void {
  keybinds.forEach((keybind) =>
    registerPluginKeybind(pluginName, keybind, worker),
  );
}

/**
 * Get the web worker instance for a specific plugin.
 * Used internally for managing plugin communication.
 *
 * @param pluginName - Name of the plugin
 * @returns The worker instance if found, undefined otherwise
 * @since 1.0.0
 * @example
 * ```typescript
 * const worker = getPluginWorker('MyPlugin');
 * if (worker) {
 *   worker.postMessage({ type: 'custom-action', data: 'test' });
 * }
 * ```
 */
export function getPluginWorker(pluginName: string): Worker | undefined {
  return pluginWorkers.get(pluginName);
}

/**
 * Remove a plugin's worker reference from the keybind system.
 * Used during plugin cleanup and unloading.
 *
 * @param pluginName - Name of the plugin whose worker to remove
 * @since 1.0.0
 * @example
 * ```typescript
 * removePluginWorker('MyPlugin');
 * ```
 */
export function removePluginWorker(pluginName: string): void {
  pluginWorkers.delete(pluginName);
}

/**
 * Register a keybind that calls a plugin API function with optional parameters.
 * This is the modern way to bind plugin functionality to keyboard shortcuts.
 *
 * @param keybind - Complete keybind configuration for plugin API call
 * @since 1.0.0
 * @example
 * ```typescript
 * // Simple API call with no parameters
 * registerPluginAPIKeybind({
 *   id: 'user.MyPlugin.refreshData',
 *   keys: ['F5'],
 *   description: 'Refresh plugin data',
 *   pluginName: 'MyPlugin',
 *   apiId: 'refreshData'
 * });
 *
 * // API call with parameters
 * registerPluginAPIKeybind({
 *   id: 'user.GitPlugin.commit',
 *   keys: ['Ctrl', 'Shift', 'C'],
 *   description: 'Quick commit with default message',
 *   pluginName: 'GitPlugin',
 *   apiId: 'commit',
 *   parameters: {
 *     message: 'Quick commit',
 *     amend: false
 *   }
 * });
 * ```
 */
export function registerPluginAPIKeybind(keybind: {
  id: string;
  keys: string[];
  description: string;
  pluginName: string;
  apiId: string;
  parameters?: Record<string, any>;
}): void {
  registerKeybindService({
    id: keybind.id,
    keys: keybind.keys,
    description: keybind.description,
    handler: async () => {
      try {
        await executePluginAPI(
          keybind.pluginName,
          keybind.apiId,
          keybind.parameters,
        );
      } catch (error) {
        console.error(
          `Failed to execute plugin API: ${keybind.pluginName}.${keybind.apiId}`,
          error,
        );
      }
    },
  });
}

/**
 * Get all available plugin APIs formatted for keybind configuration UIs.
 * Provides a flattened list of all plugin functions that can be bound to keys.
 *
 * A PluginAPI represents a callable function exposed by a plugin, containing metadata
 * like id, name, description, and parameter definitions for user keyboard shortcuts.
 *
 * @returns Array of plugin API information with full command identifiers
 * @since 1.0.0
 * @example
 * ```typescript
 * const availableAPIs = getAvailablePluginAPIs();
 *
 * // Display in a keybind configuration UI
 * availableAPIs.forEach(api => {
 *   console.log(`${api.fullId}: ${api.description || api.name}`);
 * });
 *
 * // Check if specific API is available
 * const hasGitCommit = availableAPIs.some(api => api.fullId === 'GitPlugin.commit');
 *
 * // Group by plugin
 * const byPlugin = availableAPIs.reduce((acc, api) => {
 *   if (!acc[api.pluginName]) acc[api.pluginName] = [];
 *   acc[api.pluginName].push(api);
 *   return acc;
 * }, {} as Record<string, typeof availableAPIs>);
 * ```
 */
export function getAvailablePluginAPIs(): Array<{
  pluginName: string;
  apiId: string;
  name: string;
  description?: string;
  fullId: string;
}> {
  const allAPIs = getAllPluginAPIs();
  const result: Array<{
    pluginName: string;
    apiId: string;
    name: string;
    description?: string;
    fullId: string;
  }> = [];

  Object.entries(allAPIs).forEach(([pluginName, apis]) => {
    apis.forEach((api) => {
      result.push({
        pluginName,
        apiId: api.id,
        name: api.name,
        description: api.description,
        fullId: `${pluginName}.${api.id}`,
      });
    });
  });

  return result;
}

/**
 * Bulk register plugin API keybinds from user settings configuration.
 * Used during application startup to restore user-configured keybinds.
 *
 * @param settings - Settings object mapping API IDs to keybind configurations
 * @since 1.0.0
 * @example
 * ```typescript
 * // Example settings.json structure:
 * const userKeybinds = {
 *   'GitPlugin.commit': {
 *     keys: ['Ctrl', 'Enter'],
 *     enabled: true,
 *     parameters: { message: 'Auto-commit' }
 *   },
 *   'FileManager.newFile': {
 *     keys: ['Alt', 'N'],
 *     enabled: true
 *   },
 *   'DisabledPlugin.action': {
 *     keys: ['Ctrl', 'D'],
 *     enabled: false // This won't be registered
 *   }
 * };
 *
 * registerPluginAPIKeybindsFromSettings(userKeybinds);
 * ```
 */
/**
 * @deprecated Use loadKeybindsFromSettings for unified keybind loading
 */
export function registerPluginAPIKeybindsFromSettings(
  settings: Record<
    string,
    {
      keys: string[];
      enabled: boolean;
      parameters?: Record<string, any>;
    }
  >,
): void {
  Object.entries(settings).forEach(([fullApiId, config]) => {
    if (!config.enabled) return;

    const [pluginName, apiId] = fullApiId.split(".", 2);
    if (!pluginName || !apiId) return;

    registerPluginAPIKeybind({
      id: `user.${fullApiId}`,
      keys: config.keys,
      description: `User keybind for ${fullApiId}`,
      pluginName,
      apiId,
      parameters: config.parameters,
    });
  });
}

/**
 * Predefined keybind collections for common editor actions following standard conventions.
 * Use these to quickly set up standard keyboard shortcuts without defining keys manually.
 *
 * @since 1.0.0
 * @example
 * ```typescript
 * // Use individual keybind templates
 * registerDirectKeybind({
 *   id: 'file.new',
 *   ...CommonKeybinds.newFile,
 *   handler: () => createNewFile()
 * });
 *
 * // Bulk register common file operations
 * registerKeybinds([
 *   { id: 'file.new', ...CommonKeybinds.newFile, handler: newFile },
 *   { id: 'file.open', ...CommonKeybinds.openFile, handler: openFile },
 *   { id: 'file.save', ...CommonKeybinds.saveFile, handler: saveFile }
 * ]);
 *
 * // Override descriptions
 * registerDirectKeybind({
 *   id: 'custom.save',
 *   keys: CommonKeybinds.saveFile.keys,
 *   description: 'Save with custom validation',
 *   handler: () => saveWithValidation()
 * });
 * ```
 */
export const CommonKeybinds = {
  openFile: { keys: ["Ctrl", "O"], description: "Open file" },

} as const;

/**
 * Initialize all built-in keybind handlers.
 * This should be called during application startup to register handlers
 * that can be used from settings.json keybind configurations.
 *
 * @since 0.1.0
 * @example
 * ```typescript
 * // Call during app startup
 * initializeBuiltinHandlers();
 *
 * // Now users can configure these in settings.json:
 * // "keybinds": {
 * //   "workbench.newView": { "keys": ["Ctrl", "N"], "enabled": true }
 * // }
 * ```
 */
export function initializeBuiltinHandlers(): void {
  console.log("🔧 Initializing built-in keybind handlers...");

  // TODO: Use imported stores (no require needed in ES modules)

  // TODO: View management (replacing old workspace management)
  registerBuiltinHandler(
    "workbench.newView",
    () => {
      const { addView, setActiveView } = useWorkbenchStore.getState();
      console.log("[Keybind] Creating new view");
      const newViewId = addView();
      setActiveView(newViewId);
      console.log("[Keybind] New view created:", newViewId);
    },
    "Create new view",
  );

  registerBuiltinHandler(
    "workbench.nextView",
    () => {
      const { viewOrder, activeViewId, setActiveView } = useWorkbenchStore.getState();
      console.log("[Keybind] Switching view. Current:", activeViewId, "All:", viewOrder);
      
      if (viewOrder.length === 0) return;
      
      const currentIndex = viewOrder.indexOf(activeViewId || '');
      const nextIndex = currentIndex !== -1 ? (currentIndex + 1) % viewOrder.length : 0;
      const nextViewId = viewOrder[nextIndex];
      
      setActiveView(nextViewId);
      console.log("[Keybind] Switched to view:", nextViewId);
    },
    "Switch to next view",
  );

  registerBuiltinHandler(
    "workbench.previousView",
    () => {
      const { viewOrder, activeViewId, setActiveView } = useWorkbenchStore.getState();
      console.log("[Keybind] Switching to previous view. Current:", activeViewId);
      
      if (viewOrder.length === 0) return;
      
      const currentIndex = viewOrder.indexOf(activeViewId || '');
      const prevIndex = currentIndex !== -1 
        ? (currentIndex === 0 ? viewOrder.length - 1 : currentIndex - 1)
        : viewOrder.length - 1;
      const prevViewId = viewOrder[prevIndex];
      
      setActiveView(prevViewId);
      console.log("[Keybind] Switched to view:", prevViewId);
    },
    "Switch to previous view",
  );

  // TODO: Keep notification management as-is since it's not related to workbench
  registerBuiltinHandler(
    "notification.dismissAll",
    () => {
      const { notifications, removeNotification } =
        useNotificationStore.getState();
      notifications.forEach((notification: any) =>
        removeNotification(notification.id),
      );
      console.log("[Keybind] Dismissed all notifications");
    },
    "Dismiss all notifications",
  );

  console.log("✅ Built-in keybind handlers initialized");
}

/**
 * TODO: TEMPORARY - Simple keybind configuration object for development
 * This replaces the settings.json reading while we're building the workbench
 */
export const TEMP_KEYBIND_CONFIG = {
  // Workbench view management
  "workbench.newView": { 
    keys: ["Ctrl", "Shift", "N"], 
    enabled: true, 
    description: "Create new view" 
  },
  "workbench.nextView": { 
    keys: ["Ctrl", "PageDown"], 
    enabled: true, 
    description: "Switch to next view" 
  },
  "workbench.previousView": { 
    keys: ["Ctrl", "PageUp"], 
    enabled: true, 
    description: "Switch to previous view" 
  },
  
  // Notifications
  "notification.dismissAll": { 
    keys: ["Escape"], 
    enabled: true, 
    description: "Dismiss all notifications" 
  },
} satisfies Record<string, {
  keys: string[];
  enabled: boolean;
  description: string;
}>;

/**
 * TODO: TEMPORARY - Initialize keybinds from the temporary config object
 * This replaces loadKeybindsFromSettings while we're developing
 */
export function initializeTempKeybinds(): void {
  console.log("🎹 Loading temporary keybinds for development...");
  
  Object.entries(TEMP_KEYBIND_CONFIG).forEach(([keybindId, config]) => {
    if (!config.enabled) {
      console.log(`⏭️ Skipping disabled keybind: ${keybindId}`);
      return;
    }

    // This is a built-in keybind
    const handler = builtinHandlers[keybindId];

    if (!handler) {
      console.warn(
        `⚠️ No handler registered for built-in keybind: ${keybindId}`,
      );
      return;
    }

    // Register built-in keybind
    registerDirectKeybind({
      id: keybindId,
      keys: config.keys,
      description: config.description || `Built-in keybind: ${keybindId}`,
      handler,
    });

    console.log(
      `✅ Registered temp keybind: ${keybindId} → ${config.keys.join("+")}`,
    );
  });

  console.log("🎹 Temporary keybind loading completed");
}

// TODO: COMMENTED OUT - Original settings.json loading function
// Uncomment this when you want to re-enable settings.json reading/writing

/*
export async function loadKeybindsFromSettings(
  settings: Record<
    string,
    {
      keys: string[];
      enabled: boolean;
      description?: string;
      parameters?: Record<string, any>;
    }
  >,
): Promise<void> {
  console.log("🎹 Loading keybinds from settings...");

  // Get all available plugin APIs for validation
  const pluginAPIs = getAllPluginAPIs();

  Object.entries(settings).forEach(([keybindId, config]) => {
    if (!config.enabled) {
      console.log(`⏭️ Skipping disabled keybind: ${keybindId}`);
      return;
    }

    // Check if this is a plugin API keybind (format: PluginName.apiId)
    const pluginMatch = keybindId.match(/^([^.]+)\.(.+)$/);

    if (pluginMatch) {
      const [, pluginName, apiId] = pluginMatch;

      // Validate that the plugin and API exist
      const plugin = getPlugin(pluginName);
      if (!plugin?.isLoaded) {
        console.warn(
          `⚠️ Plugin ${pluginName} not loaded, skipping keybind: ${keybindId}`,
        );
        return;
      }

      const hasAPI = pluginAPIs[pluginName]?.some((api) => api.id === apiId);
      if (!hasAPI) {
        console.warn(
          `⚠️ API ${apiId} not found in plugin ${pluginName}, skipping keybind: ${keybindId}`,
        );
        return;
      }

      // Register plugin API keybind
      registerPluginAPIKeybind({
        id: `user.${keybindId}`,
        keys: config.keys,
        description: config.description || `User keybind for ${keybindId}`,
        pluginName,
        apiId,
        parameters: config.parameters,
      });

      console.log(
        `✅ Registered plugin keybind: ${keybindId} → ${config.keys.join("+")}`,
      );
    } else {
      // This is a built-in keybind
      const handler = builtinHandlers[keybindId];

      if (!handler) {
        console.warn(
          `⚠️ No handler registered for built-in keybind: ${keybindId}`,
        );
        return;
      }

      // Register built-in keybind
      registerDirectKeybind({
        id: keybindId,
        keys: config.keys,
        description: config.description || `Built-in keybind: ${keybindId}`,
        handler,
      });

      console.log(
        `✅ Registered built-in keybind: ${keybindId} → ${config.keys.join("+")}`,
      );
    }
  });

  console.log("🎹 Keybind loading completed");
}
*/
