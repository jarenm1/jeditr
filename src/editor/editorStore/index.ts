// editorStore/index.ts

import { create } from "zustand";
import {
	createWorkspaceSlice,
	WorkspaceSlice,
} from "@editor/editorStore/workspace";
import { createPaneSlice, PaneSlice } from "@editor/editorStore/pane";
import {
	createSettingsSlice,
	SettingsSlice,
} from "@editor/editorStore/settings";
import { createVimSlice, VimSlice } from "@editor/editorStore/vim";

export const useEditorStore = create<
	WorkspaceSlice & PaneSlice & SettingsSlice & VimSlice
>((...a) => ({
	...createWorkspaceSlice(...a),
	...createPaneSlice(...a),
	...createSettingsSlice(...a),
	...createVimSlice(...a),
}));
