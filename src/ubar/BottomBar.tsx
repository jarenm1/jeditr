import React from 'react';
import { useBottomBarStore } from '@ubar/ubarStore';

export const BottomBar: React.FC = () => {
  const items = useBottomBarStore((state) => state.items);

  return (
    <div className="fixed bottom-0 left-0 right-0 h-8 bg-gray-900 text-white flex items-center px-4 font-mono z-50 border-t border-gray-800">
      {items.map(item => (
        <div key={item.id} className="mr-6 flex items-center">
          <item.component />
        </div>
      ))}
    </div>
  );
}; 