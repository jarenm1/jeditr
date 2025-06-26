import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

interface PaneFileInfo {
  filePath?: string;
  languageId: string;
  contentType: string;
  isLoading: boolean;
  lastUpdated: number;
}

interface LanguageState {
  // Map pane ID to file and language information
  paneInfo: Record<string, PaneFileInfo>;
  
  // Actions for managing pane state
  setPaneLanguage: (paneId: string, languageId: string) => void;
  setPaneFile: (paneId: string, filePath: string, languageId: string) => void;
  setPaneContentType: (paneId: string, contentType: string) => void;
  setPaneLoadingState: (paneId: string, isLoading: boolean) => void;
  updatePaneInfo: (paneId: string, updates: Partial<PaneFileInfo>) => void;
  
  // Getters
  getPaneLanguage: (paneId: string) => string | undefined;
  getPaneFilePath: (paneId: string) => string | undefined;
  getPaneContentType: (paneId: string) => string | undefined;
  isPaneLanguageLoading: (paneId: string) => boolean;
  getPaneInfo: (paneId: string) => PaneFileInfo | undefined;
  
  // Cleanup
  removePaneInfo: (paneId: string) => void;
  
  // Bulk operations
  getAllPaneLanguages: () => Record<string, string>;
  getPanesByLanguage: (languageId: string) => string[];
  
  // File switching detection
  isFileChanged: (paneId: string, newFilePath: string) => boolean;
}

export const useLanguageStore = create<LanguageState>()(
  subscribeWithSelector((set, get) => ({
    paneInfo: {},
    
    setPaneLanguage: (paneId: string, languageId: string) => {
      set((state) => ({
        paneInfo: {
          ...state.paneInfo,
          [paneId]: {
            ...state.paneInfo[paneId],
            languageId,
            lastUpdated: Date.now(),
          },
        },
      }));
    },
    
    setPaneFile: (paneId: string, filePath: string, languageId: string) => {
      set((state) => ({
        paneInfo: {
          ...state.paneInfo,
          [paneId]: {
            ...state.paneInfo[paneId],
            filePath,
            languageId,
            contentType: 'editor', // Default for files
            isLoading: false,
            lastUpdated: Date.now(),
          },
        },
      }));
    },
    
    setPaneContentType: (paneId: string, contentType: string) => {
      set((state) => ({
        paneInfo: {
          ...state.paneInfo,
          [paneId]: {
            ...state.paneInfo[paneId],
            contentType,
            lastUpdated: Date.now(),
          },
        },
      }));
    },
    
    setPaneLoadingState: (paneId: string, isLoading: boolean) => {
      set((state) => ({
        paneInfo: {
          ...state.paneInfo,
          [paneId]: {
            ...state.paneInfo[paneId],
            isLoading,
            lastUpdated: Date.now(),
          },
        },
      }));
    },
    
    updatePaneInfo: (paneId: string, updates: Partial<PaneFileInfo>) => {
      set((state) => ({
        paneInfo: {
          ...state.paneInfo,
          [paneId]: {
            ...state.paneInfo[paneId],
            ...updates,
            lastUpdated: Date.now(),
          },
        },
      }));
    },
    
    // Getters
    getPaneLanguage: (paneId: string) => {
      return get().paneInfo[paneId]?.languageId;
    },
    
    getPaneFilePath: (paneId: string) => {
      return get().paneInfo[paneId]?.filePath;
    },
    
    getPaneContentType: (paneId: string) => {
      return get().paneInfo[paneId]?.contentType;
    },
    
    isPaneLanguageLoading: (paneId: string) => {
      return get().paneInfo[paneId]?.isLoading || false;
    },
    
    getPaneInfo: (paneId: string) => {
      return get().paneInfo[paneId];
    },
    
    // Cleanup
    removePaneInfo: (paneId: string) => {
      set((state) => {
        const { [paneId]: removed, ...remainingPanes } = state.paneInfo;
        return {
          paneInfo: remainingPanes,
        };
      });
    },
    
    // Bulk operations
    getAllPaneLanguages: () => {
      const state = get();
      const result: Record<string, string> = {};
      
      Object.entries(state.paneInfo).forEach(([paneId, info]) => {
        result[paneId] = info.languageId;
      });
      
      return result;
    },
    
    getPanesByLanguage: (languageId: string) => {
      const state = get();
      return Object.entries(state.paneInfo)
        .filter(([_, info]) => info.languageId === languageId)
        .map(([paneId, _]) => paneId);
    },
    
    // File switching detection
    isFileChanged: (paneId: string, newFilePath: string) => {
      const currentInfo = get().paneInfo[paneId];
      return currentInfo?.filePath !== newFilePath;
    },
  }))
);

// ============================================================================
// HELPER HOOKS - Zustand Best Practices
// ============================================================================

/**
 * Hook to get specific pane info with automatic re-renders
 * Only re-renders when the specific pane's data changes
 */
export function usePaneInfo(paneId: string) {
  return useLanguageStore((state) => state.paneInfo[paneId]);
}

/**
 * Hook to get just the language for a pane
 * More efficient than getting all pane info if you only need language
 */
export function usePaneLanguage(paneId: string) {
  return useLanguageStore((state) => state.paneInfo[paneId]?.languageId);
}

/**
 * Hook to watch for file changes in a pane
 * Useful for triggering re-renders when file switches
 */
export function usePaneFileChange(paneId: string) {
  return useLanguageStore((state) => ({
    filePath: state.paneInfo[paneId]?.filePath,
    lastUpdated: state.paneInfo[paneId]?.lastUpdated,
  }));
}

/**
 * Hook for bulk language operations
 * Returns a snapshot of all pane languages at once
 */
export function useAllPaneLanguages() {
  return useLanguageStore((state) => {
    const result: Record<string, string> = {};
    Object.entries(state.paneInfo).forEach(([paneId, info]) => {
      result[paneId] = info.languageId;
    });
    return result;
  });
}

/**
 * Hook for language store actions
 * Returns only the action methods to avoid unnecessary re-renders
 */
export function useLanguageActions() {
  return useLanguageStore((state) => ({
    setPaneLanguage: state.setPaneLanguage,
    setPaneFile: state.setPaneFile,
    setPaneContentType: state.setPaneContentType,
    setPaneLoadingState: state.setPaneLoadingState,
    updatePaneInfo: state.updatePaneInfo,
    removePaneInfo: state.removePaneInfo,
    getPaneLanguage: state.getPaneLanguage,
    getPaneFilePath: state.getPaneFilePath,
    getPaneContentType: state.getPaneContentType,
    isPaneLanguageLoading: state.isPaneLanguageLoading,
    getPaneInfo: state.getPaneInfo,
    getAllPaneLanguages: state.getAllPaneLanguages,
    getPanesByLanguage: state.getPanesByLanguage,
    isFileChanged: state.isFileChanged,
  }));
} 