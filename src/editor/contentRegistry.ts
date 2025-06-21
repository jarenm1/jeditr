import React from "react";
import "@editor/registerEditorContentType";
import TerminalContentRenderer from "./TerminalContentRenderer";

export type ContentRenderer = React.FC<{ 
  content: any; 
  editorSettings: any; 
  paneId?: string; 
}>;

const registry: Record<string, ContentRenderer> = {};

/**
 * Content Type Registry
 *
 * This module provides a registry for content renderers, allowing the editor to support extensible content types.
 * Core features and plugins can register new content types and their React renderers at runtime using registerContentType.
 * The EditorPane component (and others) can use getContentRenderer to look up the appropriate renderer for a given content type.
 *
 * Example usage:
 * ```
 * registerContentType('editor', function EditorContentRenderer({ content, editorSettings, paneId }) {
 *   const { content: editorContent, language, onChange } = content.data;
 *   return React.createElement(Editor, {
 *     content: editorContent,
 *     language,
 *     onChange,
 *     settings: editorSettings,
 *     paneId,
 *   });
 * });
 * ```
 */
export function registerContentType(type: string, renderer: ContentRenderer) {
  if (registry[type]) {
    console.warn(
      `[contentRegistry] Content type '${type}' is already registered and will be overwritten. ` +
        `Consider using namespacing (e.g., 'myplugin.video') to avoid conflicts.`,
    );
  }
  registry[type] = renderer;
}

export function getContentRenderer(type: string): ContentRenderer | undefined {
  return registry[type];
}

registerContentType("terminal", TerminalContentRenderer);
