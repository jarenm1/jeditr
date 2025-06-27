/**
 * @fileoverview
 * @author @jarenm1
 * 
 * Image View Component
 * A simple view that displays images centered in the view area
 */

import React from 'react';
import type { ViewProps } from '../../api/ui/views/types';

export const ImageView: React.FC<ViewProps> = ({
  filePath,
  contentType,
  viewId
}) => {
  const fileName = filePath.split('/').pop() || 'Untitled';

  return (
    <div className="w-full h-full flex flex-col bg-[var(--theme-bg-primary)]">
      {/* Fixed Header */}
      <div className="flex-shrink-0 p-4 pb-2 border-b border-[var(--theme-border-primary)]">
        <h3 className="text-lg font-semibold text-[var(--theme-text-primary)] truncate">
          {fileName}
        </h3>
        <p className="text-sm text-[var(--theme-text-secondary)] truncate">
          Image view • {contentType} • {filePath}
        </p>
      </div>

      {/* Centered Image Area */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-4">
        <div className="max-w-full max-h-full flex items-center justify-center">
          <img
            src={filePath}
            alt={fileName}
            className="max-w-full max-h-full object-contain shadow-lg rounded-lg"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.nextElementSibling?.classList.remove('hidden');
            }}
          />
          <div className="hidden text-center text-[var(--theme-text-error)]">
            <p className="text-lg mb-2">Failed to load image</p>
            <p className="text-sm break-all">File: {filePath}</p>
          </div>
        </div>
      </div>

      {/* Fixed Footer */}
      <div className="flex-shrink-0 p-4 pt-2 border-t border-[var(--theme-border-primary)] text-xs text-[var(--theme-text-secondary)]">
        <p>View ID: {viewId} • Image viewer</p>
      </div>
    </div>
  );
}; 