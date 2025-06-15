export interface EditorTab {
    id: string;
    path: string;
    content: string;
    isDirty: boolean;
    language?: string;
}

export interface EditorState {
    tabs: EditorTab[];
    activeTabId: string | null;
}

// Monaco Theme abstraction for saving/loading themes
export interface Theme {
  id: string; // unique identifier
  name: string; // display name
  monaco: import('monaco-editor').editor.IStandaloneThemeData; // Monaco theme data
} 