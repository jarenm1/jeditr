/**
 * @fileoverview
 * @author @jarenm1
 *
 * Workbench types
 * Shared types for all workbench slices
 */

export interface TabInterface {
  id: string;
  name: string;
  filePath: string;
  viewType: string; // 'text-editor', 'image-viewer', 'json-editor', etc.
  content?: any;
  isModified?: boolean;
  lastAccessed?: Date;
}

export interface ViewContainer {
  id: string;
  tabs: TabInterface[];
  activeTabId: string | null;
  position?: {
    x: number;
    width: number;
  };
}

export interface FocusHistoryEntry {
  viewId: string;
  tabId: string;
  timestamp: Date;
}

// Legacy - keeping for compatibility
export interface ViewInterface extends TabInterface {}
