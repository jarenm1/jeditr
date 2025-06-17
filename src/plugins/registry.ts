import { BottomBarPlugin, EditorPanePlugin } from '@plugins/types';

export const bottomBarRegistry: BottomBarPlugin[] = [];
export const editorPaneRegistry: EditorPanePlugin[] = [];

export function registerBottomBarPlugin(plugin: BottomBarPlugin) {
  bottomBarRegistry.push(plugin);
}
export function registerEditorPanePlugin(plugin: EditorPanePlugin) {
  editorPaneRegistry.push(plugin);
}
