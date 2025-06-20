import { showNotification, showModal } from './api';
import { registerPluginKeybindWithAction } from './registerKeybind';
import { registerActionHandler } from './notification/notificationStore';

/**
 * Interface for plugin configuration.
 *
 * - `name`: A unique, human-readable identifier for the plugin.
 * - `url`: The plugin's JavaScript file location, which must be either:
 *      - a relative path (e.g. './myPlugin.js')
 *      - a GitHub repository in the format 'owner/repo' (e.g. 'jarenm1/test-plugin')
 * - `config`: (Optional) An object containing plugin-specific configuration options.
 */
export interface PluginConfig {
  name: string;
  url: string;
  config?: any;
}

export const pluginWorkers: Record<string, Worker> = {};

/**
 * List of plugin configurations.
 * 
 * This is a placeholder array for plugin configs. In the future, plugin configuration
 * will be loaded from a JSON file instead of being hardcoded here.
 */
export const pluginConfigs: PluginConfig[] = [
  {
    name: 'Test Plugin',
    url: new URL('./testPlugin.js', import.meta.url).href,
  },
  // Add more plugins here
];

// Minimal worker loader for plugins
export function loadPluginInWorker(plugin: PluginConfig) {
  // Create a worker from the plugin JS file
  const worker = new Worker(plugin.url, { type: 'module' });
  pluginWorkers[plugin.name] = worker;

  // Listen for messages from the plugin
  worker.onmessage = (event) => {
    const { type, payload } = event.data;
    if (type === 'showNotification') {
      showNotification(plugin.name, payload.message, payload.severity, payload.action);
      
      // Register action handler if action is provided
      if (payload.action?.actionId) {
        registerActionHandler(payload.action.actionId, () => {
          // Send action execution message back to the plugin
          worker.postMessage({
            type: 'executeAction',
            actionId: payload.action.actionId
          });
        });
      }
    }
    if (type === 'showModal') {
      // For now, treat payload.content as a string or simple HTML
      showModal(plugin.name, payload.content);
    }
    // Handle plugin keybind registration
    if (type === 'registerKeybind') {
      const { id, keys, description, action } = payload;
      registerPluginKeybindWithAction({
        id,
        keys,
        description,
        action,
        pluginWorker: worker,
      });
    }
    // Add more API message handling here as needed
  };

  // Optionally, send initial config to the worker
  worker.postMessage({ type: 'init', config: plugin.config });
}

// Load all plugins from the config array
export async function loadAllPlugins() {
  for (const plugin of pluginConfigs) {
    loadPluginInWorker(plugin);
  }
}
