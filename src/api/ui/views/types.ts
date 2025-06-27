import type React from "react";

/**
 * Props passed to view render functions for both default and plugin views.
 *
 * @since 0.1.0
 * @example
 * ```typescript
 * const MyView: React.FC<ViewProps> = ({ filePath, content, onContentChange }) => {
 *   return <div>Editing: {filePath}</div>;
 * };
 * ```
 */
export interface ViewProps {
  filePath: string;
  contentType: string;
  content: any;
  onContentChange?: (content: any) => void;
  viewId: string;
}

/**
 * Default view configuration for built-in views that run on the main thread.
 * These are typically lightweight React components for common file types.
 *
 * @since 0.1.0
 * @example
 * ```typescript
 * const textEditorView: DefaultView = {
 *   id: 'text-editor',
 *   name: 'Text Editor',
 *   render: (props) => <TextEditor {...props} />
 * };
 * registerDefaultView(textEditorView);
 * ```
 */
export interface DefaultView {
  id: string;
  name: string;
  render: (props: ViewProps) => React.ReactNode;
}

/**
 * Plugin view configuration for complex views that run in web workers.
 * These provide full control over UI rendering via HTML/CSS/JS generation.
 *
 * @since 0.1.0
 * @example
 * ```typescript
 * const svgEditorView: PluginView = {
 *   id: 'svg-editor',
 *   name: 'SVG Editor',
 *   pluginName: 'MyPlugin',
 *   fileTypes: ['.svg'],
 *   mimeTypes: ['image/svg+xml'],
 *   priority: 10,
 *   worker: myWorker
 * };
 * ```
 */
export interface PluginView {
  id: string;
  name: string;
  pluginName: string;
  fileTypes: string[];
  mimeTypes?: string[];
  priority?: number;
  worker: Worker;
}

/**
 * Result object sent from plugin web workers to update the main thread UI.
 * Supports full rendering, partial updates, and CSS injection.
 *
 * @since 0.1.0
 * @example
 * ```typescript
 * // Full render
 * const renderResult: PluginViewRenderResult = {
 *   type: 'render',
 *   html: '<div class="my-editor">...</div>',
 *   css: '.my-editor { background: #1e1e1e; }',
 *   eventHandlers: {
 *     'button-click': (event) => console.log('Clicked!')
 *   }
 * };
 *
 * // Partial update
 * const updateResult: PluginViewRenderResult = {
 *   type: 'update-html',
 *   selector: '.toolbar',
 *   html: '<button class="active">Select</button>'
 * };
 * ```
 */
export interface PluginViewRenderResult {
  type: "render" | "update-html" | "update-css";
  html?: string;
  css?: string;
  eventHandlers?: Record<string, (event: any) => void>;
  selector?: string;
}

/**
 * Data structure for registering a new plugin view.
 * This is sent from plugin workers to register their view capabilities.
 *
 * @since 0.1.0
 * @example
 * ```typescript
 * // In plugin web worker
 * self.postMessage({
 *   type: 'registerView',
 *   payload: {
 *     id: 'image-editor',
 *     name: 'Image Editor',
 *     fileTypes: ['.png', '.jpg', '.gif'],
 *     mimeTypes: ['image/png', 'image/jpeg'],
 *     priority: 5
 *   }
 * });
 * ```
 */
export interface PluginViewRegistration {
  id: string;
  name: string;
  fileTypes: string[];
  mimeTypes?: string[];
  priority?: number;
}
