import React from "react";
import { useLanguageStore } from "@ubar/ubarStore/languageStore";
import { getLanguageInfo } from "@plugins/api/language";

interface LanguageWidgetProps {
  paneId?: string;
}

export const LanguageWidget: React.FC<LanguageWidgetProps> = ({ paneId }) => {
  const { getPaneLanguage, getPaneContentType, isPaneLanguageLoading } = useLanguageStore();
  
  if (!paneId) {
    return (
      <div className="text-gray-400 text-sm px-2 py-1">
        No pane
      </div>
    );
  }
  
  const contentType = getPaneContentType(paneId);
  const languageId = getPaneLanguage(paneId);
  const isLoading = isPaneLanguageLoading(paneId);
  
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
  
  // Get language info to display a friendly name
  const languageInfo = getLanguageInfo(languageId);
  const displayName = languageInfo?.names[0] || languageId;
  
  return (
    <div className="text-gray-300 text-sm px-2 py-1 flex items-center gap-1">
      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
      {displayName.charAt(0).toUpperCase() + displayName.slice(1)}
    </div>
  );
}; 