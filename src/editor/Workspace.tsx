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
    // Register "new workspace" keybind
    registerKeybind({
      id: 'workspace.new',
      keys: ['Ctrl', 'N'],
      description: 'Open a new workspace',
      handler: () => {
        const { workspaces, addWorkspace } = useEditorStore.getState() as any;
        const nextNum = workspaces.length + 1;
        addWorkspace(`Workspace ${nextNum}`);
      },
    });

    // Register "next workspace" keybind
    registerKeybind({
      id: 'workspace.next',
      keys: ['Ctrl', 'Tab'],
      description: 'Switch to next workspace',
      handler: () => {
        const { workspaces, activeWorkspaceId, setActiveWorkspace } = useEditorStore.getState() as any;
        if (workspaces.length === 0) return;
        const idx = workspaces.findIndex((ws: EditorWorkspace) => ws.id === activeWorkspaceId);
        const nextIdx = (idx + 1) % workspaces.length;
        setActiveWorkspace(workspaces[nextIdx].id);
      },
    });

    // Register "close pane" keybind (Ctrl+Q)
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
      unregisterKeybind('workspace.new');
      unregisterKeybind('workspace.next');
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