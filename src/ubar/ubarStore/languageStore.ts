import { create } from "zustand";

interface LanguageState {
  // Map pane ID to language ID
  paneLanguages: Record<string, string>;
  // Map pane ID to loading state
  paneLoadingStates: Record<string, boolean>;
  // Map pane ID to content type
  paneContentTypes: Record<string, string>;
  
  // Actions
  setPaneLanguage: (paneId: string, languageId: string) => void;
  setPaneLoadingState: (paneId: string, isLoading: boolean) => void;
  setPaneContentType: (paneId: string, contentType: string) => void;
  removePaneLanguage: (paneId: string) => void;
  getPaneLanguage: (paneId: string) => string | undefined;
  getPaneContentType: (paneId: string) => string | undefined;
  isPaneLanguageLoading: (paneId: string) => boolean;
}

export const useLanguageStore = create<LanguageState>((set, get) => ({
  paneLanguages: {},
  paneLoadingStates: {},
  paneContentTypes: {},
  
  setPaneLanguage: (paneId: string, languageId: string) => {
    set((state) => ({
      paneLanguages: {
        ...state.paneLanguages,
        [paneId]: languageId,
      },
    }));
  },
  
  setPaneLoadingState: (paneId: string, isLoading: boolean) => {
    set((state) => ({
      paneLoadingStates: {
        ...state.paneLoadingStates,
        [paneId]: isLoading,
      },
    }));
  },
  
  setPaneContentType: (paneId: string, contentType: string) => {
    set((state) => ({
      paneContentTypes: {
        ...state.paneContentTypes,
        [paneId]: contentType,
      },
    }));
  },
  
  removePaneLanguage: (paneId: string) => {
    set((state) => {
      const { [paneId]: _, ...remainingLanguages } = state.paneLanguages;
      const { [paneId]: __, ...remainingLoadingStates } = state.paneLoadingStates;
      const { [paneId]: ___, ...remainingContentTypes } = state.paneContentTypes;
      return {
        paneLanguages: remainingLanguages,
        paneLoadingStates: remainingLoadingStates,
        paneContentTypes: remainingContentTypes,
      };
    });
  },
  
  getPaneLanguage: (paneId: string) => {
    return get().paneLanguages[paneId];
  },
  
  getPaneContentType: (paneId: string) => {
    return get().paneContentTypes[paneId];
  },
  
  isPaneLanguageLoading: (paneId: string) => {
    return get().paneLoadingStates[paneId] || false;
  },
})); 