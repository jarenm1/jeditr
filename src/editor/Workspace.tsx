import React, { useEffect } from "react";
import { EditorWorkspace } from "@editor/editorStore/workspace";
import { EditorSettings } from "@editor/editorStore/settings";
import { EditorPane } from "@editor/EditorPane";
import { registerKeybind, unregisterKeybind } from "@services/keybinds";
import { useEditorStore } from "@editor/editorStore/index";
import { useLanguageStore } from "@ubar/ubarStore/languageStore";

interface WorkspaceProps {
  workspace: EditorWorkspace;
  editorSettings: EditorSettings;
  contentMap: Record<string, any>; // contentId -> content object
}

/**
 * Workspace
 *
 * This component renders a single workspace and its panes.
 * It maps each pane to its corresponding content and renders it using the EditorPane component.
 */
export const Workspace: React.FC<WorkspaceProps> = ({
  workspace,
  editorSettings,
  contentMap,
}) => {
  const { removePaneFromWorkspace, removeWorkspace, setActivePaneInWorkspace } = useEditorStore();
  const { removePaneLanguage } = useLanguageStore();

  // Register keybind for closing panes
  useEffect(() => {
    const closeCurrentPane = () => {
      // If there are no panes, close the workspace itself
      if (workspace.panes.length === 0) {
        removeWorkspace(workspace.id);
        return;
      }

      // Close the currently active pane instead of hardcoded first pane
      if (workspace.activePaneId) {
        const paneToClose = workspace.panes.find(p => p.id === workspace.activePaneId);
        if (paneToClose) {
          // Clean up language store entry (works for all content types)
          removePaneLanguage(paneToClose.id);
          // Remove the pane from workspace
          removePaneFromWorkspace(workspace.id, paneToClose.id);
          
          // If this was the last pane, close the workspace
          if (workspace.panes.length === 1) {
            removeWorkspace(workspace.id);
          }
        }
      } else {
        // Fallback: close first pane if no active pane is set
        const paneToClose = workspace.panes[0];
        removePaneLanguage(paneToClose.id);
        removePaneFromWorkspace(workspace.id, paneToClose.id);
        
        // If this was the last pane, close the workspace
        if (workspace.panes.length === 1) {
          removeWorkspace(workspace.id);
        }
      }
    };

    registerKeybind({
      id: `workspace-${workspace.id}-close-pane`,
      keys: ["Ctrl", "W"],
      description: "Close current pane or workspace",
      handler: closeCurrentPane,
    });

    return () => {
      unregisterKeybind(`workspace-${workspace.id}-close-pane`);
    };
  }, [workspace.id, workspace.panes, workspace.activePaneId, removePaneFromWorkspace, removeWorkspace, removePaneLanguage]);

  return (
    <div className="flex flex-row w-full h-full grow">
      {workspace.panes.map((pane) => {
        const content = contentMap[pane.contentId] || {
          id: pane.contentId,
          type: "unknown",
          data: {},
        };
        const isActivePane = workspace.activePaneId === pane.id;
        
        return (
          <div
            key={pane.id}
            className={`flex-1 min-w-0 h-full border-r border-gray-700 last:border-r-0 ${
              isActivePane ? 'ring-1 ring-blue-500/50' : ''
            }`}
          >
            <EditorPane 
              content={content} 
              editorSettings={editorSettings} 
              paneId={pane.id}
            />
          </div>
        );
      })}
    </div>
  );
};
