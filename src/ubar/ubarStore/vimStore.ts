import { create } from 'zustand';

interface VimState {
  mode: string;
  command: string;
  message: string;
  setMode: (mode: string) => void;
  setCommand: (cmd: string) => void;
  setMessage: (msg: string) => void;
}

export const useVimStore = create<VimState>((set) => ({
  mode: 'normal',
  command: '',
  message: '',
  setMode: (mode) => set({ mode }),
  setCommand: (command) => set({ command }),
  setMessage: (message) => set({ message }),
})); 