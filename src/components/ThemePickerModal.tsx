import React, { useEffect, useRef, useState } from 'react';
import { getAllThemes, applyTheme, Theme } from '@services/themeLoader';
import { mapKey, defineEx } from '@services/vimApi';

interface ThemePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onThemeChange?: (theme: Theme) => void;
  onRequestOpen?: () => void;
}

export const ThemePickerModal: React.FC<ThemePickerModalProps> = ({ isOpen, onClose, onThemeChange, onRequestOpen }) => {
  const themes = getAllThemes();
  const [selectedIdx, setSelectedIdx] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  // Register keybindings for opening the modal
  useEffect(() => {
    // Standard keybind: Ctrl+K T
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        const handler = (ev: KeyboardEvent) => {
          if (ev.key.toLowerCase() === 't') {
            onRequestOpen?.();
            window.removeEventListener('keydown', handler);
          } else {
            window.removeEventListener('keydown', handler);
          }
        };
        window.addEventListener('keydown', handler);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Vim keybind: <leader>th
    // Register Ex command and mapping
    defineEx('themePicker', 'themePicker', () => {
      onRequestOpen?.();
    });
    mapKey('<leader>th', ':themePicker\n', 'normal');

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      // No need to unregister Vim mappings (they persist for session)
    };
  }, [onRequestOpen]);

  useEffect(() => {
    if (isOpen) {
      setSelectedIdx(0);
      setTimeout(() => {
        listRef.current?.focus();
      }, 0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'Tab') {
      e.preventDefault();
      setSelectedIdx(idx => (idx + 1) % themes.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIdx(idx => (idx - 1 + themes.length) % themes.length);
    } else if (e.key === 'Enter') {
      const theme = themes[selectedIdx];
      if (theme) {
        applyTheme(theme);
        onThemeChange?.(theme);
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className="bg-gray-900 rounded shadow-lg p-6 min-w-[300px] outline-none"
        tabIndex={0}
        ref={listRef}
        onKeyDown={handleKeyDown}
      >
        <div className="mb-4 text-lg font-bold text-white">Select Theme</div>
        <div className="flex flex-col gap-1">
          {themes.map((theme, idx) => (
            <div
              key={theme.name}
              className={`px-3 py-2 rounded cursor-pointer ${idx === selectedIdx ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-200'}`}
              onMouseEnter={() => setSelectedIdx(idx)}
              onClick={() => {
                applyTheme(theme);
                onThemeChange?.(theme);
                onClose();
              }}
            >
              {theme.name}
            </div>
          ))}
        </div>
        <div className="mt-4 text-xs text-gray-400">Use ↑/↓ or Tab to navigate, Enter to select, Esc to close.</div>
      </div>
    </div>
  );
}; 