import { useEffect } from "react";
import { useEditorStore } from "./editorStore";
import { watch, BaseDirectory } from "@tauri-apps/plugin-fs";
import { debug, error } from "@tauri-apps/plugin-log";
import { fetchAndMergeSettings } from "@services/fileSystem";

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
          error(e as string);
          setEditorSettings({});
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
    setupWatcher();
    return () => {
      if (unwatch) unwatch();
    };
  }, [setEditorSettings, setSettingsError, setSettingsLoading]);
} 