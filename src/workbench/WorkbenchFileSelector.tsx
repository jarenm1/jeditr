/**
 * @fileoverview
 * @author @jarenm1
 * 
 * Workbench File Selector
 * Integrates the FileSelector component with the workbench store
 */

import React from 'react';
import { FileSelector, type FileSelectorProps } from '../components/FileSelector';
import { openFileInCurrentView } from './workbenchKeybinds';
import { getViewTypeForFile } from '../views';
import type { PickerItem } from '../components/PickerModal';

export interface WorkbenchFileSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  openInNewView?: boolean; // If true, opens in a new split view
}

export const WorkbenchFileSelector: React.FC<WorkbenchFileSelectorProps> = ({
  isOpen,
  onClose,
  openInNewView = false
}) => {
  
  // TODO: Handle file selection and integrate with workbench
  const handleFileSelect = (file: PickerItem) => {
    const filePath = file.value; // PickerItem.value contains the file path
    
    // TODO: Determine view type based on file extension
    const viewType = getViewTypeForFile(filePath);
    
    if (openInNewView) {
      // TODO: Open in new split view
      import('../store/workbench').then(({ splitViewWithFile, useWorkbenchStore }) => {
        const store = useWorkbenchStore.getState();
        if (store.activeViewId) {
          const result = splitViewWithFile(
            store.activeViewId,
            filePath,
            viewType,
            file.label
          );
          
          if (result) {
            console.log(`[Workbench] Opened ${filePath} in new split view`);
          } else {
            // Fallback to current view if split fails
            openFileInCurrentView(filePath, viewType);
          }
        } else {
          // No active view, just open in current
          openFileInCurrentView(filePath, viewType);
        }
      });
    } else {
      // TODO: Open in current view as new tab
      openFileInCurrentView(filePath, viewType);
    }
    
    // TODO: Close the file selector
    onClose();
  };

  return (
    <FileSelector
      isOpen={isOpen}
      onClose={onClose}
      onSelect={handleFileSelect}
    />
  );
}; 