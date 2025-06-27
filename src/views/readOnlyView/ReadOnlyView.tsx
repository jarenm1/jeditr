import React, { useState, useEffect } from 'react';
import type { ViewProps } from '../../api/ui/views/types';
import { readFile } from '../../api/filesystem/files';

export const ReadOnlyView: React.FC<ViewProps> = ({
  filePath,
  contentType,
  viewId,
  content
}) => {
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFileContent = async () => {
      if (!filePath) {
        setFileContent(content || null);
        setIsLoading(false);
        if (!content) {
          setError("No file path provided.");
        }
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const loadedContent = await readFile(filePath);
        setFileContent(loadedContent || content || null);
      } catch (err) {
        console.error("Failed to read file:", err);
        setError(`Failed to load file: ${err instanceof Error ? err.message : String(err)}`);
        // Fallback to provided content if file read fails
        setFileContent(content || null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFileContent();
  }, [filePath, content]);

  return (
    <div className="w-full h-full flex flex-col text-[var(--theme-text-primary)]">
      {/* Fixed Header */}
      <div className="flex-shrink-0 p-4 pb-2 border-b border-gray-200">
        <h3 className="text-lg font-courier-prime-bold text-[var(--theme-text-primary)] truncate">
          {filePath.split('/').pop() || 'Untitled'}
        </h3>
        <p className="text-sm text-[var(--theme-text-secondary)] truncate">
          Read-only view • {contentType} • {filePath}
        </p>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-auto">
        <div className="p-4 text-[var(--theme-text-error)]">
          {isLoading ? (
            <div className="text-center text-[var(--theme-text-primary)] py-8"> 
              <p>Loading file content...</p>
            </div>
          ) : error ? (
            <div className="text-center text-[var(--theme-text-error)] py-8">
              <p>Error: {error}</p>
              <p className="text-xs mt-2 break-all">File: {filePath}</p>
            </div>
          ) : fileContent ? (
            <pre className="whitespace-pre-wrap leading-relaxed break-words text-[var(--theme-text-primary)] font-courier-prime text-lg">
              {fileContent}
            </pre>
          ) : (
            <div className="text-center text-[var(--theme-text-primary)] py-8">
              <p>No content available</p>
              <p className="text-xs mt-2 break-all">File: {filePath}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 