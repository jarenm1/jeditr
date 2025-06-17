

export type VimAction = () => void;

const keybindingRegistry: Record<string, string> = {};
const actionRegistry: Record<string, VimAction> = {};

// Leader key (can be made configurable)
let leaderKey = '\\'; // Default Vim leader is '\'

export function setVimLeader(key: string) {
  leaderKey = key;
}

export function registerVimKeybinding(keys: string, actionName: string) {
  keybindingRegistry[keys] = actionName;
}

export function unregisterVimKeybinding(keys: string) {
  delete keybindingRegistry[keys];
}

export function registerVimAction(name: string, action: VimAction) {
  actionRegistry[name] = action;
}

export function unregisterVimAction(name: string) {
  delete actionRegistry[name];
}

// Simple key sequence parser for <leader>th, etc.
function parseVimKeySequence(e: KeyboardEvent, sequence: string, leader: string): boolean {
  // Only supports <leader> + chars for now
  if (!sequence.startsWith('<leader>')) return false;
  const rest = sequence.slice('<leader>'.length);
  // e.g. <leader>th => t then h
  if (rest.length === 2) {
    // We expect two keypresses after leader
    // This function should be called after leader is pressed
    // We'll handle this in the dispatcher
    return true;
  }
  return false;
}

// Dispatcher: listens for key events and dispatches actions
let leaderActive = false;
let leaderBuffer = '';

export function setupGlobalVimDispatcher(getVimMode: () => string, isEditorFocused: () => boolean, isVimEnabled: () => boolean) {
  const handler = (e: KeyboardEvent) => {
    if (!isVimEnabled()) return;
    if (!isEditorFocused()) return;
    if (getVimMode() !== 'normal') return;

    // Handle leader key
    if (!leaderActive && e.key === leaderKey) {
      leaderActive = true;
      leaderBuffer = '';
      e.preventDefault();
      return;
    }
    if (leaderActive) {
      leaderBuffer += e.key;
      // Try to match a keybinding
      for (const seq in keybindingRegistry) {
        if (seq.startsWith('<leader>') && seq.slice('<leader>'.length) === leaderBuffer) {
          const actionName = keybindingRegistry[seq];
          const action = actionRegistry[actionName];
          if (action) {
            action();
            e.preventDefault();
          }
          leaderActive = false;
          leaderBuffer = '';
          return;
        }
      }
      // If buffer too long, reset
      if (leaderBuffer.length > 4) {
        leaderActive = false;
        leaderBuffer = '';
      }
      e.preventDefault();
      return;
    }
    // TODO: Add support for other global Vim keybinds (e.g., :w, :q, etc.)
  };
  window.addEventListener('keydown', handler);
  // Return disposer function
  return () => {
    window.removeEventListener('keydown', handler);
  };
} 