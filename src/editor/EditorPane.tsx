/**
 * EditorPane
 *
 * This component is a generic container for rendering any registered content type in a pane.
 * It uses the content type registry to look up the appropriate renderer for the given content.type.
 *
 * Props:
 * - content: An object describing what to render in this pane. It has:
 *     - id: Unique identifier for this content instance
 *     - type: The content type string (e.g., 'editor', 'myplugin.video')
 *     - data: Arbitrary data for the renderer (shape depends on type)
 * - editorSettings: The current editor settings, passed to all renderers for consistency (even if not all use it)
 *
 * If no renderer is found for the given type, a fallback message is shown.
 *
 * This design allows for easy extension: new content types can be registered at runtime via the registry.
 */
import React from "react";
import { EditorSettings } from "@editor/editorStore/settings";
import { getContentRenderer } from "@editor/contentRegistry";

// Define the shape of content for rendering
export interface Content {
  id: string;
  type: string;
  data: any; // The shape of data depends on the content type/renderer
}

interface EditorPaneProps {
  content: Content;
  editorSettings: EditorSettings;
}

export const EditorPane: React.FC<EditorPaneProps> = ({ content, editorSettings }) => {
  const Renderer = getContentRenderer(content.type);
  if (Renderer) {
    return <Renderer content={content} editorSettings={editorSettings} />;
  }
  return (
    <div className="flex items-center justify-center h-full text-gray-400">
      Unknown content type: {content.type}
    </div>
  );
}; 