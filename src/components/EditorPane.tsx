import React from "react";
import { Editor } from "./Editor";
import { TabBar } from "./TabBar";
import { EditorPane as EditorPaneType, EditorTab, useEditorStore } from "../store/editorStore";
import { invoke } from "@tauri-apps/api/core";

interface EditorPaneProps {
  pane: EditorPaneType;
  editorSettings: any;
}

export const EditorPane: React.FC<EditorPaneProps> = ({ pane, editorSettings }) => {
  const {
    switchTab,
    closeTab,
    updateTabContent,
    setTabDirty,
  } = useEditorStore();

  const activeTab = pane.tabs.find(tab => tab.id === pane.activeTabId);

  const handleTabChange = (tabId: string) => {
    switchTab(pane.id, tabId);
  };

  const handleTabClose = (tabId: string) => {
    closeTab(pane.id, tabId);
  };

  const handleContentChange = (value: string) => {
    if (activeTab) {
      updateTabContent(pane.id, activeTab.id, value);
    }
  };

  const handleOpenFile = async () => {
    if (!activeTab) return;
    const content = await invoke("open_file", { path: activeTab.path });
    updateTabContent(pane.id, activeTab.id, String(content));
    setTabDirty(pane.id, activeTab.id, false);
  };

  const handleSaveFile = async () => {
    if (!activeTab) return;
    await invoke("save_file", { path: activeTab.path, content: activeTab.content });
    setTabDirty(pane.id, activeTab.id, false);
  };

  return (
    <div className="flex flex-col grow min-h-0 h-full w-full">
      <TabBar
        tabs={pane.tabs}
        activeTabId={pane.activeTabId}
        onTabChange={handleTabChange}
        onTabClose={handleTabClose}
      />
      <div className="flex-1 grow min-h-0 h-full">
        {activeTab ? (
          <Editor
            content={activeTab.content}
            language={activeTab.language}
            onChange={handleContentChange}
            settings={editorSettings}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">No file open</div>
        )}
      </div>
    </div>
  );
}; 