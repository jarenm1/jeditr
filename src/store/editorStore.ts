import { create } from 'zustand';
import { detectLanguage } from '@language/registry';

export interface EditorTab {
  id: string;
  path: string;
  content: string;
  isDirty: boolean;
  language: string;
}

export interface EditorPane {
  id: string;
  tabs: EditorTab[];
  activeTabId: string | null;
}

export interface EditorSettings {
  [key: string]: any;
}

interface EditorState {
  panes: EditorPane[];
  editorSettings: EditorSettings | null;
  vimEnabled: boolean;
  settingsLoading: boolean;
  settingsError: string | null;
  // Actions
  addPane: () => void;
  removePane: (paneId: string) => void;
  openTab: (paneId: string, path: string, content: string) => void;
  closeTab: (paneId: string, tabId: string) => void;
  switchTab: (paneId: string, tabId: string) => void;
  updateTabContent: (paneId: string, tabId: string, content: string) => void;
  setTabDirty: (paneId: string, tabId: string, isDirty: boolean) => void;
  setEditorSettings: (settings: EditorSettings) => void;
  setVimEnabled: (enabled: boolean) => void;
  setSettingsLoading: (loading: boolean) => void;
  setSettingsError: (error: string | null) => void;
}

function createDefaultPane(): EditorPane {
  return {
    id: 'pane-1',
    tabs: [
      {
        id: 'untitled',
        path: 'untitled.txt',
        content: "console.log('Hello, world!');",
        isDirty: false,
        language: detectLanguage('untitled.txt', "console.log('Hello, world!');"),
      },
    ],
    activeTabId: 'untitled',
  };
}

export const useEditorStore = create<EditorState>((set, get) => ({
  panes: [createDefaultPane()],
  editorSettings: null,
  vimEnabled: true, // default, will be updated from settings
  settingsLoading: true,
  settingsError: null,
  addPane: () => {
    const newId = `pane-${Date.now()}`;
    set(state => ({
      panes: [
        ...state.panes,
        {
          id: newId,
          tabs: [],
          activeTabId: null,
        },
      ],
    }));
  },
  removePane: (paneId) => {
    set(state => ({
      panes: state.panes.filter(pane => pane.id !== paneId),
    }));
  },
  openTab: (paneId, path, content) => {
    const language = detectLanguage(path, content);
    set(state => ({
      panes: state.panes.map(pane => {
        if (pane.id !== paneId) return pane;
        const id = path;
        // If tab already exists, just switch
        if (pane.tabs.find(tab => tab.id === id)) {
          return { ...pane, activeTabId: id };
        }
        return {
          ...pane,
          tabs: [...pane.tabs, { id, path, content, isDirty: false, language }],
          activeTabId: id,
        };
      }),
    }));
  },
  closeTab: (paneId, tabId) => {
    set(state => ({
      panes: state.panes.map(pane => {
        if (pane.id !== paneId) return pane;
        const tabs = pane.tabs.filter(tab => tab.id !== tabId);
        let activeTabId = pane.activeTabId;
        if (activeTabId === tabId) {
          activeTabId = tabs.length ? tabs[tabs.length - 1].id : null;
        }
        return { ...pane, tabs, activeTabId };
      }),
    }));
  },
  switchTab: (paneId, tabId) => {
    set(state => ({
      panes: state.panes.map(pane =>
        pane.id === paneId ? { ...pane, activeTabId: tabId } : pane
      ),
    }));
  },
  updateTabContent: (paneId, tabId, content) => {
    set(state => ({
      panes: state.panes.map(pane => {
        if (pane.id !== paneId) return pane;
        return {
          ...pane,
          tabs: pane.tabs.map(tab =>
            tab.id === tabId
              ? { ...tab, content, isDirty: true, language: detectLanguage(tab.path, content) }
              : tab
          ),
        };
      }),
    }));
  },
  setTabDirty: (paneId, tabId, isDirty) => {
    set(state => ({
      panes: state.panes.map(pane => {
        if (pane.id !== paneId) return pane;
        return {
          ...pane,
          tabs: pane.tabs.map(tab =>
            tab.id === tabId ? { ...tab, isDirty } : tab
          ),
        };
      }),
    }));
  },
  setEditorSettings: (settings) => {
    set({ editorSettings: settings });
    // Update vimEnabled if present in settings
    if (typeof settings?.["editor.vimMode"] === "boolean") {
      set({ vimEnabled: settings["editor.vimMode"] });
    }
  },
  setVimEnabled: (enabled) => set({ vimEnabled: enabled }),
  setSettingsLoading: (loading) => set({ settingsLoading: loading }),
  setSettingsError: (error) => set({ settingsError: error }),
})); 