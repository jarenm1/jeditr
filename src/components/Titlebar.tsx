import React, { useEffect } from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';

interface TitlebarProps {
  currentFileName?: string;
}

const Titlebar: React.FC<TitlebarProps> = ({ currentFileName = 'Untitled' }) => {
  useEffect(() => {
    const appWindow = getCurrentWindow();

    const handleMinimize = () => appWindow.minimize();
    const handleMaximize = () => appWindow.toggleMaximize();
    const handleClose = () => appWindow.close();

    const minimizeButton = document.getElementById('titlebar-minimize');
    const maximizeButton = document.getElementById('titlebar-maximize');
    const closeButton = document.getElementById('titlebar-close');

    minimizeButton?.addEventListener('click', handleMinimize);
    maximizeButton?.addEventListener('click', handleMaximize);
    closeButton?.addEventListener('click', handleClose);

    return () => {
      minimizeButton?.removeEventListener('click', handleMinimize);
      maximizeButton?.removeEventListener('click', handleMaximize);
      closeButton?.removeEventListener('click', handleClose);
    };
  }, []);

  return (
    <div className="titlebar">
      <div className="titlebar-drag-region">
        <div className="titlebar-controls">
          <button
            className="titlebar-button"
            id="titlebar-minimize"
            aria-label="Minimize"
          >
            <svg width="10" height="1" viewBox="0 0 10 1">
              <path d="M0 0h10v1H0z" />
            </svg>
          </button>
          <button
            className="titlebar-button"
            id="titlebar-maximize"
            aria-label="Maximize"
          >
            <svg width="10" height="10" viewBox="0 0 10 10">
              <path d="M0 0v10h10V0H0zm9 9H1V1h8v8z" />
            </svg>
          </button>
          <button
            className="titlebar-button"
            id="titlebar-close"
            aria-label="Close"
          >
            <svg width="10" height="10" viewBox="0 0 10 10">
              <path d="M6.4 5l3.3-3.3c.4-.4.4-1 0-1.4-.4-.4-1-.4-1.4 0L5 3.6 1.7.3C1.3-.1.7-.1.3.3c-.4.4-.4 1 0 1.4L3.6 5 .3 8.3c-.4.4-.4 1 0 1.4.2.2.4.3.7.3.3 0 .5-.1.7-.3L5 6.4l3.3 3.3c.2.2.4.3.7.3.3 0 .5-.1.7-.3.4-.4.4-1 0-1.4L6.4 5z" />
            </svg>
          </button>
        </div>
        <div className="titlebar-title">jeditr - {currentFileName}</div>
      </div>
    </div>
  );
};

export default Titlebar;
