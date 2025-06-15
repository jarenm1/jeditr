import { useEditorSettingsLoader } from "@store/useEditorSettingsLoader";
import { useEditorStore } from "@store/editorStore";
import { EditorArea } from "@components/EditorArea";
import Titlebar from "@components/Titlebar";
import React, { useEffect, useState } from "react";
import { ThemePickerModal } from "@components/ThemePickerModal";
import { setupGlobalVimDispatcher, registerVimKeybinding, registerVimAction, setVimLeader } from "@services/vimGlobalKeybinds";
import { BottomBar } from "@components/BottomBar";

function App() {
  useEditorSettingsLoader();
  const {
    editorSettings,
    settingsLoading,
    settingsError,
    vimEnabled,
  } = useEditorStore();

  const [showThemeModal, setShowThemeModal] = useState(false);

  // Setup global Vim dispatcher and register actions on mount
  useEffect(() => {
    // Provide functions for dispatcher
    const getVimMode = () => (window as any).Vim?.getMode?.() || 'normal';
    const isEditorFocused = () => {
      // Monaco editor root has class 'monaco-editor'
      return document.activeElement?.classList.contains('monaco-editor') || false;
    };
    const isVimEnabled = () => useEditorStore.getState().vimEnabled;
    const disposeVimDispatcher = setupGlobalVimDispatcher(getVimMode, isEditorFocused, isVimEnabled);
    // Register global Vim action for theme picker
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
    <main className="text-white flex flex-col h-full w-full">
      <Titlebar 
        currentFileName={""} // Will be handled per pane/tab
        isDirty={false} // Will be handled per pane/tab
        onOpen={() => {}} // Will be handled per pane/tab
        onSave={() => {}} // Will be handled per pane/tab
      />
      <ThemePickerModal
        isOpen={showThemeModal}
        onClose={() => setShowThemeModal(false)}
        onRequestOpen={() => setShowThemeModal(true)}
      />
      <div className="flex flex-col grow min-h-0 h-full">
        <div className="flex-1 flex flex-col min-h-0">
          {settingsLoading ? (
            <div className="flex-1 flex items-center justify-center text-lg">Loading editor settings...</div>
          ) : settingsError ? (
            <div className="flex-1 flex items-center justify-center text-red-500 text-lg">{settingsError}</div>
          ) : editorSettings ? (
            <EditorArea editorSettings={editorSettings} />
          ) : null}
        </div>
      </div>
      <BottomBar />
    </main>
  );
}

export default App;
