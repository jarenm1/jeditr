import React, { useCallback, useEffect } from "react";
import { EditorSettings } from "@editor/editorStore/settings";
import { getContentRenderer } from "@editor/contentRegistry";
import { useEditorStore } from "@editor/editorStore";
import { useLanguageStore } from "@ubar/ubarStore/languageStore";

// Define the shape of content for rendering
export interface Content {
  id: string;
  type: string;
  data: any; // The shape of data depends on the content type/renderer
}

interface EditorPaneProps {
  content: Content;
  editorSettings: EditorSettings;
  paneId?: string; // Add paneId prop
}

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
 * - paneId: The pane ID for tracking language and other pane-specific state
 *
 * If no renderer is found for the given type, a fallback message is shown.
 *
 * This design allows for easy extension: new content types can be registered at runtime via the registry.
 */
export const EditorPane: React.FC<EditorPaneProps> = ({
  content,
  editorSettings,
  paneId,
}) => {
  const { activeWorkspaceId, setActivePaneInWorkspace } = useEditorStore();
  const { setPaneContentType } = useLanguageStore();
  
  // Track content type when pane or content changes
  useEffect(() => {
    if (paneId && content.type) {
      setPaneContentType(paneId, content.type);
    }
  }, [paneId, content.type, setPaneContentType]);
  
  // Handle focus to set this pane as active
  const handleFocus = useCallback(() => {
    if (paneId && activeWorkspaceId) {
      setActivePaneInWorkspace(activeWorkspaceId, paneId);
    }
  }, [paneId, activeWorkspaceId, setActivePaneInWorkspace]);
  
  const Renderer = getContentRenderer(content.type);
  if (Renderer) {
    return (
      <div className="h-full w-full" onFocus={handleFocus} onMouseDown={handleFocus}>
        <Renderer content={content} editorSettings={editorSettings} paneId={paneId} />
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center h-full text-gray-400" onFocus={handleFocus} onMouseDown={handleFocus}>
      Unknown content type: {content.type}
    </div>
  );
};
