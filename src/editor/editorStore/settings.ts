/**
 * Settings Slice
 *
 * Manages editor settings, loading state, and error state.
 */
import { StateCreator } from 'zustand';

export interface EditorSettings {
  [key: string]: any;
}

export const DEFAULT_EDITOR_SETTINGS: EditorSettings = {
  theme: 'vs-dark',
  fontSize: 14,
  fontFamily: 'Fira Mono, monospace',
  lineHeight: 1.6,
  vimMode: true,
  // Add more defaults as needed
};

export interface SettingsSlice {
  editorSettings: EditorSettings | null;
  settingsLoading: boolean;
  settingsError: string | null;
  setEditorSettings: (settings: EditorSettings) => void;
  setSettingsLoading: (loading: boolean) => void;
  setSettingsError: (error: string | null) => void;
}

function mergeWithDefaults(settings: EditorSettings): EditorSettings {
  return { ...DEFAULT_EDITOR_SETTINGS, ...settings };
}

export const createSettingsSlice: StateCreator<SettingsSlice, [], [], SettingsSlice> = (set, get) => ({
  editorSettings: DEFAULT_EDITOR_SETTINGS,
  settingsLoading: false,
  settingsError: null,
  setEditorSettings: (settings) => set({ editorSettings: mergeWithDefaults(settings) }),
  setSettingsLoading: (loading) => set({ settingsLoading: loading }),
  setSettingsError: (error) => set({ settingsError: error }),
});
