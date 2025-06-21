/**
 * Vim Slice
 *
 * Manages Vim mode state for the editor.
 */
import { StateCreator } from "zustand";

export interface VimSlice {
  vimEnabled: boolean;
  setVimEnabled: (enabled: boolean) => void;
}

export const createVimSlice: StateCreator<VimSlice, [], [], VimSlice> = (
  set,
  get,
) => ({
  vimEnabled: true,
  setVimEnabled: (enabled) => set({ vimEnabled: enabled }),
});
