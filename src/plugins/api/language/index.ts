import { LanguagePlugin } from "@plugins/types";
import { languageRegistry } from "./languageRegistry";
import { languageLoader } from "./languageLoader";
// Import built-in languages to register them
import "./builtinLanguages";

/**
 * Register a language plugin
 * This is the main API for plugins to add language support
 */
export function registerLanguage(plugin: LanguagePlugin): void {
  languageRegistry.register(plugin);
}

/**
 * Load language support for a specific language ID
 */
export async function loadLanguage(languageId: string) {
  return languageLoader.loadLanguage(languageId);
}

/**
 * Load language support for a file
 * Returns both the LanguageSupport and detected language ID
 */
export async function loadLanguageForFile(filePath: string, content?: string) {
  return languageLoader.loadLanguageForFile(filePath, content);
}

/**
 * Detect language ID for a file (without loading)
 */
export function detectLanguage(filePath: string, content?: string): string {
  return languageRegistry.detectLanguage(filePath, content);
}

/**
 * Get information about a registered language
 */
export function getLanguageInfo(languageId: string) {
  return languageRegistry.get(languageId);
}

/**
 * Get all registered languages
 */
export function getAllLanguages() {
  return languageRegistry.getAllLanguages();
}

/**
 * Check if a language is currently loading
 */
export function isLanguageLoading(languageId: string): boolean {
  return languageLoader.isLoading(languageId);
}

/**
 * Check if a language is loaded and cached
 */
export function isLanguageLoaded(languageId: string): boolean {
  return languageRegistry.isLoaded(languageId);
}

/**
 * Get cached language support if available
 */
export function getCachedLanguage(languageId: string) {
  return languageLoader.getCached(languageId);
}

// Re-export types for convenience
export type { LanguagePlugin } from "@plugins/types"; 