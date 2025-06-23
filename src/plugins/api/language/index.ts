interface LanguageDefinition {
  id: string;
  names: string[];
  extensions: string[];
  loader?: () => Promise<any>;
  priority?: number;
}

// Simple in-memory language registry
const languageRegistry = new Map<string, LanguageDefinition>();
const extensionMap = new Map<string, string>();

/**
 * Register a language with the editor
 */
export function registerLanguage(language: LanguageDefinition): void {
  // Store by ID
  languageRegistry.set(language.id, language);
  
  // Store by names (aliases)
  language.names.forEach(name => {
    languageRegistry.set(name.toLowerCase(), language);
  });
  
  // Map extensions to language ID
  language.extensions.forEach(ext => {
    extensionMap.set(ext.toLowerCase(), language.id);
  });
  
  console.debug(`[Language] Registered: ${language.id}`);
}

/**
 * Detect language from file path
 */
export function detectLanguage(filePath: string, content?: string): string {
  // Try extension first
  const ext = getFileExtension(filePath);
  if (ext) {
    const languageId = extensionMap.get(ext);
    if (languageId) {
      return languageId;
    }
  }
  
  // TODO: Add content-based detection here when needed
  
  // Fallback to plaintext
  return 'plaintext';
}

/**
 * Get language definition by ID or name
 */
export function getLanguage(idOrName: string): LanguageDefinition | undefined {
  return languageRegistry.get(idOrName.toLowerCase());
}

/**
 * Get all registered languages
 */
export function getAllLanguages(): LanguageDefinition[] {
  const seen = new Set<string>();
  const languages: LanguageDefinition[] = [];
  
  for (const [key, lang] of languageRegistry.entries()) {
    if (key === lang.id && !seen.has(lang.id)) {
      seen.add(lang.id);
      languages.push(lang);
    }
  }
  
  return languages.sort((a, b) => a.id.localeCompare(b.id));
}

// Helper function
function getFileExtension(filePath: string): string | null {
  const lastDot = filePath.lastIndexOf('.');
  if (lastDot === -1 || lastDot === filePath.length - 1) {
    return null;
  }
  return filePath.slice(lastDot).toLowerCase();
}
