import { showNotification } from './api';
import { registerBottomBarPlugin, registerEditorPanePlugin } from './registry';

// Type for plugin config
export interface PluginConfig {
  name: string;
  url: string; // Can be a local or remote path
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

// Loader function to fetch and evaluate plugin code
export async function loadPlugin(plugin: PluginConfig) {
  try {
    const res = await fetch(plugin.url);
    if (!res.ok) throw new Error(`Failed to fetch plugin: ${plugin.url}`);
    const code = await res.text();
    // Provide the plugin API to the plugin code
    const pluginFunc = new Function(
      'showNotification',
      'registerBottomBarPlugin',
      'registerEditorPanePlugin',
      'config',
      code
    );
    pluginFunc(
      showNotification,
      registerBottomBarPlugin,
      registerEditorPanePlugin,
      plugin.config || {}
    );
    showNotification(plugin.name, 'Plugin loaded successfully!', 'info');
  } catch (err: any) {
    showNotification(plugin.name, `Failed to load plugin: ${err.message}`, 'error');
  }
}

// Load all plugins from the config array
export async function loadAllPlugins() {
  for (const plugin of pluginConfigs) {
    await loadPlugin(plugin);
  }
}
