/**
 * @fileoverview
 * @author @jarenm1
 * 
 * Views Index
 * Registers all built-in views and exports view components
 */

import React from 'react';
import { registerDefaultView } from '../api/ui/views/viewRegistry';
import { ReadOnlyView, readOnlyViewConfig } from './readOnlyView';
import { ImageView, imageViewConfig } from './imageView';
import type { DefaultView } from '../api/ui/views/types';

// TODO: Map of file extensions to view types
const FILE_TYPE_TO_VIEW: Record<string, string> = {
  // Image files
  '.jpg': 'imageView',
  '.jpeg': 'imageView', 
  '.png': 'imageView',
  '.gif': 'imageView',
  '.bmp': 'imageView',
  '.webp': 'imageView',
  '.svg': 'imageView',
  '.ico': 'imageView',
  // Default to readOnly for everything else
};

// TODO: Function to get view type for a file path
export function getViewTypeForFile(filePath: string): string {
  const extension = filePath.split('.').pop()?.toLowerCase();
  if (extension) {
    const fullExt = `.${extension}`;
    return FILE_TYPE_TO_VIEW[fullExt] || 'readOnly';
  }
  return 'readOnly';
}

// TODO: Register views
export function initializeDefaultViews(): void {
  console.log('🎨 Initializing default views...');

  // Register read-only view as the default fallback
  const readOnlyDefaultView: DefaultView = {
    id: readOnlyViewConfig.id,
    name: readOnlyViewConfig.name,
    render: (props) => React.createElement(ReadOnlyView, props)
  };
  registerDefaultView(readOnlyDefaultView);
  console.log(`✅ Registered default view: ${readOnlyDefaultView.name}`);

  // Note: We only register one default view with the registry
  // The view selection happens in the workbench based on file type
  
  console.log('🎨 Default views initialization complete');
}

// TODO: Export view components and configs for direct use
export { ReadOnlyView } from './readOnlyView';
export { ImageView } from './imageView';
export { readOnlyViewConfig, imageViewConfig };
