/**
 * @fileoverview Plugin loading and management system for JediTR.
 * 
 * This module provides comprehensive plugin loading capabilities including:
 * - Local JavaScript file loading
 * - GitHub repository plugin installation  
 * - Web worker-based plugin isolation
 * - Plugin message handling and API registration
 * - Settings-based plugin configuration
 * - Lazy loading and dependency management
 * 
 * Plugins run in isolated web workers and communicate with the main thread
 * through a structured message passing system. This ensures plugins cannot
 * interfere with each other or the main application.
 * 
 * @since 0.1.0
 * @author @jarenm1
 */

import { showNotification, showModal } from "../ui";
import { registerPluginKeybind } from "../keybinds";
import { registerActionHandler } from "../ui/notifications/notificationStore";
import { githubPluginLoader, GitHubPluginConfig } from './githubLoader';
import { registerPlugin, registerPluginAPI, unregisterPlugin } from './pluginRegistry';
import { registerView, unregisterView } from '../ui/views';

/**
 * Configuration interface for loading plugins from various sources.
 * Supports local files, GitHub repositories, and direct URLs with advanced options.
 *
 * @since 0.1.0
 * @example
 * ```typescript
 * // Local plugin file
 * const localPlugin: PluginConfig = {
 *   name: 'MyLocalPlugin',
 *   url: './plugins/myPlugin.js'
 * };
 * 
 * // GitHub plugin with specific branch
 * const githubPlugin: PluginConfig = {
 *   name: 'GitIntegration',
 *   url: 'username/git-plugin',
 *   branch: 'v2.0',
 *   entryPoint: 'dist/plugin.js',
 *   config: { apiKey: 'your-api-key' },
 *   cache: { enabled: true, ttl: 3600000 }
 * };
 * 
 * // Lazy-loaded plugin with dependencies
 * const advancedPlugin: PluginConfig = {
 *   name: 'AdvancedEditor',
 *   url: 'https://raw.githubusercontent.com/user/plugin/main/dist.js',
 *   lazy: true,
 *   dependencies: ['GitIntegration', 'FileManager']
 * };
 * ```
 */
export interface PluginConfig {
  name: string;
  url: string;
  config?: any;
  lazy?: boolean;
  dependencies?: string[];
  branch?: string;
  entryPoint?: string;
  cache?: {
    enabled: boolean;
    ttl?: number;
  };
}

export const pluginWorkers: Record<string, Worker> = {};

// Plugin configurations will be loaded from settings
let configuredPlugins: PluginConfig[] = [];

/**
 * Determine if a URL represents a GitHub repository or file.
 * Recognizes both "owner/repo" format and raw.githubusercontent.com URLs.
 * 
 * @param url - URL string to check
 * @returns True if the URL is a GitHub reference
 * @since 0.1.0
 * @example
 * ```typescript
 * isGitHubUrl('user/repo'); // true
 * isGitHubUrl('https://raw.githubusercontent.com/user/repo/main/file.js'); // true
 * isGitHubUrl('./local/file.js'); // false
 * isGitHubUrl('https://example.com/plugin.js'); // false
 * ```
 */
function isGitHubUrl(url: string): boolean {
  return /^[^\/]+\/[^\/]+$/.test(url) || url.includes('raw.githubusercontent.com');
}

/**
 * Load a single plugin in a web worker from local file or GitHub repository.
 * Handles plugin registration, message setup, and error management.
 * 
 * @param plugin - Plugin configuration object
 * @returns Promise that resolves to Worker instance or null if loading failed
 * @throws {Error} If plugin loading fails or worker creation errors
 * @since 0.1.0
 * @example
 * ```typescript
 * // Load a local plugin
 * const worker1 = await loadPluginInWorker({
 *   name: 'LocalPlugin',
 *   url: './plugins/local.js'
 * });
 * 
 * // Load a GitHub plugin
 * const worker2 = await loadPluginInWorker({
 *   name: 'GitHubPlugin',
 *   url: 'username/my-plugin',
 *   branch: 'stable',
 *   config: { theme: 'dark' }
 * });
 * 
 * if (worker2) {
 *   console.log('Plugin loaded successfully');
 * } else {
 *   console.log('Plugin loading failed');
 * }
 * ```
 */
