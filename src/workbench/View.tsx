/**
 * @fileoverview
 * @author @jarenm1
 *
 * View component
 *
 * This component renders different view types (text-editor, image-viewer, etc.)
 * and integrates with the view registry system.
 */

import React from 'react';
import { getView } from "../api/ui/views/viewRegistry";
import { ReadOnlyView, ImageView } from "../views";
import type { ViewProps as ViewRegistryProps } from "../api/ui/views/types";

export interface ViewProps {
  viewType: string;
  content?: any;
  filePath: string;
  isModified?: boolean;
  onClose?: () => void;
  onSplit?: () => void;
  onMerge?: () => void;
  onModified?: (isModified: boolean) => void;
}

export const View = ({ 
  viewType, 
  content, 
  filePath, 
  isModified = false,
  onClose,
  onSplit,
  onMerge,
  onModified 
}: ViewProps) => {
  // TODO: Render the appropriate view content
  const renderViewContent = () => {
    // TODO: Prepare props for the view
    const viewProps: ViewRegistryProps = {
      filePath,
      content: content || null,
      contentType: filePath.split('.').pop() || 'unknown',
      viewId: `${viewType}-${filePath.replace(/[^a-zA-Z0-9]/g, '_')}`, // Stable ID based on view type and file path
      onContentChange: onModified ? (newContent) => {
        // TODO: Handle content changes
        if (onModified) {
          onModified(true); // Mark as modified
        }
      } : undefined,
    };

    // TODO: Handle different view types directly
    try {
      switch (viewType) {
        case 'imageView':
          return React.createElement(ImageView, viewProps);
        case 'readOnly':
        default:
          return React.createElement(ReadOnlyView, viewProps);
      }
    } catch (error) {
      console.error('Error rendering view:', error);
      return (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center text-red-500">
            <p>Error rendering {viewType} view</p>
            <p className="text-sm">Check console for details</p>
            <p className="text-xs mt-2">Error: {String(error)}</p>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="w-full h-full relative">
      {/* TODO: View content */}
      {renderViewContent()}
      
      {/* TODO: View controls (optional - can be handled by parent) */}
      {(onClose || onSplit || onMerge) && (
        <div className="absolute top-2 right-2 flex space-x-1 opacity-0 hover:opacity-100 transition-opacity">
          {onSplit && (
            <button
              className="p-1 text-xs border rounded shadow"
              onClick={onSplit}
              title="Split View"
            >
              ⫆
            </button>
          )}
          {onMerge && (
            <button
              className="p-1 text-xs border rounded shadow"
              onClick={onMerge}
              title="Merge Views"
            >
              ⬌
            </button>
          )}
          {onClose && (
            <button
              className="p-1 text-xs border rounded shadow"
              onClick={onClose}
              title="Close"
            >
              ×
            </button>
          )}
        </div>
      )}
    </div>
  );
};
