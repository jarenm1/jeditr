/**
 * EditorWorkspace Slice
 *
 * A workspace is a collection of panes (split views), representing a user's working context.
 * Users can switch between workspaces, each with its own layout and set of panes.
 *
 * This slice manages the state and actions for editor workspaces.
 */
import { StateCreator } from "zustand";
import { EditorPane } from "./pane";

export interface EditorWorkspace {
  id: string;
  name: string;
  panes: EditorPane[];
  activePaneId?: string; // Track which pane is currently focused
}

export interface WorkspaceSlice {
  workspaces: EditorWorkspace[];
  activeWorkspaceId: string | null;
  addWorkspace: (name: string) => void;
  removeWorkspace: (workspaceId: string) => void;
  setActiveWorkspace: (workspaceId: string) => void;
  addPaneToWorkspace: (workspaceId: string, pane: EditorPane) => void;
  removePaneFromWorkspace: (workspaceId: string, paneId: string) => void;
  setActivePaneInWorkspace: (workspaceId: string, paneId: string) => void;
  getActivePaneId: (workspaceId: string) => string | null;
}

export const createWorkspaceSlice: StateCreator<
  WorkspaceSlice,
  [],
  [],
  WorkspaceSlice
> = (set, get) => ({
  workspaces: [],
  activeWorkspaceId: null,
  addWorkspace: (name) => {
    const newId = `workspace-${Date.now()}`;
    set((state) => ({
      workspaces: [...state.workspaces, { id: newId, name, panes: [] }],
      activeWorkspaceId: newId,
    }));
  },
  removeWorkspace: (workspaceId) => {
    set((state) => {
      const idx = state.workspaces.findIndex((ws) => ws.id === workspaceId);
      const filtered = state.workspaces.filter((ws) => ws.id !== workspaceId);
      let newActive = state.activeWorkspaceId;
      if (state.activeWorkspaceId === workspaceId) {
        if (filtered.length === 0) {
          newActive = null;
        } else if (idx > 0) {
          newActive = filtered[idx - 1].id;
        } else {
          newActive = filtered[0].id;
        }
      }
      return {
        workspaces: filtered,
        activeWorkspaceId: newActive,
      };
    });
  },
  setActiveWorkspace: (workspaceId) => {
    set({ activeWorkspaceId: workspaceId });
  },
  addPaneToWorkspace: (workspaceId, pane) => {
    set((state) => ({
      workspaces: state.workspaces.map((ws) =>
        ws.id === workspaceId 
          ? { 
              ...ws, 
              panes: [...ws.panes, pane],
              // Auto-set as active pane if it's the first pane or no active pane
              activePaneId: ws.panes.length === 0 || !ws.activePaneId ? pane.id : ws.activePaneId
            } 
          : ws,
      ),
    }));
  },
  removePaneFromWorkspace: (workspaceId, paneId) => {
    set((state) => ({
      workspaces: state.workspaces.map((ws) => {
        if (ws.id !== workspaceId) return ws;
        
        const remainingPanes = ws.panes.filter((p) => p.id !== paneId);
        let newActivePaneId = ws.activePaneId;
        
        // If we're removing the active pane, pick a new one
        if (ws.activePaneId === paneId) {
          if (remainingPanes.length > 0) {
            // Try to find the next pane after the removed one, or fall back to first
            const removedIndex = ws.panes.findIndex(p => p.id === paneId);
            if (removedIndex >= 0 && removedIndex < remainingPanes.length) {
              newActivePaneId = remainingPanes[removedIndex]?.id || remainingPanes[0]?.id;
            } else {
              newActivePaneId = remainingPanes[0]?.id;
            }
          } else {
            newActivePaneId = undefined;
          }
        }
        
        return {
          ...ws,
          panes: remainingPanes,
          activePaneId: newActivePaneId,
        };
      }),
    }));
  },
  setActivePaneInWorkspace: (workspaceId, paneId) => {
    set((state) => ({
      workspaces: state.workspaces.map((ws) =>
        ws.id === workspaceId ? { ...ws, activePaneId: paneId } : ws,
      ),
    }));
  },
  getActivePaneId: (workspaceId) => {
    const workspace = get().workspaces.find(ws => ws.id === workspaceId);
    return workspace?.activePaneId || null;
  },
});
