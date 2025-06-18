import { create } from 'zustand';

export interface Keybind {
  id: string;
  keys: string[];
  description?: string;
  handler: () => void;
}

interface KeybindStore {
  keybinds: Keybind[];
  registerKeybind: (bind: Keybind) => void;
  unregisterKeybind: (id: string) => void;
  updateKeybind: (id: string, update: Partial<Omit<Keybind, 'id'>>) => void;
  getKeybindById: (id: string) => Keybind | undefined;
}

export const useKeybindStore = create<KeybindStore>((set, get) => ({
  keybinds: [],
  registerKeybind: (bind) => set(state => {
    // Replace if exists, else add
    const existing = state.keybinds.find(k => k.id === bind.id);
    if (existing) {
      return {
        keybinds: state.keybinds.map(k => k.id === bind.id ? bind : k),
      };
    }
    return { keybinds: [...state.keybinds, bind] };
  }),
  unregisterKeybind: (id) => set(state => ({
    keybinds: state.keybinds.filter(k => k.id !== id),
  })),
  updateKeybind: (id, update) => set(state => ({
    keybinds: state.keybinds.map(k => k.id === id ? { ...k, ...update } : k),
  })),
  getKeybindById: (id) => get().keybinds.find(k => k.id === id),
})); 