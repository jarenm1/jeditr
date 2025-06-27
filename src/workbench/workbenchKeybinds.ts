/**
 * @fileoverview
 * @author @jarenm1
 * 
 * Workbench Keybinds
 * Registers keybinds for workbench functionality using the keybind API
 */

import { registerDirectKeybind, registerBuiltinHandler } from '../api/keybinds';
import { 
  useWorkbenchStore, 
  openFileInWorkbench, 
  splitViewWithActiveTab,
  closeTabInWorkbench,
} from '../store/workbench';

// TODO: Global state for file selector modal
// This will be set by the Workbench component to allow keybinds to open the file selector
let fileSelectorCallbacks: {
  openFileSelector?: (splitMode?: boolean) => void;
} = {};

/**
 * Set the file selector callbacks from the Workbench component
 * This allows keybinds to trigger the file selector modal
 */
export function setFileSelectorCallbacks(callbacks: { openFileSelector?: (splitMode?: boolean) => void }): void {
  fileSelectorCallbacks = callbacks;
}

/**
 * Initialize workbench-specific keybinds
 * Call this during app startup to register all workbench keybinds
 */
export function initializeWorkbenchKeybinds(): void {
  console.log('🔧 Initializing workbench keybinds...');

  // TODO: Register built-in handlers for settings-based configuration
  
  // File operations
  registerBuiltinHandler('workbench.openFile', () => {
    // TODO: Trigger file selector modal
    if (fileSelectorCallbacks.openFileSelector) {
      fileSelectorCallbacks.openFileSelector(false);
    } else {
      console.warn('[Keybind] File selector not available');
    }
  }, 'Open file in current view');

  registerBuiltinHandler('workbench.openFileInNewView', () => {
    // TODO: Trigger file selector modal in split mode
    if (fileSelectorCallbacks.openFileSelector) {
      fileSelectorCallbacks.openFileSelector(true);
    } else {
      console.warn('[Keybind] File selector not available');
    }
  }, 'Open file in new split view');

  registerBuiltinHandler('workbench.newFile', () => {
    const store = useWorkbenchStore.getState();
    let targetViewId = store.activeViewId;
    
    if (!targetViewId || !store.hasView(targetViewId)) {
      targetViewId = store.addView();
      store.setActiveView(targetViewId);
    }
    
    const tabId = store.addTabToView(targetViewId, {
      name: 'Untitled',
      filePath: '',
      viewType: 'text-editor',
      isModified: false,
    });
    
    store.addToFocusHistory(targetViewId, tabId);
    console.log('[Keybind] Created new file');
  }, 'Create new file in current view');

  // View management
  registerBuiltinHandler('workbench.splitActiveTab', () => {
    const store = useWorkbenchStore.getState();
    if (store.activeViewId) {
      const result = splitViewWithActiveTab(store.activeViewId);
      if (result) {
        console.log('[Keybind] Split active tab to new view');
      } else {
        console.warn('[Keybind] No active tab to split');
      }
    }
  }, 'Split active tab to new view');

  registerBuiltinHandler('workbench.closeActiveTab', () => {
    const store = useWorkbenchStore.getState();
    if (store.activeViewId) {
      const activeTab = store.getActiveTabInView(store.activeViewId);
      if (activeTab) {
        closeTabInWorkbench(store.activeViewId, activeTab.id);
        console.log('[Keybind] Closed active tab');
      }
    }
  }, 'Close active tab');

  registerBuiltinHandler('workbench.closeActiveView', () => {
    const store = useWorkbenchStore.getState();
    if (store.activeViewId) {
      const viewToClose = store.activeViewId;
      
      // TODO: Focus another view before closing if available
      const currentIndex = store.viewOrder.indexOf(viewToClose);
      const nextViewId = store.viewOrder.find((id, index) => index !== currentIndex);
      
      if (nextViewId) {
        store.setActiveView(nextViewId);
      }
      
      store.removeView(viewToClose);
      console.log('[Keybind] Closed active view');
      
      // TODO: Create a new view if none left
      if (store.views.length === 0) {
        const newViewId = store.addView();
        store.setActiveView(newViewId);
      }
    }
  }, 'Close active view');

  // Navigation
  registerBuiltinHandler('workbench.focusNextView', () => {
    const store = useWorkbenchStore.getState();
    const currentIndex = store.viewOrder.indexOf(store.activeViewId || '');
    
    if (currentIndex !== -1 && store.viewOrder.length > 1) {
      const nextIndex = (currentIndex + 1) % store.viewOrder.length;
      const nextViewId = store.viewOrder[nextIndex];
      store.setActiveView(nextViewId);
      console.log('[Keybind] Focused next view');
    }
  }, 'Focus next view');

  registerBuiltinHandler('workbench.focusPreviousView', () => {
    const store = useWorkbenchStore.getState();
    const currentIndex = store.viewOrder.indexOf(store.activeViewId || '');
    
    if (currentIndex !== -1 && store.viewOrder.length > 1) {
      const prevIndex = currentIndex === 0 ? store.viewOrder.length - 1 : currentIndex - 1;
      const prevViewId = store.viewOrder[prevIndex];
      store.setActiveView(prevViewId);
      console.log('[Keybind] Focused previous view');
    }
  }, 'Focus previous view');

  registerBuiltinHandler('workbench.focusNextTab', () => {
    const store = useWorkbenchStore.getState();
    if (store.activeViewId) {
      const view = store.getView(store.activeViewId);
      if (view && view.tabs.length > 1) {
        const currentTabIndex = view.tabs.findIndex(tab => tab.id === view.activeTabId);
        if (currentTabIndex !== -1) {
          const nextIndex = (currentTabIndex + 1) % view.tabs.length;
          const nextTab = view.tabs[nextIndex];
          store.setActiveTabInView(store.activeViewId, nextTab.id);
          store.addToFocusHistory(store.activeViewId, nextTab.id);
          console.log('[Keybind] Focused next tab');
        }
      }
    }
  }, 'Focus next tab in current view');

  registerBuiltinHandler('workbench.focusPreviousTab', () => {
    const store = useWorkbenchStore.getState();
    if (store.activeViewId) {
      const view = store.getView(store.activeViewId);
      if (view && view.tabs.length > 1) {
        const currentTabIndex = view.tabs.findIndex(tab => tab.id === view.activeTabId);
        if (currentTabIndex !== -1) {
          const prevIndex = currentTabIndex === 0 ? view.tabs.length - 1 : currentTabIndex - 1;
          const prevTab = view.tabs[prevIndex];
          store.setActiveTabInView(store.activeViewId, prevTab.id);
          store.addToFocusHistory(store.activeViewId, prevTab.id);
          console.log('[Keybind] Focused previous tab');
        }
      }
    }
  }, 'Focus previous tab in current view');

  // TODO: Register direct keybinds with default key combinations
  // These are immediately active and don't require settings.json configuration
  
  registerDirectKeybind({
    id: 'workbench.openFile.direct',
    keys: ['Ctrl', 'O'],
    description: 'Open file',
    handler: () => {
      if (fileSelectorCallbacks.openFileSelector) {
        fileSelectorCallbacks.openFileSelector(false);
      }
    }
  });

  registerDirectKeybind({
    id: 'workbench.openFileInNewView.direct',
    keys: ['Ctrl', 'Shift', 'O'],
    description: 'Open file in new split view',
    handler: () => {
      if (fileSelectorCallbacks.openFileSelector) {
        fileSelectorCallbacks.openFileSelector(true);
      }
    }
  });
  
  registerDirectKeybind({
    id: 'workbench.splitActiveTab.direct',
    keys: ['Ctrl', '\\'],
    description: 'Split active tab to new view',
    handler: () => {
      const store = useWorkbenchStore.getState();
      if (store.activeViewId) {
        splitViewWithActiveTab(store.activeViewId);
      }
    }
  });

  registerDirectKeybind({
    id: 'workbench.closeActiveTab.direct',
    keys: ['Ctrl', 'W'],
    description: 'Close active tab',
    handler: () => {
      const store = useWorkbenchStore.getState();
      if (store.activeViewId) {
        const activeTab = store.getActiveTabInView(store.activeViewId);
        if (activeTab) {
          closeTabInWorkbench(store.activeViewId, activeTab.id);
        }
      }
    }
  });

  registerDirectKeybind({
    id: 'workbench.newFile.direct',
    keys: ['Ctrl', 'N'],
    description: 'Create new file',
    handler: () => {
      const store = useWorkbenchStore.getState();
      let targetViewId = store.activeViewId;
      
      if (!targetViewId || !store.hasView(targetViewId)) {
        targetViewId = store.addView();
        store.setActiveView(targetViewId);
      }
      
      store.addTabToView(targetViewId, {
        name: 'Untitled',
        filePath: '',
        viewType: 'text-editor',
        isModified: false,
      });
    }
  });

  registerDirectKeybind({
    id: 'workbench.focusNextView.direct',
    keys: ['Ctrl', 'Alt', 'Right'],
    description: 'Focus next view',
    handler: () => {
      const store = useWorkbenchStore.getState();
      const currentIndex = store.viewOrder.indexOf(store.activeViewId || '');
      
      if (currentIndex !== -1 && store.viewOrder.length > 1) {
        const nextIndex = (currentIndex + 1) % store.viewOrder.length;
        store.setActiveView(store.viewOrder[nextIndex]);
      }
    }
  });

  registerDirectKeybind({
    id: 'workbench.focusPreviousView.direct',
    keys: ['Ctrl', 'Alt', 'Left'],
    description: 'Focus previous view',
    handler: () => {
      const store = useWorkbenchStore.getState();
      const currentIndex = store.viewOrder.indexOf(store.activeViewId || '');
      
      if (currentIndex !== -1 && store.viewOrder.length > 1) {
        const prevIndex = currentIndex === 0 ? store.viewOrder.length - 1 : currentIndex - 1;
        store.setActiveView(store.viewOrder[prevIndex]);
      }
    }
  });

  registerDirectKeybind({
    id: 'workbench.focusNextTab.direct',
    keys: ['Ctrl', 'Tab'],
    description: 'Focus next tab',
    handler: () => {
      const store = useWorkbenchStore.getState();
      if (store.activeViewId) {
        const view = store.getView(store.activeViewId);
        if (view && view.tabs.length > 1) {
          const currentTabIndex = view.tabs.findIndex(tab => tab.id === view.activeTabId);
          if (currentTabIndex !== -1) {
            const nextIndex = (currentTabIndex + 1) % view.tabs.length;
            const nextTab = view.tabs[nextIndex];
            store.setActiveTabInView(store.activeViewId, nextTab.id);
          }
        }
      }
    }
  });

  registerDirectKeybind({
    id: 'workbench.focusPreviousTab.direct',
    keys: ['Ctrl', 'Shift', 'Tab'],
    description: 'Focus previous tab',
    handler: () => {
      const store = useWorkbenchStore.getState();
      if (store.activeViewId) {
        const view = store.getView(store.activeViewId);
        if (view && view.tabs.length > 1) {
          const currentTabIndex = view.tabs.findIndex(tab => tab.id === view.activeTabId);
          if (currentTabIndex !== -1) {
            const prevIndex = currentTabIndex === 0 ? view.tabs.length - 1 : currentTabIndex - 1;
            const prevTab = view.tabs[prevIndex];
            store.setActiveTabInView(store.activeViewId, prevTab.id);
          }
        }
      }
    }
  });

  console.log('✅ Workbench keybinds initialized');
}

/**
 * Opens a file using the workbench system
 * Can be called from file selector or other UI components
 */
export function openFileInCurrentView(filePath: string, viewType?: string): void {
  try {
    const result = openFileInWorkbench(filePath, viewType || 'readOnly', filePath.split('/').pop() || 'Untitled');
    console.log(`[Workbench] Opened file: ${filePath} with view type: ${viewType || 'readOnly'} in tab ${result}`);
  } catch (error) {
    console.error('[Workbench] Failed to open file:', error);
  }
} 