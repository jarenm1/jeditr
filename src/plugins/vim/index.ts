import { useBottomBarStore } from '@ubar/ubarStore';
import VimBar from './VimBar';
import { setupGlobalVimDispatcher, registerVimKeybinding, registerVimAction, setVimLeader } from './vimGlobalKeybinds';
import * as vimApi from './vimApi';
import { useEditorStore } from '@editor/editorStore';

// Register VimBar in the bottom bar
useBottomBarStore.getState().register({
  id: 'vim',
  component: VimBar,
  order: 0,
});

// Setup global Vim dispatcher and actions
const getVimMode = () => (window as any).Vim?.getMode?.() || 'normal';
const isEditorFocused = () => {
  return document.activeElement?.classList.contains('monaco-editor') || false;
};
const isVimEnabled = () => useEditorStore.getState().vimEnabled;
const disposeVimDispatcher = setupGlobalVimDispatcher(getVimMode, isEditorFocused, isVimEnabled);

if (import.meta.hot) {
  import.meta.hot.dispose(disposeVimDispatcher);
}

registerVimKeybinding('<leader>th', 'openThemePicker');
registerVimAction('openThemePicker', () => {
  // You can trigger a notification or open a modal here
});

// Optionally export Vim APIs for use elsewhere
export { vimApi, setVimLeader, registerVimKeybinding, registerVimAction, setupGlobalVimDispatcher };
