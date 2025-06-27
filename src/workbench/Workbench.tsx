/**
 * @fileoverview
 * @author @jarenm1
 *
 * Workbench component
 * The Workbench is the main component. It contains views.
 *
 * When we open a file, we create a new view using the different registered views.
 * Uses our workbench store with ViewContainers and TabInterface system.
 */

import { useState, useEffect, useRef } from 'react';
import { View } from './View';
import { useWorkbenchStore } from '../store/workbench';
import { getViewTypeForFile } from '../views';
import { WorkbenchFileSelector } from './WorkbenchFileSelector';
import { initializeWorkbenchKeybinds, setFileSelectorCallbacks } from './workbenchKeybinds';
import type { ViewContainer, TabInterface } from '../store/workbench/types';

export const Workbench = () => {
  // TODO: Get state and actions from our workbench store
  const {
    views,
    activeViewId,
    viewOrder,
    splitRatios,
    calculateViewDimensions,
    addView,
    removeView,
    setActiveView,
    addTabToView,
    removeTabFromView,
    setActiveTabInView,
    getActiveTabInView,
    splitView,
    mergeViews,
  } = useWorkbenchStore();

  // TODO: Container ref to get dimensions for layout calculations
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(1200);
  
  // TODO: Ref to track if initial view has been created (prevents React strict mode double execution)
  const initializedRef = useRef(false);

  // TODO: File selector state
  const [fileSelectorOpen, setFileSelectorOpen] = useState(false);
  const [fileSelectorSplitMode, setFileSelectorSplitMode] = useState(false);

  // TODO: Function to open file selector
  const openFileSelector = (splitMode = false) => {
    setFileSelectorSplitMode(splitMode);
    setFileSelectorOpen(true);
  };

  // TODO: Initialize keybinds on mount
  useEffect(() => {
    initializeWorkbenchKeybinds();
    
    // TODO: Register file selector callbacks for keybinds
    setFileSelectorCallbacks({
      openFileSelector
    });
  }, []);

  // TODO: Update container width on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // TODO: Create initial view if none exist - with guard against React strict mode double execution
  useEffect(() => {
    if (views.length === 0 && !initializedRef.current) {
      initializedRef.current = true;
      const newViewId = addView();
      setActiveView(newViewId);
      console.log('[Workbench] Created initial view:', newViewId);
    }
  }, [views.length, addView, setActiveView]);

  // TODO: Function to open a file in the workbench
  const openFile = (filePath: string, viewType?: string) => {
    // TODO: Determine view type if not provided
    const determinedViewType = viewType || getViewTypeForFile(filePath) || 'text-editor';
    
    // TODO: Get or create target view
    let targetViewId = activeViewId;
    if (!targetViewId) {
      targetViewId = addView();
      setActiveView(targetViewId);
    }

    // TODO: Add tab to view
    const tabId = addTabToView(targetViewId, {
      name: filePath.split('/').pop() || 'Untitled',
      filePath,
      viewType: determinedViewType,
      isModified: false,
    });

    return { viewId: targetViewId, tabId };
  };

  // TODO: Function to close a view container
  const closeView = (viewId: string) => {
    removeView(viewId);
    
    // TODO: If no views left, create a new one
    if (views.length <= 1) {
      const newViewId = addView();
      setActiveView(newViewId);
    }
  };

  // TODO: Function to close a specific tab
  const closeTab = (viewId: string, tabId: string) => {
    removeTabFromView(viewId, tabId);
    
    // TODO: If view has no tabs left, close the view
    const view = views.find(v => v.id === viewId);
    if (view && view.tabs.length <= 1) {
      closeView(viewId);
    }
  };

  // TODO: Function to handle view splitting
  const handleSplitView = (viewId: string) => {
    const newViewId = splitView(viewId);
    if (newViewId) {
      setActiveView(newViewId);
    }
  };

  // TODO: Function to handle view merging
  const handleMergeViews = (viewId1: string, viewId2: string) => {
    mergeViews(viewId1, viewId2);
  };

  // TODO: Calculate view dimensions for layout
  const viewDimensions = calculateViewDimensions(containerWidth);

  // TODO: Render view container with its tabs and content
  const renderViewContainer = (viewContainer: ViewContainer, dimensions: { x: number; width: number }) => {
    const activeTab = getActiveTabInView(viewContainer.id);
    const isActive = viewContainer.id === activeViewId;
    
    return (
      <div
        key={viewContainer.id}
        className="absolute top-0 h-full border-r border-[var(--theme-accent-primary)] bg-transparent"
        style={{
          left: dimensions.x,
          width: dimensions.width,
        }}
        onClick={() => setActiveView(viewContainer.id)}
      >
        {/* TODO: Tab bar for this view container */}
        <div className="flex border-b h-8">
          {viewContainer.tabs.map((tab: TabInterface) => (
            <div
              key={tab.id}
              className={`flex items-center px-3 py-1 text-sm border-r border-[var(--theme-accent-primary)] cursor-pointer ${
                tab.id === viewContainer.activeTabId 
                  ? 'border-b-white shadow-sm' 
                  : 'bg-'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                setActiveTabInView(viewContainer.id, tab.id);
              }}
            >
              <span className={tab.isModified ? 'font-bold' : ''}>
                {tab.name}
              </span>
              {tab.isModified && <span className="ml-1 text-orange-500">●</span>}
              <button
                className="ml-2 text-gray-500 hover:text-red-500"
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(viewContainer.id, tab.id);
                }}
              >
                ×
              </button>
            </div>
          ))}
          
          {/* TODO: Add new tab button */}
          <button
            className="px-2 py-1 text-sm text-gray-500 hover:text-gray-700"
            onClick={() => openFileSelector(false)}
            title="Open file (Ctrl+O)"
          >
            +
          </button>
        </div>

        {/* TODO: View content area */}
        <div className="flex-1 overflow-hidden" style={{ height: 'calc(100% - 2rem)' }}>
          {activeTab ? (
            <View
              key={`${viewContainer.id}-${activeTab.id}`}
              viewType={activeTab.viewType}
              content={activeTab.content}
              filePath={activeTab.filePath}
              isModified={activeTab.isModified}
              onClose={() => closeTab(viewContainer.id, activeTab.id)}
              onSplit={() => handleSplitView(viewContainer.id)}
              onMerge={() => {
                // TODO: Find adjacent view to merge with
                const currentIndex = viewOrder.indexOf(viewContainer.id);
                const adjacentViewId = viewOrder[currentIndex + 1] || viewOrder[currentIndex - 1];
                if (adjacentViewId) {
                  handleMergeViews(viewContainer.id, adjacentViewId);
                }
              }}
              onModified={(isModified) => {
                // TODO: Update tab modified state
                // This will be implemented when we add the updateTabInView action
                console.log(`Tab ${activeTab.id} modified: ${isModified}`);
              }}
            />
          ) : (
            // TODO: Empty state when no tabs
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <p className="mb-2">No file open in this view</p>
                <button
                  className="px-3 py-1 text-sm bg-[var(--theme-button-secondary-bg)] text-white rounded hover:bg-[var(--theme-button-secondary-hover)]"
                  onClick={() => openFileSelector(false)}
                >
                  Open File
                </button>
              </div>
            </div>
          )}
        </div>

        {/* TODO: View controls */}
        <div className="absolute top-1 right-1 flex space-x-1">
          <button
            className="p-1 text-xs hover:bg-[var(--theme-button-secondary-hover)] rounded"
            onClick={() => openFileSelector(true)}
            title="Open file in new split (Ctrl+Shift+O)"
          >
            ⫆+
          </button>
          <button
            className="p-1 text-xs hover:bg-[var(--theme-button-secondary-hover)] rounded"
            onClick={() => handleSplitView(viewContainer.id)}
            title="Split View (Ctrl+\)"
          >
            ⫆
          </button>
          <button
            className="p-1 text-xs hover:bg-[var(--theme-button-danger-hover)] rounded"
            onClick={() => closeView(viewContainer.id)}
            title="Close View"
          >
            ×
          </button>
        </div>
      </div>
    );
  };

  return (
    <div 
      ref={containerRef}
      className="w-full h-full relative bg-transparent"
    >
      {/* TODO: If no views, show a welcome screen */}
      {views.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Welcome to the Workbench</p>
            <div className="space-x-2">
              <button
                className="px-4 py-2 bg-[var(--theme-button-secondary-bg)] text-white rounded hover:bg-[var(--theme-button-secondary-hover)]"
                onClick={() => openFile('Welcome.md', 'text-editor')}
              >
                Create New File
              </button>
              <button
                className="px-4 py-2 bg-[var(--theme-button-secondary-bg)] text-white rounded hover:bg-[var(--theme-button-secondary-hover)]"
                onClick={() => openFileSelector(false)}
              >
                Open File
              </button>
            </div>
          </div>
        </div>
      ) : (
        // TODO: Render the view containers with layout
        <div className="w-full h-full relative">
          {views.map((viewContainer) => {
            // TODO: Find dimensions for this view
            const dimensions = viewDimensions.find(d => d.viewId === viewContainer.id);
            if (!dimensions) return null;

            return renderViewContainer(viewContainer, dimensions);
          })}

          {/* TODO: Split dividers for resizing */}
          {splitRatios.map((ratio, index) => {
            const dividerX = containerWidth * splitRatios.slice(0, index + 1).reduce((a, b) => a + b, 0);
            return (
              <div
                key={`divider-${index}`}
                className="absolute top-0 w-1 h-full bg-gray-400 cursor-col-resize hover:bg-gray-600"
                style={{ left: dividerX - 2 }}
                // TODO: Add drag handling for resizing
                onMouseDown={(e) => {
                  // TODO: Implement drag-to-resize functionality
                  console.log(`TODO: Implement resize for divider ${index}`);
                }}
              />
            );
          })}
        </div>
      )}

      {/* TODO: File selector modal */}
      <WorkbenchFileSelector
        isOpen={fileSelectorOpen}
        onClose={() => setFileSelectorOpen(false)}
        openInNewView={fileSelectorSplitMode}
      />
    </div>
  );
};
