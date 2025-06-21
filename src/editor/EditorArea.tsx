import React, { useState } from "react";
import { useEditorStore } from "@editor/editorStore/index";
import { Workspace } from "@editor/Workspace";
import { EditorSettings } from "@editor/editorStore/settings";

interface EditorAreaProps {
  editorSettings: EditorSettings;
  contentMap: Record<string, any>;
}

/**
 * EditorArea
 *
 * This component is the main container for the editor's content area.
 * It selects the active workspace from the store and renders it using the Workspace component.
 * If no workspace is active, it displays a fallback message.
 *
 * EditorArea is responsible for orchestrating the display of the user's current working context (workspace).
 */
export const EditorArea: React.FC<EditorAreaProps> = ({ editorSettings, contentMap }) => {
  const { workspaces, activeWorkspaceId } = useEditorStore();
  const activeWorkspace = workspaces.find(ws => ws.id === activeWorkspaceId);
  return (
    <div className="flex flex-row w-full h-full grow">
      {activeWorkspace ? (
        <Workspace workspace={activeWorkspace} editorSettings={editorSettings} contentMap={contentMap} />
      ) : (
        <div className="flex-1 flex items-center justify-center text-xl text-gray-400">No workspace open</div>
      )}
    </div>
  );
}; 