import React from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { useEditorStore } from '@editor/editorStore/index';

interface TitlebarProps {
  currentFileName: string;
  isDirty: boolean;
}

const Titlebar: React.FC<TitlebarProps> = ({ currentFileName, isDirty }) => {
  const handleMinimize = () => getCurrentWindow().minimize();
  const handleMaximize = () => getCurrentWindow().toggleMaximize();
  const handleClose = () => getCurrentWindow().close();

  const { workspaces, activeWorkspaceId, setActiveWorkspace } = useEditorStore();

  return (
    <div className="h-10 w-full flex items-center select-none border-b border-[var(--color-secondary)] px-2 relative">
      {/* Left: Workspace Switcher */}
      <div className="flex gap-2 flex-shrink-0 z-10 pointer-events-auto" style={{ WebkitAppRegion: 'no-drag' } as any}>
        {workspaces.map((ws, idx) => (
          <button
            key={ws.id}
            onClick={e => { e.stopPropagation(); setActiveWorkspace(ws.id); }}
            className={`px-2 py-1 rounded text-xs font-mono transition-colors ${ws.id === activeWorkspaceId ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
            style={{ minWidth: 28 }}
          >
            {idx + 1}
          </button>
        ))}
      </div>
      {/* Drag Region (center, flex-1) */}
      <div className="flex-1 h-full titlebar-drag-region flex items-center justify-center" style={{ WebkitAppRegion: 'drag' } as any} />
      {/* Center: Title (absolutely centered, pointer-events-none) */}
      <div className="absolute left-0 right-0 top-0 h-full flex items-center justify-center pointer-events-none">
        <div className="text-[var(--color-fg)] font-mono text-sm truncate pointer-events-auto">
          {/* Placeholder for current file name */}
          {currentFileName || 'No file selected'}{isDirty ? ' *' : ''}
        </div>
      </div>
      {/* Right: Window Buttons */}
      <div className="flex flex-shrink-0 absolute right-0 top-0 h-full z-10" style={{ WebkitAppRegion: 'no-drag' } as any}>
        <button
          className="w-10 h-10 flex items-center justify-center hover:bg-[var(--color-tertiary)] transition-colors"
          id="titlebar-minimize"
          aria-label="Minimize"
          onClick={handleMinimize}
        >
          <svg width="10" height="1" viewBox="0 0 10 1" fill="currentColor">
            <path d="M0 0h10v1H0z" />
          </svg>
        </button>
        <button
          className="w-10 h-10 flex items-center justify-center hover:bg-[var(--color-tertiary)] transition-colors"
          id="titlebar-maximize"
          aria-label="Maximize"
          onClick={handleMaximize}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
            <path d="M0 0v10h10V0H0zm9 9H1V1h8v8z" />
          </svg>
        </button>
        <button
          className="w-10 h-10 flex items-center justify-center hover:bg-[var(--color-danger)] transition-colors"
          id="titlebar-close"
          aria-label="Close"
          onClick={handleClose}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
            <path d="M6.4 5l3.3-3.3c.4-.4.4-1 0-1.4-.4-.4-1-.4-1.4 0L5 3.6 1.7.3C1.3-.1.7-.1.3.3c-.4.4-.4 1 0 1.4L3.6 5 .3 8.3c-.4.4-.4 1 0 1.4.2.2.4.3.7.3.3 0 .5-.1.7-.3L5 6.4l3.3 3.3c.2.2.4.3.7.3.3 0 .5-.1.7-.3.4-.4.4-1 0-1.4L6.4 5z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Titlebar;
