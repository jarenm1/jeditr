/**
 * EditorWorkspace Slice
 *
 * A workspace is a collection of panes (split views), representing a user's working context.
 * Users can switch between workspaces, each with its own layout and set of panes.
 *
 * This slice manages the state and actions for editor workspaces.
 */
import { StateCreator } from 'zustand';
import { EditorPane } from './pane';

export interface EditorWorkspace {
  id: string;
  name: string;
  panes: EditorPane[];
}

export interface WorkspaceSlice {
  workspaces: EditorWorkspace[];
  activeWorkspaceId: string | null;
  addWorkspace: (name: string) => void;
  removeWorkspace: (workspaceId: string) => void;
  setActiveWorkspace: (workspaceId: string) => void;
  addPaneToWorkspace: (workspaceId: string, pane: EditorPane) => void;
  removePaneFromWorkspace: (workspaceId: string, paneId: string) => void;
}

export const createWorkspaceSlice: StateCreator<WorkspaceSlice, [], [], WorkspaceSlice> = (set, get) => ({
  workspaces: [],
  activeWorkspaceId: null,
  addWorkspace: (name) => {
    const newId = `workspace-${Date.now()}`;
    set(state => ({
      workspaces: [
        ...state.workspaces,
        { id: newId, name, panes: [] },
      ],
      activeWorkspaceId: newId,
    }));
  },
  removeWorkspace: (workspaceId) => {
    set(state => {
      const idx = state.workspaces.findIndex(ws => ws.id === workspaceId);
      const filtered = state.workspaces.filter(ws => ws.id !== workspaceId);
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
    set(state => ({
      workspaces: state.workspaces.map(ws =>
        ws.id === workspaceId ? { ...ws, panes: [...ws.panes, pane] } : ws
      ),
    }));
  },
  removePaneFromWorkspace: (workspaceId, paneId) => {
    set(state => ({
      workspaces: state.workspaces.map(ws =>
        ws.id === workspaceId ? { ...ws, panes: ws.panes.filter(p => p.id !== paneId) } : ws
      ),
    }));
  },
}); 