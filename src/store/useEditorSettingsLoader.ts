import { useEffect } from "react";
import { useEditorStore } from "../editor/editorStore";
import { watch, BaseDirectory } from "@tauri-apps/plugin-fs";
import { debug, error } from "@tauri-apps/plugin-log";
import { fetchAndMergeSettings } from "@services/fileSystem";
import { DEFAULT_EDITOR_SETTINGS } from "@editor/editorStore/settings";

export function useEditorSettingsLoader() {
  const { setEditorSettings, setSettingsLoading, setSettingsError } = useEditorStore();

  useEffect(() => {
    let unwatch: (() => void) | null = null;
    async function setupWatcher() {
      // Handler for file changes
      const handleSettingsChange = async () => {
        setSettingsLoading(true);
        setSettingsError(null);
        try {
          const mergedSettings = await fetchAndMergeSettings();
          debug(JSON.stringify(mergedSettings));
          setEditorSettings(mergedSettings);
          setSettingsLoading(false);
        } catch (e) {
          const errorMessage = e instanceof Error ? e.message : String(e);
          error(errorMessage);
          setEditorSettings(DEFAULT_EDITOR_SETTINGS);
          setSettingsError("Failed to load or parse settings.json");
          setSettingsLoading(false);
        }
      };
      // Initial load and watch for changes
      await handleSettingsChange();
      unwatch = await watch(
        'settings.json',
        handleSettingsChange,
        {
          baseDir: BaseDirectory.AppConfig,
          delayMs: 500,
        }
      );
    }
    setupWatcher().catch((e) => {
      const errorMessage = e instanceof Error ? e.message : String(e);
      error(`Failed to setup settings watcher: ${errorMessage}`);
      setSettingsError("Failed to initialize settings watcher");
      setSettingsLoading(false);
    });
    return () => {
      if (unwatch) unwatch();
    };
  }, [setEditorSettings, setSettingsError, setSettingsLoading]);
} 