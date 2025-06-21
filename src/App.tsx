import "@editor/registerEditorContentType";
import { useEditorStore } from "@editor/editorStore";
import { EditorArea } from "@editor/EditorArea";
import Titlebar from "@components/Titlebar";
import React, { useEffect, useState, useRef } from "react";
import { BottomBar } from "@ubar/BottomBar";
import { DEFAULT_EDITOR_SETTINGS } from "@editor/editorStore/settings";
import { NotificationModal } from "@plugins/api/notification/Notification";
import { loadAllPlugins } from "@plugins/loader";
import "@services/keybinds";
import { registerKeybind, unregisterKeybind } from "@services/keybinds";
import { FileSelector } from "@components/FileSelector";
import { ThemeSelector } from "@components/ThemeSelector";
import { readFile, saveFile } from "@services/fileSystem";
import { nanoid } from "nanoid";
import { detectLanguage } from "@language/registry";
import { PluginModals } from '@plugins/api/modal/PluginModals';
import { focusFirstNotification } from '@plugins/api/notification/notificationStore';
import { useNotificationStore } from '@plugins/api/notification/notificationStore';

function App() {
  const { editorSettings, vimEnabled, workspaces, activeWorkspaceId, addPaneToWorkspace } = useEditorStore();
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showFileSelector, setShowFileSelector] = useState(false);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [contentMap, setContentMap] = useState<Record<string, any>>({});
  const lastOpenedFileRef = useRef<string | null>(null);
  const contentMapRef = useRef(contentMap);

  // Keep contentMapRef in sync
  contentMapRef.current = contentMap;

  // Load all plugins on mount
  useEffect(() => {
    loadAllPlugins();
  }, []);

  // Load and apply default theme on mount
  useEffect(() => {
    import('@services/themeLoader').then(({ loadAllThemes, applyTheme, getTheme }) => {
      loadAllThemes().then(themes => {
        // Try to apply default dark theme, fall back to first available theme
        const defaultTheme = getTheme('Default Dark') || themes[0];
        if (defaultTheme) {
          applyTheme(defaultTheme);
          console.log('Applied theme:', defaultTheme.name);
        }
      }).catch(err => {
        console.warn('Failed to load themes:', err);
      });
    });
  }, []);

  // Setup global Vim dispatcher and register actions on mount
  useEffect(() => {
    const getVimMode = () => (window as any).Vim?.getMode?.() || 'normal';
    const isEditorFocused = () => {
      return document.activeElement?.classList.contains('monaco-editor') || false;
    };
    const isVimEnabled = () => useEditorStore.getState().vimEnabled;

  }, []);

  // Register file selector keybind once
  useEffect(() => {
    registerKeybind({
      id: 'fileSelector.open',
      keys: ['Ctrl', 'O'],
      description: 'Open file selector modal',
      handler: () => setShowFileSelector(true),
    });
    return () => {
      unregisterKeybind('fileSelector.open');
    };
  }, []);

  // Register save file keybind ONCE, always use latest contentMap via ref
  useEffect(() => {
    registerKeybind({
      id: 'file.save',
      keys: ['Ctrl', 'W'],
      description: 'Save the currently active file',
      handler: async () => {
        const fileId = lastOpenedFileRef.current;
        if (!fileId) {
          alert('No file to save.');
          return;
        }
        const contentObj = contentMapRef.current[fileId];
        if (!contentObj || !contentObj.data?.path) {
          alert('No file to save.');
          return;
        }
        try {
          await saveFile(contentObj.data.path, contentObj.data.content);
          alert('File saved!');
        } catch (err) {
          alert('Failed to save file: ' + (err instanceof Error ? err.message : String(err)));
        }
      },
    });
    return () => {
      unregisterKeybind('file.save');
    };
  }, []);

  // Register terminal keybind ONCE
  useEffect(() => {
    registerKeybind({
      id: 'terminal.open',
      keys: ['Ctrl', 'T'],
      description: 'Open a new terminal',
      handler: () => {
        const contentId = `terminal-${nanoid()}`;
        const pane = {
          id: `pane-${nanoid()}`,
          contentId,
        };
        if (activeWorkspaceId) {
          addPaneToWorkspace(activeWorkspaceId, pane);
        }
        setContentMap(prev => ({
          ...prev,
          [contentId]: {
            id: contentId,
            type: 'terminal',
            data: {
              initialText: '', // Optionally set initial text
            },
          },
        }));
      },
    });
    return () => {
      unregisterKeybind('terminal.open');
    };
  }, [activeWorkspaceId, addPaneToWorkspace]);

  // Register notification focus keybind
  useEffect(() => {
    registerKeybind({
      id: 'notification.focus',
      keys: ['Ctrl', 'Shift', 'N'],
      description: 'Focus notification area',
      handler: () => {
        focusFirstNotification();
      },
    });
    return () => {
      unregisterKeybind('notification.focus');
    };
  }, []);

  // Register notification clear all keybind
  useEffect(() => {
    registerKeybind({
      id: 'notification.clearAll',
      keys: ['Ctrl', 'Shift', 'C'],
      description: 'Clear all notifications',
      handler: () => {
        const notifications = useNotificationStore.getState().notifications;
        notifications.forEach(n => useNotificationStore.getState().removeNotification(n.id));
      },
    });
    return () => {
      unregisterKeybind('notification.clearAll');
    };
  }, []);

  // Register theme selector keybind
  useEffect(() => {
    registerKeybind({
      id: 'themeSelector.open',
      keys: ['Ctrl', 'H'],
      description: 'Open theme selector modal',
      handler: () => setShowThemeSelector(true),
    });
    return () => {
      unregisterKeybind('themeSelector.open');
    };
  }, []);

  // Handler for file selection
  async function handleFileSelect(file: { label: string; value: any }) {
    try {
      const content = await readFile(file.value);
      const contentId = `editor-${nanoid()}`;
      const language = detectLanguage(file.value, content);
      // Create a new pane with content type 'editor'
      const pane = {
        id: `pane-${nanoid()}`,
        contentId,
      };
      // Add the pane to the active workspace
      if (activeWorkspaceId) {
        addPaneToWorkspace(activeWorkspaceId, pane);
      }
      // Add the content object to the contentMap, with a real onChange handler
      setContentMap(prev => {
        lastOpenedFileRef.current = contentId;
        return {
          ...prev,
          [contentId]: {
            id: contentId,
            type: 'editor',
            data: {
              content,
              path: file.value,
              language,
              onChange: (newContent: string) => {
                setContentMap(prev2 => ({
                  ...prev2,
                  [contentId]: {
                    ...prev2[contentId],
                    data: {
                      ...prev2[contentId].data,
                      content: newContent,
                    },
                  },
                }));
              },
            },
          },
        };
      });
    } catch (err) {
      alert('Failed to open file: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setShowFileSelector(false);
    }
  }

  return (
    <>
      <NotificationModal />
      <PluginModals />
      <main className="text-white flex flex-col h-full w-full">
        <Titlebar 
          // Removed invalid props 'onOpen' and 'onSave' from Titlebar
          currentFileName={""}
          isDirty={false}
        />
        <FileSelector
          isOpen={showFileSelector}
          onClose={() => setShowFileSelector(false)}
          onSelect={handleFileSelect}
        />
        <ThemeSelector
          isOpen={showThemeSelector}
          onClose={() => setShowThemeSelector(false)}
          onSelect={(theme) => {
            console.log('Theme selected:', theme.name);
          }}
        />
        <div className="flex flex-col grow min-h-0 h-full">
          <div className="flex-1 flex flex-col min-h-0">
            <EditorArea editorSettings={editorSettings || DEFAULT_EDITOR_SETTINGS} contentMap={contentMap} />
          </div>
        </div>
        <BottomBar />
      </main>
    </>
  );
}

export default App;
