// editorStore/index.ts

import { create } from "zustand";
import {
  createWorkspaceSlice,
  WorkspaceSlice,
} from "./workspace";
import { createPaneSlice, PaneSlice } from "./pane";
import {
  createSettingsSlice,
  SettingsSlice,
} from "./settings";

export const useEditorStore = create<
  WorkspaceSlice & PaneSlice & SettingsSlice
>((...a) => ({
  ...createWorkspaceSlice(...a),
  ...createPaneSlice(...a),
  ...createSettingsSlice(...a),
}));
