import { StateCreator } from "zustand";
import { nanoid } from "nanoid";

/**
 * EditorPane represents a layout-only container (a split view or box) in the editor, similar to VSCode's split panes.
 * Each pane is responsible only for layout and holds a reference to a contentId, which determines what is rendered inside.
 * The actual content (editor, terminal, image, video, etc.) is managed separately and injected into the pane.
 *
 * Key properties:
 * - id: Unique identifier for the pane
 * - contentId: Reference to the content to render in this pane
 *
 * This slice manages the state and actions related to layout panes, such as adding, removing, and switching panes.
 */
export interface EditorPane {
  id: string;
  contentId: string;
}

export interface PaneSlice {
  panes: EditorPane[];
  addPane: (contentId: string) => void;
  removePane: (paneId: string) => void;
  setPaneContent: (paneId: string, contentId: string) => void;
}

export const createPaneSlice: StateCreator<PaneSlice, [], [], PaneSlice> = (
  set,
  get,
) => ({
  panes: [],
  addPane: (contentId) => {
    const newId = `pane-${nanoid()}`;
    set((state) => ({
      panes: [...state.panes, { id: newId, contentId }],
    }));
  },
  removePane: (paneId) => {
    set((state) => ({
      panes: state.panes.filter((pane) => pane.id !== paneId),
    }));
  },
  setPaneContent: (paneId, contentId) => {
    set((state) => ({
      panes: state.panes.map((pane) =>
        pane.id === paneId ? { ...pane, contentId } : pane,
      ),
    }));
  },
});
