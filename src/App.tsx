import { useEffect } from "react";
import { loadPluginsFromSettings } from "./api/plugins/loader";
import {
  initializeBuiltinHandlers,
  initializeTempKeybinds,
  // loadKeybindsFromSettings, // TODO: Commented out for now
} from "./api/keybinds";
import { Tooltips } from "./api/ui/tooltips/Tooltip";
import { NotificationModal } from "./api/ui/notifications/Notification";
import { PluginModals } from "./api/ui/modals/PluginModals";
import Titlebar from "./components/Titlebar";
import { UtilityBar, initializeDefaultWidgets } from "./api/ui/utilitybar";
// import { loadSettings } from "./services/fileSystem"; // TODO: Commented out for now
import { Workbench } from "./workbench/Workbench";
import { initializeDefaultViews } from "./views";

function App() {
  // Load plugins, keybinds, and initialize components on mount
  useEffect(() => {
    async function initializeApp() {
      console.log("🚀 Initializing application...");

      // Initialize built-in views first
      initializeDefaultViews();

      // Initialize built-in keybind handlers
      initializeBuiltinHandlers();

      // Load plugins (currently empty, but ready for user settings)
      await loadPluginsFromSettings([]);

      // TODO: TEMPORARY - Use simple keybind object instead of settings.json
      initializeTempKeybinds();

      // TODO: COMMENTED OUT - Original settings.json loading
      /*
      // Load user settings and configure keybinds
      try {
        const settings = await loadSettings();
        if (settings.keybinds) {
          await loadKeybindsFromSettings(settings.keybinds);
        } else {
          console.log(
            "📋 No keybinds found in settings, using defaults from settings.json",
          );
        }
      } catch (error) {
        console.error("❌ Failed to load keybinds from settings:", error);
      }
      */

      // Initialize utility bar widgets
      initializeDefaultWidgets();

      console.log("✅ Application initialization complete");
    }

    initializeApp();
  }, []);

  return (
    <>
      <NotificationModal />
      <PluginModals />
      <Tooltips />
      <main className="text-white flex flex-col h-full w-full">
        <Titlebar
          // Removed invalid props 'onOpen' and 'onSave' from Titlebar
          currentFileName={""}
          isDirty={false}
        />
        <div className="flex flex-col grow min-h-0 h-full">
          <div className="flex-1 flex flex-col min-h-0">
            <Workbench />
          </div>
        </div>
        <UtilityBar />
      </main>
    </>
  );
}

export default App;
