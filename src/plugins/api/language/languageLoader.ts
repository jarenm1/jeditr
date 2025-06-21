import { LanguageSupport } from "@codemirror/language";
import { languageRegistry } from "./languageRegistry";

interface LoadedLanguage {
  languageSupport: LanguageSupport;
  loadedAt: number;
}

class LanguageLoader {
  private cache = new Map<string, LoadedLanguage>();
  private loadingPromises = new Map<string, Promise<LanguageSupport>>();

  /**
   * Load language support for a given language ID
   */
  async loadLanguage(languageId: string): Promise<LanguageSupport> {
    const normalizedId = languageId.toLowerCase();
    
    // Check if already cached
    const cached = this.cache.get(normalizedId);
    if (cached) {
      return cached.languageSupport;
    }

    // Check if currently loading
    const loadingPromise = this.loadingPromises.get(normalizedId);
    if (loadingPromise) {
      return loadingPromise;
    }

    // Get language plugin
    const language = languageRegistry.get(normalizedId);
    if (!language) {
      console.warn(`[LanguageLoader] Language not found: ${languageId}, falling back to plaintext`);
      return this.loadPlaintextFallback();
    }

    console.debug(`[LanguageLoader] Found language plugin for ${languageId}:`, language);

    // Start loading
    const promise = this.performLoad(language.id, language.loader);
    this.loadingPromises.set(normalizedId, promise);

    try {
      const languageSupport = await promise;
      
      // Cache the result
      this.cache.set(normalizedId, {
        languageSupport,
        loadedAt: Date.now(),
      });
      
      // Mark as loaded in registry
      languageRegistry.markAsLoaded(normalizedId);
      
      console.debug(`[LanguageLoader] Successfully loaded language: ${languageId}`);
      return languageSupport;
    } catch (error) {
      console.error(`[LanguageLoader] Failed to load language ${languageId}:`, error);
      return this.loadPlaintextFallback();
    } finally {
      this.loadingPromises.delete(normalizedId);
    }
  }

  /**
   * Load language for a file path
   */
  async loadLanguageForFile(filePath: string, content?: string): Promise<{
    languageSupport: LanguageSupport;
    languageId: string;
  }> {
    const languageId = languageRegistry.detectLanguage(filePath, content);
    const languageSupport = await this.loadLanguage(languageId);
    
    return {
      languageSupport,
      languageId,
    };
  }

  /**
   * Check if language is currently loading
   */
  isLoading(languageId: string): boolean {
    return this.loadingPromises.has(languageId.toLowerCase());
  }

  /**
   * Get cached language if available
   */
  getCached(languageId: string): LanguageSupport | null {
    const cached = this.cache.get(languageId.toLowerCase());
    return cached?.languageSupport || null;
  }

  /**
   * Clear cache (useful for development/testing)
   */
  clearCache(): void {
    this.cache.clear();
    this.loadingPromises.clear();
  }

  /**
   * Get cache stats
   */
  getCacheStats(): { size: number; languages: string[] } {
    return {
      size: this.cache.size,
      languages: Array.from(this.cache.keys()),
    };
  }

  private async performLoad(languageId: string, loader: () => Promise<LanguageSupport>): Promise<LanguageSupport> {
    try {
      const result = await loader();
      // Allow null for plaintext (no syntax highlighting)
      if (result === null) {
        return null as any;
      }
      // Validate that we got a proper LanguageSupport object
      if (!result || typeof result !== 'object') {
        throw new Error(`Invalid LanguageSupport returned for ${languageId}`);
      }
      return result;
    } catch (error) {
      throw new Error(`Failed to load language ${languageId}: ${error}`);
    }
  }

  private async loadPlaintextFallback(): Promise<LanguageSupport> {
    try {
      // Try to load the registered plaintext language first
      const plaintextLanguage = languageRegistry.get("plaintext");
      if (plaintextLanguage) {
        return await plaintextLanguage.loader();
      }
      
      // Fallback: return null for no language support (plaintext)
      return null as any;
    } catch (error) {
      console.error("[LanguageLoader] Failed to create plaintext fallback:", error);
      // Last resort: return null for no language support
      return null as any;
    }
  }
}

// Global loader instance
export const languageLoader = new LanguageLoader(); 