import { showNotification } from './api';

// Type for plugin config
export interface PluginConfig {
  name: string;
  url: string; // Local or remote path to the plugin JS file
  config?: any;
}

// Example plugin config array
export const pluginConfigs: PluginConfig[] = [
  {
    name: 'TestPlugin',
    url: '/src/plugins/testPlugin.js', // Local path for dev/demo
    config: {},
  },
  // Add more plugins here
];

// Minimal worker loader for plugins
export function loadPluginInWorker(plugin: PluginConfig) {
  // Create a worker from the plugin JS file
  const worker = new Worker(plugin.url, { type: 'module' });

  // Listen for messages from the plugin
  worker.onmessage = (event) => {
    const { type, payload } = event.data;
    if (type === 'showNotification') {
      showNotification(plugin.name, payload.message, payload.severity);
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
