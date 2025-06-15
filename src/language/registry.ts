type LanguageDetector = (filePath: string, content?: string) => string | undefined;

const detectors: LanguageDetector[] = [
  (filePath) => {
    if (filePath.endsWith('.rs')) return 'rust';
    if (filePath.endsWith('.ts')) return 'typescript';
    if (filePath.endsWith('.tsx')) return 'typescript';
    if (filePath.endsWith('.js')) return 'javascript';
    if (filePath.endsWith('.jsx')) return 'javascript';
    if (filePath.endsWith('.json')) return 'json';
    if (filePath.endsWith('.md')) return 'markdown';
    if (filePath.endsWith('.html')) return 'html';
    if (filePath.endsWith('.css')) return 'css';
    if (filePath.endsWith('.txt')) return 'plaintext';
    return undefined;
  },
];

export function detectLanguage(filePath: string, content?: string): string {
  for (const detector of detectors) {
    const lang = detector(filePath, content);
    if (lang) return lang;
  }
  return 'plaintext';
}

export function registerLanguageDetector(detector: LanguageDetector) {
  detectors.push(detector);
} 