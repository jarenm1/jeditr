import { LanguagePlugin, LanguageDetector } from "@plugins/types";

interface RegisteredLanguage extends LanguagePlugin {
  isLoaded: boolean;
}

class LanguageRegistry {
  private languages = new Map<string, RegisteredLanguage>();
  private extensionMap = new Map<string, string[]>();
  private detectors: LanguageDetector[] = [];

  /**
   * Register a language plugin
   */
  register(plugin: LanguagePlugin): void {
    const registered: RegisteredLanguage = {
      ...plugin,
      isLoaded: false,
      priority: plugin.priority ?? 10,
    };

    // Register the main language
    this.languages.set(plugin.id, registered);

    // Register all name aliases
    plugin.names.forEach(name => {
      this.languages.set(name.toLowerCase(), registered);
    });

    // Register file extensions
    plugin.extensions.forEach(ext => {
      const normalizedExt = ext.toLowerCase();
      const existing = this.extensionMap.get(normalizedExt) || [];
      existing.push(plugin.id);
      // Sort by priority (higher first)
      existing.sort((a, b) => {
        const langA = this.languages.get(a);
        const langB = this.languages.get(b);
        return (langB?.priority || 10) - (langA?.priority || 10);
      });
      this.extensionMap.set(normalizedExt, existing);
    });

    // Register detectors
    if (plugin.detectors) {
      this.detectors.push(...plugin.detectors);
    }

    console.debug(`[LanguageRegistry] Registered language: ${plugin.id}`);
  }

  /**
   * Get language plugin by ID or name
   */
  get(languageId: string): RegisteredLanguage | undefined {
    return this.languages.get(languageId.toLowerCase());
  }

  /**
   * Get language ID for a file path
   */
  detectLanguage(filePath: string, content?: string): string {
    console.debug(`[LanguageRegistry] Detecting language for file: ${filePath}`);
    
    // First try custom detectors
    for (const detector of this.detectors) {
      const result = detector(filePath, content);
      if (result && this.languages.has(result.toLowerCase())) {
        console.debug(`[LanguageRegistry] Custom detector found language: ${result.toLowerCase()}`);
        return result.toLowerCase();
      }
    }

    // Then try file extension
    const ext = this.extractExtension(filePath);
    console.debug(`[LanguageRegistry] Extracted extension: ${ext}`);
    
    if (ext) {
      const languageIds = this.extensionMap.get(ext);
      console.debug(`[LanguageRegistry] Extension map for ${ext}:`, languageIds);
      
      if (languageIds && languageIds.length > 0) {
        console.debug(`[LanguageRegistry] Detected language: ${languageIds[0]} for extension ${ext}`);
        return languageIds[0]; // Return highest priority language
      }
    }

    // Fallback to plaintext
    console.debug(`[LanguageRegistry] No language detected, falling back to plaintext`);
    return "plaintext";
  }

  /**
   * Get all registered languages
   */
  getAllLanguages(): RegisteredLanguage[] {
    const seen = new Set<string>();
    const languages: RegisteredLanguage[] = [];
    
    for (const [key, lang] of this.languages.entries()) {
      if (key === lang.id && !seen.has(lang.id)) {
        seen.add(lang.id);
        languages.push(lang);
      }
    }
    
    return languages.sort((a, b) => a.id.localeCompare(b.id));
  }

  /**
   * Mark a language as loaded
   */
  markAsLoaded(languageId: string): void {
    const language = this.languages.get(languageId.toLowerCase());
    if (language) {
      language.isLoaded = true;
    }
  }

  /**
   * Check if language is loaded
   */
  isLoaded(languageId: string): boolean {
    const language = this.languages.get(languageId.toLowerCase());
    return language?.isLoaded || false;
  }

  private extractExtension(filePath: string): string | null {
    const lastDot = filePath.lastIndexOf('.');
    if (lastDot === -1 || lastDot === filePath.length - 1) {
      return null;
    }
    return filePath.slice(lastDot).toLowerCase();
  }
}

// Global registry instance
export const languageRegistry = new LanguageRegistry(); 