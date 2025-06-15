import React, { useEffect, useState } from 'react';
import { getBottomBarItems } from '@store/bottomBarRegistry';

export const BottomBar: React.FC = () => {
  const [items, setItems] = useState(getBottomBarItems());

  // Optionally, listen for registry changes (for now, just update on mount)
  // In a real plugin system, you might use an event emitter or Zustand for reactivity
  useEffect(() => {
    setItems(getBottomBarItems());
    // TODO: Add event-based update if plugins can register/unregister at runtime
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 h-8 bg-gray-900 text-white flex items-center px-4 font-mono z-50 border-t border-gray-800">
      {items.map(item => (
        <div key={item.id} className="mr-6 flex items-center">
          {item.render()}
        </div>
      ))}
    </div>
  );
}; 