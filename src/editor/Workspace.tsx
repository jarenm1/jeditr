import React from 'react';
import { EditorWorkspace } from './editorStore/workspace';
import { EditorSettings } from './editorStore';
import { EditorPane } from './EditorPane';

interface WorkspaceProps {
  workspace: EditorWorkspace;
  editorSettings: EditorSettings;
}

/**
 * Workspace Component
 *
 * Renders all panes in a given workspace. Each workspace represents a user's working context and contains its own set of panes.
 * This component is used by EditorArea to display the active workspace.
 */
export const Workspace: React.FC<WorkspaceProps> = ({ workspace, editorSettings }) => {
  return (
    <div className="flex flex-row w-full h-full grow">
      {workspace.panes.map((pane) => (
        <div key={pane.id} className="flex-1 min-w-0 h-full border-r border-gray-700 last:border-r-0">
          <EditorPane content={{ id: pane.contentId, type: '', data: {} }} editorSettings={editorSettings} />
          {/* TODO: Pass correct content object for each pane */}
        </div>
      ))}
    </div>
  );
}; 