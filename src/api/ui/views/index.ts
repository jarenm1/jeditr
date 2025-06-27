/**
 * @fileoverview View Registry API for JediTR's extensible view system.
 *
 * This module provides the public API for registering and managing views that handle
 * different file types. The system supports two types of views:
 *
 * 1. **Default Views** - Lightweight React components that run on the main thread
 * 2. **Plugin Views** - Complex views that run in web workers with full UI control
 *
 * Views are automatically selected based on file extensions and MIME types, with
 * a priority system for conflict resolution. The default view (typically a text
 * editor) handles any file types not claimed by specialized views.
 *
 * @since 0.1.0
 * @author @jarenm1
 * @example
 * ```typescript
 * import {
 *   registerDefaultView,
 *   registerView,
 *   getViewForFile
 * } from '@/api/ui/views';
 *
 * // Register a default text editor view
 * registerDefaultView({
 *   id: 'text-editor',
 *   name: 'Text Editor',
 *   render: (props) => <TextEditor {...props} />
 * });
 *
 * // Register a plugin view for images
 * registerView('ImagePlugin', {
 *   id: 'image-viewer',
 *   name: 'Image Viewer',
 *   fileTypes: ['.png', '.jpg', '.gif'],
 *   priority: 10
 * }, imageWorker);
 *
 * // Get the best view for a file
 * const view = getViewForFile('/path/to/image.png');
 * console.log(`Using view: ${view.name}`);
 * ```
 */

export * from "./types";

/**
 * Core view registration and management functions.
 * These functions provide the main API for the view system.
 */
export {
  registerView,
  registerDefaultView,
  unregisterView,
  getViewForFile,
  getAllViews,
  getView,
} from "./viewRegistry";
