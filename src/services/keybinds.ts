// Global Keybind Registry and Dispatcher
// Usage: import { registerKeybind, unregisterKeybind } from './keybinds';

import { useKeybindStore, type Keybind } from "../store/useKeybindStore";

// --- Keybinds as array of keys, e.g., ["Ctrl", "N"] ---

// Normalize a KeyboardEvent to a key string (e.g., "Ctrl", "N", "Tab")
function getKeyString(e: KeyboardEvent): string {
  // Use standardized key names for modifiers and main keys
  if (e.key === "Control") return "Ctrl";
  if (e.key === " ") return "Space";
  if (e.key === "Meta") return "Meta";
  if (e.key === "AltGraph") return "AltGr";
  if (e.key === "Escape") return "Esc";
  if (e.key.length === 1) return e.key.toUpperCase();
  return e.key;
}

// Track currently pressed keys
const pressedKeys = new Set<string>();

function handleKeyDown(e: KeyboardEvent) {
  const key = getKeyString(e);
  pressedKeys.add(key);
}

function handleKeyUp(e: KeyboardEvent) {
  const key = getKeyString(e);
  // Check for keybinds before removing the key
  const keybinds = useKeybindStore.getState().keybinds;
  for (const bind of keybinds) {
    if (isKeybindPressed(bind.keys, pressedKeys)) {
      e.preventDefault();
      bind.handler();
      // Remove only the non-modifier key (e.g., Tab, N, W), keep modifiers (Ctrl, Shift, etc.)
      if (!["Ctrl", "Shift", "Alt", "Meta", "AltGr"].includes(key)) {
        pressedKeys.delete(key);
      }
      return;
    }
  }
  // If no keybind matched, just remove the key as usual
  pressedKeys.delete(key);
}

function isKeybindPressed(keys: string[], pressed: Set<string>): boolean {
  // All keys in the keybind must be pressed
  return keys.every((k) => pressed.has(k));
}

/**
 * Registers a global keybind.
 *
 * This function adds a keybind to the global keybind store, allowing you to define custom keyboard shortcuts
 * for your application. The keybind will be checked on every keyup event, and if the specified keys are pressed,
 * the provided handler will be executed.
 *
 * Usage:
 * ```js
 *   registerKeybind({
 *     id: 'my-action',
 *     keys: ['Ctrl', 'K'],
 *     description: 'Do something cool',
 *     handler: () => { ... }
 *   });
 *```
 * @param bind - A Keybind object with the following properties:
 *   - id: Unique string identifier for the keybind
 *   - keys: Array of key strings (e.g., ['Ctrl', 'N'])
 *   - description: (optional) Description of the keybind
 *   - handler: Function to execute when the keybind is triggered
 */
export function registerKeybind(bind: Keybind) {
  useKeybindStore.getState().registerKeybind(bind);
}

export function unregisterKeybind(id: string) {
  useKeybindStore.getState().unregisterKeybind(id);
}

if (
  typeof window !== "undefined" &&
  !(window as any).__keybindDispatcherAttached
) {
  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);
  (window as any).__keybindDispatcherAttached = true;

  // Note: Keybinds are now registered via settings.json and the API system
  // See src/api/keybinds.ts for the new registration system
}
