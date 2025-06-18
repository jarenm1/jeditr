import React, { useEffect, useRef, useState } from 'react';

export interface PickerItem {
  label: string;
  value: any;
}

interface PickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: PickerItem[];
  onSelect: (item: PickerItem) => void;
  title?: string;
  renderItem?: (item: PickerItem, selected: boolean) => React.ReactNode;
}

export const PickerModal: React.FC<PickerModalProps> = ({
  isOpen,
  onClose,
  items,
  onSelect,
  title = 'Select an item',
  renderItem,
}) => {
  const [search, setSearch] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter items by search
  const filteredItems = items.filter(item =>
    item.label.toLowerCase().includes(search.toLowerCase())
  );

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIdx(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || (e.key === 'Tab' && !e.shiftKey)) {
      e.preventDefault();
      setSelectedIdx(idx => (idx + 1) % filteredItems.length);
    } else if (e.key === 'ArrowUp' || (e.key === 'Tab' && e.shiftKey)) {
      e.preventDefault();
      setSelectedIdx(idx => (idx - 1 + filteredItems.length) % filteredItems.length);
    } else if (e.key === 'Enter') {
      if (filteredItems[selectedIdx]) {
        onSelect(filteredItems[selectedIdx]);
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded shadow-lg p-6 min-w-[320px] outline-none">
        <div className="mb-4 text-lg font-bold text-white">{title}</div>
        <input
          ref={inputRef}
          className="w-full mb-3 px-3 py-2 rounded bg-gray-800 text-white outline-none"
          placeholder="Type to search..."
          value={search}
          onChange={e => {
            setSearch(e.target.value);
            setSelectedIdx(0);
          }}
          onKeyDown={handleKeyDown}
        />
        <div className="flex flex-col gap-1 max-h-60 overflow-y-auto">
          {filteredItems.length === 0 ? (
            <div className="px-3 py-2 text-gray-400">No results</div>
          ) : (
            filteredItems.map((item, idx) => (
              <div
                key={item.label + idx}
                className={`px-3 py-2 rounded cursor-pointer ${idx === selectedIdx ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-200'}`}
                onMouseEnter={() => setSelectedIdx(idx)}
                onClick={() => onSelect(item)}
              >
                {renderItem ? renderItem(item, idx === selectedIdx) : item.label}
              </div>
            ))
          )}
        </div>
        <div className="mt-4 text-xs text-gray-400">Use ↑/↓ or Tab to navigate, Enter to select, Esc to close.</div>
        <button
          className="mt-4 px-4 py-2 bg-gray-700 text-white rounded"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};
