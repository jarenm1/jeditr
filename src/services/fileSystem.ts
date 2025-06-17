import { invoke } from '@tauri-apps/api/core';
import { readTextFile, writeFile, BaseDirectory, mkdir, create } from '@tauri-apps/plugin-fs';
import { error } from '@tauri-apps/plugin-log';

export class FileSystemError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FileSystemError';
  }
}

export interface FileSystemService {
  openFile: () => Promise<string>;
  readFile: (path: string) => Promise<string>;
  saveFile: (path: string, content: string) => Promise<void>;
  loadConfigFile: (filename: string) => Promise<string>;
}

class FileSystemServiceImpl implements FileSystemService {
  async openFile(): Promise<string> {
    try {
      return await invoke<string>('open_file');
    } catch (error) {
      throw new FileSystemError(error instanceof Error ? error.message : String(error));
    }
  }

  async readFile(path: string): Promise<string> {
    try {
      return await invoke<string>('read_file', { path });
    } catch (error) {
      throw new FileSystemError(error instanceof Error ? error.message : String(error));
    }
  }

  async saveFile(path: string, content: string): Promise<void> {
    try {
      await invoke('save_file', { path, content });
    } catch (error) {
      throw new FileSystemError(error instanceof Error ? error.message : String(error));
    }
  }

  async loadConfigFile(filename: string): Promise<string> {
    try {
      // Always load from AppConfig directory
      return await readTextFile(filename, { baseDir: BaseDirectory.AppConfig });
    } catch (error) {
      throw new FileSystemError(`Failed to load config file '${filename}' from AppConfig: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

export const fileSystemService: FileSystemService = new FileSystemServiceImpl();

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