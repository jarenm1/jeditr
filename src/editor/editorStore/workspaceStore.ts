import { create } from 'zustand';
import { createWorkspaceSlice, WorkspaceSlice } from './workspace';

export const useWorkspaceStore = create<WorkspaceSlice>((...a) => ({
  ...createWorkspaceSlice(...a),
})); 