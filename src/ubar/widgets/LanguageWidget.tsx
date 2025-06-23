import React from "react";
import { usePaneInfo } from "@ubar/ubarStore/languageStore";

interface LanguageWidgetProps {
  paneId?: string;
}

export const LanguageWidget: React.FC<LanguageWidgetProps> = ({ paneId }) => {
  // Use the optimized hook that only re-renders when this specific pane changes
  const paneInfo = usePaneInfo(paneId || '');
  
  if (!paneId) {
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

  // Show language name (you can enhance this with getLanguageInfo when you rebuild the language API)
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