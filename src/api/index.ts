/**
 * Jeditr API - Main entry point for all application APIs
 *
 * This module provides a unified interface for all editor functionality,
 * organized by domain for better discoverability and maintainability.
 *
 * @example
 * ```typescript
 * import {
 *   showNotification,
 *   readFile,
 *   registerLanguage,
 *   createWorkspace
 * } from '@api'
 *
 * // Show a notification
 * showNotification('myPlugin', 'Hello World!', 'info')
 *
 * // Read a file
 * const content = await readFile('./src/main.ts')
 *
 * // Register a language
 * registerLanguage({
 *   name: 'MyLang',
 *   extensions: ['mylang'],
 *   defaultFileExtension: 'mylang'
 * })
 *
 * // Create a workspace
 * const workspace = await createWorkspace('My Project', '/path/to/project')
 * ```
 *
 * @module api
 */

export * from "@api/types";
export * from "@api/editor";
export * from "@api/filesystem";
export * from "@api/ui";
export * as terminal from "./terminal";
export * as plugins from "./plugins";

// Also export main plugin functions and keybind functions directly for convenience
export {
  loadAllPlugins,
  loadPlugin,
  installGitHubPlugin,
  unloadPlugin,
  getLoadedPlugins,
} from "./plugins/loader";

export {
  registerDirectKeybind,
  registerPluginAPIKeybind,
  registerBuiltinHandler,
  loadKeybindsFromSettings,
  initializeBuiltinHandlers,
  getAvailablePluginAPIs,
} from "./keybinds";