export async function loadPluginInWorker(plugin: PluginConfig): Promise<Worker | null> {
  try {
    let worker: Worker;

    if (isGitHubUrl(plugin.url)) {
      const githubConfig: GitHubPluginConfig = {
        ...plugin,
        branch: plugin.branch,
        entryPoint: plugin.entryPoint,
        dependencies: plugin.dependencies,
        cache: plugin.cache
      };
      
      try {
        worker = await githubPluginLoader.loadGitHubPlugin(githubConfig);
      } catch (error) {
        console.error(`Failed to load plugin ${plugin.name}:`, error);
        return null;
      }
      if (!worker) return null;
    } else {
      worker = new Worker(plugin.url, { type: "module" });
    }

    pluginWorkers[plugin.name] = worker;

    registerPlugin({
      name: plugin.name,
      url: plugin.url,
      worker,
      isLoaded: true,
      version: undefined
    });

    setupWorkerMessageHandling(worker, plugin);

    worker.postMessage({ type: "init", config: plugin.config });

    console.log(`Plugin loaded: ${plugin.name}`);
    return worker;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Failed to load plugin ${plugin.name}:`, error);
    
    showNotification(
      "Plugin Manager",
      `Failed to load plugin "${plugin.name}": ${errorMessage}`,
      "error"
    );
    
    return null;
  }
}

/**
 * Configure message handling between the main thread and a plugin web worker.
 * Sets up event listeners for plugin API registration, notifications, modals, and errors.
 * 
 * @param worker - The web worker instance running the plugin
 * @param plugin - Plugin configuration object for context
 * @since 0.1.0
 * @example
 * ```typescript
 * const worker = new Worker('./plugin.js');
 * const config = { name: 'MyPlugin', url: './plugin.js' };
 * setupWorkerMessageHandling(worker, config);
 * 
 * // Worker can now send messages like:
 * // worker.postMessage({ type: 'showNotification', payload: { message: 'Hello!' } });
 * ```
 */
function setupWorkerMessageHandling(worker: Worker, plugin: PluginConfig) {
  worker.onmessage = (event) => {
    const { type, payload } = event.data;
    
    switch (type) {
      case "showNotification":
        showNotification(
          plugin.name,
          payload.message,
          payload.severity,
          payload.action,
        );

        if (payload.action?.actionId) {
          registerActionHandler(payload.action.actionId, () => {
            worker.postMessage({
              type: "executeAction",
              actionId: payload.action.actionId,
            });
          });
        }
        break;

      case "showModal":
        showModal(plugin.name, payload.content);
        break;

      case "registerKeybind":
        const { id, keys, description, action } = payload;
        registerPluginKeybind(plugin.name, {
          id,
          keys,
          description,
          action,
        }, worker);
        break;

      case "registerView":
        // Handle plugin view registration
        registerView(plugin.name, payload, worker);
        break;

      case "registerAPI":
        // Handle plugin API registration
        registerPluginAPI(plugin.name, payload);
        break;

      case "unregisterView":
        // Handle view unregistration
        // Implementation would call unregister function
        break;

      default:
        console.warn(`Unknown message type from plugin ${plugin.name}:`, type);
    }
  };

  // Handle worker errors
  worker.onerror = (error) => {
    console.error(`Plugin ${plugin.name} error:`, error);
    showNotification(
      "Plugin Manager",
      `Plugin "${plugin.name}" encountered an error`,
      "error"
    );
  };
}

/**
 * Load plugins from user settings configuration during application startup.
 * Filters out lazy plugins and loads all others concurrently for better performance.
 * 
 * @param plugins - Array of plugin configurations from settings
 * @since 1.0.0
 * @example
 * ```typescript
 * const settingsPlugins = [
 *   { name: 'GitPlugin', url: 'user/git-plugin', lazy: false },
 *   { name: 'ThemePlugin', url: './themes/plugin.js' },
 *   { name: 'LazyPlugin', url: 'user/heavy-plugin', lazy: true } // Won't load now
 * ];
 * 
 * await loadPluginsFromSettings(settingsPlugins);
 * console.log('Application plugins loaded');
 * ```
 */
export async function loadPluginsFromSettings(plugins: PluginConfig[]): Promise<void> {
  console.log("🔌 Loading plugins from settings...");
  
  configuredPlugins = plugins;
  
  const loadPromises = plugins
    .filter(plugin => !plugin.lazy) // Only load non-lazy plugins
    .map(plugin => loadPluginInWorker(plugin));

  await Promise.allSettled(loadPromises);
  
  console.log("✅ Plugin loading completed");
}

/**
 * Legacy function for loading plugins from hardcoded configuration.
 * 
 * @deprecated Use loadPluginsFromSettings instead
 * @since 1.0.0
 */
export async function loadAllPlugins(): Promise<void> {
  console.log("🔌 No plugins configured in settings");
}

/**
 * Dynamically load a single plugin at runtime without modifying settings.
 * Useful for testing plugins or loading them programmatically.
 * 
 * @param config - Plugin configuration object
 * @returns Promise that resolves to true if loading succeeded
 * @since 1.0.0
 * @example
 * ```typescript
 * // Load a plugin for testing
 * const success = await loadPlugin({
 *   name: 'TestPlugin',
 *   url: './test-plugins/experimental.js',
 *   config: { debugMode: true }
 * });
 * 
 * if (success) {
 *   console.log('Test plugin loaded successfully');
 * } else {
 *   console.log('Failed to load test plugin');
 * }
 * ```
 */
export async function loadPlugin(config: PluginConfig): Promise<boolean> {
  try {
    const worker = await loadPluginInWorker(config);
    return worker !== null;
  } catch (error) {
    console.error("Failed to dynamically load plugin:", error);
    return false;
  }
}

/**
 * Install a plugin from GitHub by fetching its manifest and adding it to the plugin registry.
 * Downloads plugin metadata, validates it, and loads the plugin immediately if successful.
 * 
 * @param url - GitHub repository URL in 'owner/repo' format
 * @param name - Optional custom name for the plugin (defaults to URL)
 * @returns Promise that resolves to true if installation and loading succeeded
 * @throws {Error} If plugin manifest is invalid or installation fails
 * @since 1.0.0
 * @example
 * ```typescript
 * // Install from GitHub repository
 * const installed = await installGitHubPlugin('username/awesome-plugin');
 * 
 * // Install with custom name
 * const installed2 = await installGitHubPlugin(
 *   'company/enterprise-plugin', 
 *   'CompanyPlugin'
 * );
 * 
 * if (installed) {
 *   console.log('Plugin installed and loaded successfully');
 * } else {
 *   console.log('Plugin installation failed');
 * }
 * ```
 */
export async function installGitHubPlugin(url: string, name?: string): Promise<boolean> {
  try {
    const config: GitHubPluginConfig = {
      name: name || url,
      url: url
    };

    // Fetch and validate plugin manifest
    const manifest = await githubPluginLoader.installPlugin(config);
    
    if (manifest) {
      // Add to plugin configs
      const pluginConfig: PluginConfig = {
        name: manifest.name,
        url: url,
        dependencies: manifest.dependencies,
        cache: { enabled: true }
      };

      configuredPlugins.push(pluginConfig);
      
      // Load immediately if not lazy
      const success = await loadPlugin(pluginConfig);
      
      if (success) {
        showNotification(
          "Plugin Manager",
          `Successfully installed "${manifest.name}" v${manifest.version}`,
          "info"
        );
      }
      
      return success;
    }
    
    return false;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Failed to install GitHub plugin:", error);
    showNotification(
      "Plugin Manager",
      `Failed to install plugin from ${url}: ${errorMessage}`,
      "error"
    );
    return false;
  }
}

/**
 * Unload a plugin by terminating its web worker and cleaning up resources.
 * Shows a notification to the user confirming the plugin was unloaded.
 * 
 * @param name - The unique name of the plugin to unload
 * @returns True if the plugin was successfully unloaded, false if not found
 * @since 1.0.0
 * @example
 * ```typescript
 * // Unload a specific plugin
 * const success = unloadPlugin('GitIntegration');
 * if (success) {
 *   console.log('Git plugin unloaded successfully');
 * } else {
 *   console.log('Plugin not found or already unloaded');
 * }
 * 
 * // Unload all plugins
 * const loadedPlugins = getLoadedPlugins();
 * loadedPlugins.forEach(plugin => {
 *   unloadPlugin(plugin.name);
 * });
 * ```
 */
export function unloadPlugin(name: string): boolean {
  const worker = pluginWorkers[name];
  if (worker) {
    worker.terminate();
    delete pluginWorkers[name];
    
    // Also unregister from plugin registry
    unregisterPlugin(name);
    
    showNotification(
      "Plugin Manager",
      `Unloaded plugin "${name}"`,
      "info"
    );
    
    return true;
  }
  return false;
}

/**
 * Get information about all currently loaded plugins.
 * Returns plugin metadata including source type for management UIs.
 * 
 * @returns Array of loaded plugin information with GitHub detection
 * @since 1.0.0
 * @example
 * ```typescript
 * const loadedPlugins = getLoadedPlugins();
 * console.log(`${loadedPlugins.length} plugins are currently loaded:`);
 * 
 * loadedPlugins.forEach(plugin => {
 *   const source = plugin.isGitHub ? 'GitHub' : 'Local';
 *   console.log(`- ${plugin.name} (${source}: ${plugin.url})`);
 * });
 * 
 * // Filter by source
 * const githubPlugins = loadedPlugins.filter(p => p.isGitHub);
 * const localPlugins = loadedPlugins.filter(p => !p.isGitHub);
 * ```
 */
export function getLoadedPlugins(): Array<{ name: string; url: string; isGitHub: boolean }> {
  return configuredPlugins
    .filter(config => pluginWorkers[config.name])
    .map(config => ({
      name: config.name,
      url: config.url,
      isGitHub: isGitHubUrl(config.url)
    }));
} 