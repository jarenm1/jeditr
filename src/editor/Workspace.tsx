import React, { useEffect } from 'react';
import { EditorWorkspace } from '@editor/editorStore/workspace';
import { EditorSettings } from '@editor/editorStore/settings';
import { EditorPane } from '@editor/EditorPane';
import { registerKeybind, unregisterKeybind } from '@services/keybinds';
import { useEditorStore } from '@editor/editorStore/index';

interface WorkspaceProps {
  workspace: EditorWorkspace;
  editorSettings: EditorSettings;
  contentMap: Record<string, any>; // contentId -> content object
}

/**
 * Workspace Component
 *
 * Renders all panes in a given workspace. Each workspace represents a user's working context and contains its own set of panes.
 * This component is used by EditorArea to display the active workspace.
 */
export const Workspace: React.FC<WorkspaceProps> = ({ workspace, editorSettings, contentMap }) => {
  useEffect(() => {

    // Registered in component because it is only needed when component is mounted.
    registerKeybind({
      id: 'pane.close',
      keys: ['Ctrl', 'Q'],
      description: 'Close the focused pane',
      handler: () => {
        const { activeWorkspaceId, workspaces, removePaneFromWorkspace, removeWorkspace } = useEditorStore.getState() as any;
        const ws = workspaces.find((w: EditorWorkspace) => w.id === activeWorkspaceId);
        if (ws && ws.panes.length > 0) {
          // For now, close the last pane (could be improved to track focus)
          const paneId = ws.panes[ws.panes.length - 1].id;
          removePaneFromWorkspace(ws.id, paneId);
          // Check if workspace is now empty
          const updatedWs = workspaces.find((w: EditorWorkspace) => w.id === ws.id);
          if (updatedWs && updatedWs.panes.length === 1 && workspaces.length > 1) {
            // After removal, will be 0 panes, so remove workspace
            removeWorkspace(ws.id);
          }
        } else if (ws && ws.panes.length === 0 && workspaces.length > 1) {
          // If already no panes, remove workspace
          removeWorkspace(ws.id);
        }
      },
    });

    // Cleanup on unmount
    return () => {
      unregisterKeybind('pane.close');
    };
  }, []);

  return (
    <div className="flex flex-row w-full h-full grow">
      {workspace.panes.map((pane) => {
        const content = contentMap[pane.contentId] || { id: pane.contentId, type: 'unknown', data: {} };
        return (
          <div key={pane.id} className="flex-1 min-w-0 h-full border-r border-gray-700 last:border-r-0">
            <EditorPane content={content} editorSettings={editorSettings} />
          </div>
        );
      })}
    </div>
  );
}; 