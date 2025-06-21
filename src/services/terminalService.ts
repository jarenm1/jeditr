import { nanoid } from "nanoid";
import { useEditorStore } from "@editor/editorStore";
import { registerKeybind, unregisterKeybind } from "@services/keybinds";

export interface TerminalManager {
  contentMap: Record<string, any>;
  setContentMap: (updater: (prev: Record<string, any>) => Record<string, any>) => void;
}

class TerminalService {
  private manager: TerminalManager | null = null;

  setManager(manager: TerminalManager) {
    this.manager = manager;
  }

  toggleTerminal() {
    if (!this.manager) {
      console.warn("[TerminalService] No manager registered");
      return;
    }

    const { activeWorkspaceId, workspaces, addPaneToWorkspace, removePaneFromWorkspace } = useEditorStore.getState();
    
    if (!activeWorkspaceId) return;
    
    const activeWorkspace = workspaces.find(ws => ws.id === activeWorkspaceId);
    if (!activeWorkspace) return;
    
    // Check if there's already a terminal pane open
    const terminalContentId = Object.keys(this.manager.contentMap).find(
      contentId => this.manager!.contentMap[contentId]?.type === "terminal"
    );
    
    if (terminalContentId) {
      // Find the pane with this terminal content and close it
      const terminalPane = activeWorkspace.panes.find(
        pane => pane.contentId === terminalContentId
      );
      
      if (terminalPane) {
        // Remove the terminal pane and its content
        removePaneFromWorkspace(activeWorkspaceId, terminalPane.id);
        
        // Clean up the content from contentMap
        this.manager.setContentMap(prev => {
          const { [terminalContentId]: _, ...rest } = prev;
          return rest;
        });
        
        console.log("[TerminalService] Closed terminal");
        return;
      }
    }
    
    // No terminal open, create a new one
    const contentId = `terminal-${nanoid()}`;
    const pane = {
      id: `pane-${nanoid()}`,
      contentId,
    };
    
    // Add the pane to the active workspace
    addPaneToWorkspace(activeWorkspaceId, pane);
    
    // Add the terminal content object to the contentMap
    this.manager.setContentMap((prev) => ({
      ...prev,
      [contentId]: {
        id: contentId,
        type: "terminal",
        data: {
          sessionId: nanoid(),
          initialText: "Welcome to the terminal!\r\n",
        },
      },
    }));
    
    console.log("[TerminalService] Opened new terminal");
  }

  registerKeybind() {
    registerKeybind({
      id: "terminal.toggle",
      keys: ["Ctrl", "T"],
      description: "Toggle terminal",
      handler: () => this.toggleTerminal(),
    });
  }

  unregisterKeybind() {
    unregisterKeybind("terminal.toggle");
  }
}

export const terminalService = new TerminalService(); 