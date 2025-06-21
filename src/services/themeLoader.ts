// Import theme files directly
import Zinc from '../../src-tauri/themes/zinc.json';
import Gray from '../../src-tauri/themes/gray.json';
import solarizedDarkTheme from '../../src-tauri/themes/solarized-dark.json';

export interface Theme {
  name: string;
  colors: Record<string, string>;
}

const themeRegistry: Record<string, Theme> = {};

// Built-in themes - imported directly
const BUILT_IN_THEMES: Theme[] = [
  Zinc as Theme,
  Gray as Theme,
  solarizedDarkTheme as Theme,
];

export async function loadAllThemes(): Promise<Theme[]> {
  const themes: Theme[] = [];
  
  // Load built-in themes from imports
  for (const theme of BUILT_IN_THEMES) {
    try {
      if (theme.name && theme.colors) {
        registerTheme(theme);
        themes.push(theme);
        console.log('Loaded theme:', theme.name);
      }
    } catch (err) {
      console.error('Failed to load built-in theme:', theme, err);
    }
  }
  
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