import "@editor/registerEditorContentType";
import { useEditorStore } from "@editor/editorStore";
import { EditorArea } from "@editor/EditorArea";
import Titlebar from "@components/Titlebar";
import { useEffect, useState, useRef } from "react";
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
import { detectLanguage } from "@plugins/api/language";
import { PluginModals } from "@plugins/api/modal/PluginModals";
import { focusFirstNotification } from "@plugins/api/notification/notificationStore";
import { useNotificationStore } from "@plugins/api/notification/notificationStore";
import { terminalService } from "@services/terminalService";

function App() {
  const { editorSettings, activeWorkspaceId, addPaneToWorkspace, workspaces } =
    useEditorStore();
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
    import("@services/themeLoader").then(
      ({ loadAllThemes, applyTheme, getTheme }) => {
        loadAllThemes()
          .then((themes) => {
            // Try to apply default dark theme, fall back to first available theme
            const defaultTheme = getTheme("Default Dark") || themes[0];
            if (defaultTheme) {
              applyTheme(defaultTheme);
              console.log("Applied theme:", defaultTheme.name);
            }
          })
          .catch((err) => {
            console.warn("Failed to load themes:", err);
          });
      },
    );
  }, []);

  // Register terminal service and keybind
  useEffect(() => {
    // Register the app as the terminal manager
    terminalService.setManager({
      contentMap,
      setContentMap,
    });

    // Register the terminal keybind
    terminalService.registerKeybind();

    return () => {
      terminalService.unregisterKeybind();
    };
  }, [contentMap]);

  // Register file selector keybind once
  useEffect(() => {
    registerKeybind({
      id: "fileSelector.open",
      keys: ["Ctrl", "O"],
      description: "Open file selector modal",
      handler: () => setShowFileSelector(true),
    });
    return () => {
      unregisterKeybind("fileSelector.open");
    };
  }, []);

  // Register theme selector keybind once
  useEffect(() => {
    registerKeybind({
      id: "themeSelector.open",
      keys: ["Ctrl", "H"],
      description: "Open theme selector modal", 
      handler: () => setShowThemeSelector(true),
    });
    return () => {
      unregisterKeybind("themeSelector.open");
    };
  }, []);

  // Keybind for saving files
  useEffect(() => {
    registerKeybind({
      id: "file.save",
      keys: ["Ctrl", "S"],
      description: "Save current file",
      handler: async () => {
        if (lastOpenedFileRef.current) {
          const contentObj = contentMapRef.current[lastOpenedFileRef.current];
          if (contentObj && contentObj.data?.path && contentObj.data?.content) {
            try {
              await saveFile(contentObj.data.path, contentObj.data.content);
              console.log("File saved successfully");
            } catch (err) {
              alert(
                "Failed to save file: " +
                  (err instanceof Error ? err.message : String(err)),
              );
            }
          }
        }
      },
    });
    return () => {
      unregisterKeybind("file.save");
    };
  }, []);

  // Register notification keybinds
  const { notifications } = useNotificationStore();
  useEffect(() => {
    registerKeybind({
      id: "notification.focus",
      keys: ["Ctrl", "Shift", "N"],
      description: "Focus first notification",
      handler: () => {
        focusFirstNotification();
      },
    });
    return () => {
      unregisterKeybind("notification.focus");
    };
  }, []);

  // Keybind for opening file selector with Ctrl+P
  useEffect(() => {
    registerKeybind({
      id: "fileSelector.openFuzzy",
      keys: ["Ctrl", "P"],
      description: "Open fuzzy file finder",
      handler: () => setShowFileSelector(true),
    });
    return () => {
      unregisterKeybind("fileSelector.openFuzzy");
    };
  }, []);

  // Add keybind for closing notifications
  useEffect(() => {
    const dismissAllNotifications = () => {
      // Remove all notifications by getting their IDs and removing them one by one
      const { notifications, removeNotification } = useNotificationStore.getState();
      notifications.forEach(notification => removeNotification(notification.id));
    };

    registerKeybind({
      id: "notification.dismissAll",
      keys: ["Escape"],
      description: "Dismiss all notifications",
      handler: dismissAllNotifications,
    });

    return () => {
      unregisterKeybind("notification.dismissAll");
    };
  }, []);

  // Focus notification when new ones arrive
  useEffect(() => {
    if (notifications.length > 0) {
      // Auto-focus the first notification when new ones arrive
      setTimeout(() => {
        focusFirstNotification();
      }, 100);
    }
  }, [notifications.length]);

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
      setContentMap((prev) => {
        lastOpenedFileRef.current = contentId;
        return {
          ...prev,
          [contentId]: {
            id: contentId,
            type: "editor",
            data: {
              content,
              path: file.value,
              language,
              onChange: (newContent: string) => {
                setContentMap((prev2) => ({
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
      alert(
        "Failed to open file: " +
          (err instanceof Error ? err.message : String(err)),
      );
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
            console.log("Theme selected:", theme.name);
          }}
        />
        <div className="flex flex-col grow min-h-0 h-full">
          <div className="flex-1 flex flex-col min-h-0">
            <EditorArea
              editorSettings={editorSettings || DEFAULT_EDITOR_SETTINGS}
              contentMap={contentMap}
            />
          </div>
        </div>
        <BottomBar />
      </main>
        </>
  );
}

export default App;
