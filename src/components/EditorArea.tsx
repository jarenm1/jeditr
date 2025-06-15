import React from "react";
import { useEditorStore, EditorSettings } from "@store/editorStore";
import { EditorPane } from "@components/EditorPane";

interface EditorAreaProps {
  editorSettings: EditorSettings;
}

export const EditorArea: React.FC<EditorAreaProps> = ({ editorSettings }) => {
  const { panes } = useEditorStore();
  return (
    <div className="flex flex-row w-full h-full grow">
      {panes.map((pane) => (
        <div key={pane.id} className="flex-1 min-w-0 h-full border-r border-gray-700 last:border-r-0">
          <EditorPane pane={pane} editorSettings={editorSettings} />
        </div>
      ))}
    </div>
  );
}; 