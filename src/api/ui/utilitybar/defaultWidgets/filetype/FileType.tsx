import React from "react";
import { useEditorStore } from "../../../editor/editorStore";

/**
 * Hook to get pane information for language display
 * This is a simplified version that gets pane info from the editor store
 */
function usePaneInfo(paneId: string) {
  const { workspaces, activeWorkspaceId } = useEditorStore();
  
  if (!activeWorkspaceId || !paneId) {
    return null;
  }
  
  const workspace = workspaces[activeWorkspaceId];
  if (!workspace) {
    return null;
  }
  
  const pane = workspace.panes[paneId];
  if (!pane) {
    return null;
  }
  
  // For now, we'll extract basic info from the pane
  // This can be enhanced when the language API is rebuilt
  const filePath = pane.tabs.length > 0 ? pane.tabs[pane.activeTabIndex]?.filePath : undefined;
  const contentType = pane.tabs.length > 0 ? pane.tabs[pane.activeTabIndex]?.contentType : undefined;
  
  // Simple language detection based on file extension
  let languageId: string | undefined;
  if (filePath && contentType === 'editor') {
    const extension = filePath.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'ts':
      case 'tsx':
        languageId = 'typescript';
        break;
      case 'js':
      case 'jsx':
        languageId = 'javascript';
        break;
      case 'py':
        languageId = 'python';
        break;
      case 'rs':
        languageId = 'rust';
        break;
      case 'go':
        languageId = 'go';
        break;
      case 'md':
        languageId = 'markdown';
        break;
      case 'json':
        languageId = 'json';
        break;
      case 'css':
        languageId = 'css';
        break;
      case 'html':
        languageId = 'html';
        break;
      default:
        languageId = 'text';
    }
  }
  
  return {
    languageId,
    contentType,
    isLoading: false,
    filePath
  };
}

interface LanguageWidgetProps {
  paneId?: string;
}

export const LanguageWidget: React.FC<LanguageWidgetProps> = ({ paneId }) => {
  const { activeWorkspaceId, getActivePaneId } = useEditorStore();
  
  // Use the provided paneId or get the active one
  const currentPaneId = paneId || (activeWorkspaceId ? getActivePaneId(activeWorkspaceId) : null);
  
  // Use the optimized hook that only re-renders when this specific pane changes
  const paneInfo = usePaneInfo(currentPaneId || '');
  
  if (!currentPaneId) {
    return (
      <div className="text-gray-400 text-sm px-2 py-1">
        No pane
      </div>
    );
  }

  if (!paneInfo) {
    return (
      <div className="text-gray-400 text-sm px-2 py-1">
        Unknown
      </div>
    );
  }

  const { languageId, contentType, isLoading, filePath } = paneInfo;
  
  // For non-editor content types, show the content type name
  if (contentType && contentType !== "editor") {
    const displayName = contentType === "terminal" ? "Terminal" : 
                       contentType.charAt(0).toUpperCase() + contentType.slice(1);
    
    return (
      <div className="text-blue-300 text-sm px-2 py-1 flex items-center gap-1">
        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
        {displayName}
      </div>
    );
  }
  
  // For editor content, show language information
  if (isLoading) {
    return (
      <div className="text-yellow-400 text-sm px-2 py-1 flex items-center gap-1">
        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
        Loading...
      </div>
    );
  }
  
  if (!languageId) {
    return (
      <div className="text-gray-400 text-sm px-2 py-1">
        Unknown
      </div>
    );
  }

  // Show language name
  const displayName = languageId.charAt(0).toUpperCase() + languageId.slice(1);
  
  // Optional: Show file path on hover
  const title = filePath ? `${displayName} - ${filePath}` : displayName;
  
  return (
    <div 
      className="text-gray-300 text-sm px-2 py-1 flex items-center gap-1" 
      title={title}
    >
      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
      {displayName}
    </div>
  );
};

/**
 * Factory function to create a language widget for registration
 */
export function createLanguageWidget() {
  return {
    id: "language-widget",
    render: () => React.createElement(LanguageWidget),
    order: 100, // High order to appear towards the right
  };
} 