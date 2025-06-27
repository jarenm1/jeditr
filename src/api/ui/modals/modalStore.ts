import { create } from "zustand";
import { nanoid } from "nanoid";
import type React from "react";

export type ModalPosition = { x: number; y: number };

export type PluginModal = {
  id: string;
  pluginName: string;
  content: React.ReactNode;
  position: ModalPosition;
  visible: boolean;
};

// Default position for new modals (e.g., center or fixed point)
const DEFAULT_MODAL_POSITION: ModalPosition = { x: 200, y: 200 };

interface ModalState {
  modals: PluginModal[];
  addModal: (modal: { pluginName: string; content: React.ReactNode }) => string;
  removeModal: (id: string) => void;
  updateModalPosition: (id: string, position: ModalPosition) => void;
  hideModal: (id: string) => void;
  findModalByPlugin: (pluginName: string) => PluginModal | undefined;
  closeModalByPlugin: (pluginName: string) => void;
}

export const useModalStore = create<ModalState>((set, get) => ({
  modals: [],
  addModal: ({ pluginName, content }) => {
    const id = nanoid();
    set((state) => ({
      modals: [
        ...state.modals,
        {
          id,
          pluginName,
          content,
          position: DEFAULT_MODAL_POSITION,
          visible: true,
        },
      ],
    }));
    return id;
  },
  removeModal: (id) => {
    set((state) => ({
      modals: state.modals.filter((m) => m.id !== id),
    }));
  },
  updateModalPosition: (id, position) => {
    set((state) => ({
      modals: state.modals.map((m) => (m.id === id ? { ...m, position } : m)),
    }));
  },
  hideModal: (id) => {
    set((state) => ({
      modals: state.modals.map((m) =>
        m.id === id ? { ...m, visible: false } : m,
      ),
    }));
  },
  findModalByPlugin: (pluginName) => {
    const state = get();
    return state.modals.find((m) => m.pluginName === pluginName && m.visible);
  },
  closeModalByPlugin: (pluginName) => {
    set((state) => ({
      modals: state.modals.map((m) =>
        m.pluginName === pluginName && m.visible ? { ...m, visible: false } : m,
      ),
    }));
  },
}));

export const addModal = (modal: {
  pluginName: string;
  content: React.ReactNode;
}) => useModalStore.getState().addModal(modal);
export const removeModal = (id: string) =>
  useModalStore.getState().removeModal(id);
export const updateModalPosition = (id: string, position: ModalPosition) =>
  useModalStore.getState().updateModalPosition(id, position);
export const hideModal = (id: string) => useModalStore.getState().hideModal(id);
export const findModalByPlugin = (pluginName: string) =>
  useModalStore.getState().findModalByPlugin(pluginName);
export const closeModalByPlugin = (pluginName: string) =>
  useModalStore.getState().closeModalByPlugin(pluginName);
