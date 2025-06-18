import { invoke } from '@tauri-apps/api/core';
import { readTextFile, writeFile, BaseDirectory } from '@tauri-apps/plugin-fs';
import { error } from '@tauri-apps/plugin-log';

export async function openFile(): Promise<string> {
  return await invoke<string>('open_file');
}

export async function readFile(path: string): Promise<string> {
  return await invoke<string>('read_file', { path });
}

export async function saveFile(path: string, content: string): Promise<void> {
  await invoke('save_file', { path, content });
}

export async function loadConfigFile(filename: string): Promise<string> {
  // Always load from AppConfig directory
  return await readTextFile(filename, { baseDir: BaseDirectory.AppConfig });
}

// Fetch a list of files for the file selector modal
// The backend should provide a 'list_files' command that returns [{ name, path }]
export async function fetchFiles(): Promise<{ name: string; path: string }[]> {
  return await invoke<{ name: string; path: string }[]>('list_files');
}

// --- VSCode-like Settings Registry ---

export interface SettingOption<T = any> {
  key: string;
  default: T;
  description?: string;
}

export class SettingsRegistry {
  private settings: Record<string, SettingOption> = {};

  register<T>(option: SettingOption<T>) {
    this.settings[option.key] = option;
  }

  getDefaults(): Record<string, any> {
    const defaults: Record<string, any> = {};
    for (const key in this.settings) {
      defaults[key] = this.settings[key].default;
    }
    return defaults;
  }

  getDescriptions(): Record<string, string> {
    const descs: Record<string, string> = {};
    for (const key in this.settings) {
      if (this.settings[key].description) descs[key] = this.settings[key].description!;
    }
    return descs;
  }
}

export const settingsRegistry = new SettingsRegistry();

// Example: Register core settings (add more as needed)
settingsRegistry.register({
  key: 'editor.fontSize',
  default: 14,
  description: 'Editor font size in pixels.'
});
settingsRegistry.register({
  key: 'editor.theme',
  default: 'vs-dark',
  description: 'Editor color theme.'
});
settingsRegistry.register({
  key: 'editor.vimMode',
  default: true,
  description: 'Enable Vim keybindings.'
});

// Utility: fetch and merge settings.json with defaults
export async function fetchAndMergeSettings(): Promise<any> {
  let userSettings = {};
  try {
    const text = await readTextFile('settings.json', { baseDir: BaseDirectory.AppConfig });
    userSettings = JSON.parse(text);
  } catch (e) {
    // If file doesn't exist, create it as empty
    error('settings.json not found, creating empty file');
    await writeFile(
      'settings.json',
      new TextEncoder().encode('{}'),
      { baseDir: BaseDirectory.AppConfig, create: true }
    );
  }
  return { ...settingsRegistry.getDefaults(), ...userSettings };
}

// Load settings.json from Tauri app config, merging with defaults
export async function loadSettings(): Promise<any> {
  return fetchAndMergeSettings();
} 