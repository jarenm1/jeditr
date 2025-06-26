import { useEffect } from "react";
import { loadPluginsFromSettings } from "./api/plugins/loader";
import { 
  initializeBuiltinHandlers, 
  loadKeybindsFromSettings 
} from "./api/keybinds";
import { Tooltips } from "./api/ui/tooltips/Tooltip";
import { NotificationModal } from "./api/ui/notifications/Notification";
import { PluginModals } from "./api/ui/modals/PluginModals";
import Titlebar from "./components/Titlebar";
import { EditorArea } from "./editor/EditorArea";
import { UtilityBar, initializeDefaultWidgets } from "./api/ui/utilitybar";
import { useEditorStore } from "./editor/editorStore";
import { loadSettings } from "./services/fileSystem";

function App() {
  // Temporary empty contentMap until proper content management is implemented
  const contentMap = {};



  // Load plugins, keybinds, and initialize components on mount
  useEffect(() => {
    async function initializeApp() {
      console.log('🚀 Initializing application...');
      
      // Initialize built-in keybind handlers first
      initializeBuiltinHandlers();
      
      // Load plugins (currently empty, but ready for user settings)
      await loadPluginsFromSettings([]);
      
      // Load user settings and configure keybinds
      try {
        const settings = await loadSettings();
        if (settings.keybinds) {
          await loadKeybindsFromSettings(settings.keybinds);
        } else {
          console.log('📋 No keybinds found in settings, using defaults from settings.json');
        }
      } catch (error) {
        console.error('❌ Failed to load keybinds from settings:', error);
      }
      
      // Initialize utility bar widgets
      initializeDefaultWidgets();
      
      console.log('✅ Application initialization complete');
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
            <EditorArea contentMap={contentMap} />
          </div>
        </div>
        <UtilityBar />
      </main>
        </>
  );
}

export default App;
