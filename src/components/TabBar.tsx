import React from 'react';
import { EditorTab } from '@store/editorStore';

interface TabBarProps {
  tabs: EditorTab[];
  activeTabId: string | null;
  onTabChange: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
}

export const TabBar: React.FC<TabBarProps> = ({ tabs, activeTabId, onTabChange, onTabClose }) => {
  return (
    <div className="tab-bar flex flex-row bg-gray-800 border-b border-gray-700">
      {tabs.map(tab => (
        <div
          key={tab.id}
          className={`flex items-center px-4 py-2 cursor-pointer select-none ${tab.id === activeTabId ? 'bg-gray-900 text-white' : 'text-gray-300'}`}
          onClick={() => onTabChange(tab.id)}
        >
          <span className="mr-2">{tab.path.split('/').pop()}</span>
          {tab.isDirty && <span className="text-yellow-400">*</span>}
          <button
            className="ml-2 text-gray-500 hover:text-red-500"
            onClick={e => { e.stopPropagation(); onTabClose(tab.id); }}
            title="Close tab"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};