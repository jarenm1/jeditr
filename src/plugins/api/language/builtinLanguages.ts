import { registerLanguage } from "./index";

/**
 * Register all built-in CodeMirror languages
 * This file is automatically loaded to ensure core languages are available
 */

// JavaScript
registerLanguage({
  id: "javascript",
  names: ["javascript", "js"],
  extensions: [".js", ".mjs", ".cjs"],
  loader: () => import("@codemirror/lang-javascript").then(m => m.javascript()),
  priority: 20,
});

// TypeScript
registerLanguage({
  id: "typescript",
  names: ["typescript", "ts"],
  extensions: [".ts", ".tsx"],
  loader: () => import("@codemirror/lang-javascript").then(m => m.javascript({ typescript: true })),
  priority: 20,
});

// HTML
registerLanguage({
  id: "html",
  names: ["html"],
  extensions: [".html", ".htm"],
  loader: () => import("@codemirror/lang-html").then(m => m.html()),
  priority: 20,
});

// CSS
registerLanguage({
  id: "css",
  names: ["css"],
  extensions: [".css"],
  loader: () => import("@codemirror/lang-css").then(m => m.css()),
  priority: 20,
});

// JSON
registerLanguage({
  id: "json",
  names: ["json"],
  extensions: [".json"],
  loader: () => import("@codemirror/lang-json").then(m => m.json()),
  priority: 20,
});

// Markdown
registerLanguage({
  id: "markdown",
  names: ["markdown", "md"],
  extensions: [".md", ".markdown"],
  loader: () => import("@codemirror/lang-markdown").then(m => m.markdown()),
  priority: 20,
});

// Rust
registerLanguage({
  id: "rust",
  names: ["rust", "rs"],
  extensions: [".rs"],
  loader: () => import("@codemirror/lang-rust").then(m => m.rust()),
  priority: 20,
});

// SQL
registerLanguage({
  id: "sql",
  names: ["sql"],
  extensions: [".sql"],
  loader: () => import("@codemirror/lang-sql").then(m => m.sql()),
  priority: 20,
});

// JSX
registerLanguage({
  id: "jsx",
  names: ["jsx"],
  extensions: [".jsx"],
  loader: () => import("@codemirror/lang-javascript").then(m => m.javascript({ jsx: true })),
  priority: 20,
});

// Plaintext (always available) - returns null to indicate no language support
registerLanguage({
  id: "plaintext",
  names: ["plaintext", "text", "txt"],
  extensions: [".txt"],
  loader: async () => {
    // Return null for plaintext - this will be handled specially in the editor
    return null as any;
  },
  priority: 1, // Lowest priority
});

console.debug("[BuiltinLanguages] Registered all built-in languages"); 