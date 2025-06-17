import "@editor/registerEditorContentType";
import { useEditorStore } from "@editor/editorStore";
import { EditorArea } from "@editor/EditorArea";
import Titlebar from "@components/Titlebar";
import React, { useEffect, useState } from "react";
import { ThemePickerModal } from "@components/ThemePickerModal";
import { setupGlobalVimDispatcher, registerVimKeybinding, registerVimAction, setVimLeader } from "@plugins/vim/vimGlobalKeybinds";
import { BottomBar } from "@ubar/BottomBar";
import { DEFAULT_EDITOR_SETTINGS } from "@editor/editorStore/settings";
import { NotificationModal } from "@plugins/NotificationModal";
import { loadAllPlugins } from "@plugins/loader";
import "@plugins/vim";

function App() {
  const { editorSettings, vimEnabled } = useEditorStore();
  const [showThemeModal, setShowThemeModal] = useState(false);

  // Load all plugins on mount
  useEffect(() => {
    loadAllPlugins();
  }, []);

  // Setup global Vim dispatcher and register actions on mount
  useEffect(() => {
    const getVimMode = () => (window as any).Vim?.getMode?.() || 'normal';
    const isEditorFocused = () => {
      return document.activeElement?.classList.contains('monaco-editor') || false;
    };
    const isVimEnabled = () => useEditorStore.getState().vimEnabled;
    const disposeVimDispatcher = setupGlobalVimDispatcher(getVimMode, isEditorFocused, isVimEnabled);
    registerVimKeybinding('<leader>th', 'openThemePicker');
    registerVimAction('openThemePicker', () => setShowThemeModal(true));
    return () => {
      disposeVimDispatcher();
    };
  }, []);

  useEffect(() => {
    if (editorSettings && typeof editorSettings['editor.vimLeader'] === 'string') {
      setVimLeader(editorSettings['editor.vimLeader']);
    }
  }, [editorSettings]);

  return (
    <>
      <NotificationModal />
      <main className="text-white flex flex-col h-full w-full">
        <Titlebar 
          currentFileName={""}
          isDirty={false}
          onOpen={() => {}}
          onSave={() => {}}
        />
        <ThemePickerModal
          isOpen={showThemeModal}
          onClose={() => setShowThemeModal(false)}
          onRequestOpen={() => setShowThemeModal(true)}
        />
        <div className="flex flex-col grow min-h-0 h-full">
          <div className="flex-1 flex flex-col min-h-0">
            <EditorArea editorSettings={editorSettings || DEFAULT_EDITOR_SETTINGS} />
          </div>
        </div>
        <BottomBar />
      </main>
    </>
  );
}

export default App;
