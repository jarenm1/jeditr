import { readDir, readTextFile, mkdir, BaseDirectory } from '@tauri-apps/plugin-fs';

export interface Theme {
  name: string;
  colors: Record<string, string>;
}

const THEME_DIR = 'themes';
const themeRegistry: Record<string, Theme> = {};

export async function ensureUserThemesDir() {
  await mkdir(THEME_DIR, {
    baseDir: BaseDirectory.AppConfig,
  });
}

export async function loadAllThemes(): Promise<Theme[]> {
  await ensureUserThemesDir();
  const themes: Theme[] = [];
  // Load built-in themes
  try {
    const builtInFiles = await readDir(THEME_DIR, { baseDir: BaseDirectory.Resource });
    for (const file of builtInFiles) {
      if (file.name?.endsWith('.json')) {
        const content = await readTextFile(`${THEME_DIR}/${file.name}`, { baseDir: BaseDirectory.Resource });
        try {
          const theme = JSON.parse(content);
          if (theme.name && theme.colors) {
            registerTheme(theme);
            themes.push(theme);
          }
        } catch (err) {
            console.error('Failed to read built-in themes:', err);
        }
      }
    }
  } catch {}
  // Load user themes
  try {
    const userFiles = await readDir(THEME_DIR, { baseDir: BaseDirectory.AppConfig });
    for (const file of userFiles) {
      if (file.name?.endsWith('.json')) {
        const content = await readTextFile(`${THEME_DIR}/${file.name}`, { baseDir: BaseDirectory.AppConfig });
        try {
          const theme = JSON.parse(content);
          if (theme.name && theme.colors) {
            registerTheme(theme);
            themes.push(theme);
          }
        } catch {}
      }
    }
  } catch {}
  return themes;
}

export function registerTheme(theme: Theme) {
  themeRegistry[theme.name] = theme;
}

export function getAllThemes(): Theme[] {
  return Object.values(themeRegistry);
}

export function getTheme(name: string): Theme | undefined {
  return themeRegistry[name];
}

export function applyTheme(theme: Theme) {
  let styleTag = document.getElementById('dynamic-theme');
  if (!styleTag) {
    styleTag = document.createElement('style');
    styleTag.id = 'dynamic-theme';
    document.head.appendChild(styleTag);
  }
  const cssVars = Object.entries(theme.colors)
    .map(([k, v]) => `${k}: ${v} !important;`)
    .join('\n');
  styleTag.innerHTML = `:root { ${cssVars} }`;
} 