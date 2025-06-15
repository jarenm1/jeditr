import React from 'react';
import { useVimStore } from '@store/vimStore';
import { registerBottomBarItem } from '@store/bottomBarRegistry';

export function renderVimBar() {
  const { mode, command, message } = useVimStore();
  return (
    <>
      <span className="mr-4 text-yellow-400">{mode.toUpperCase()}</span>
      <span className="mr-4 text-blue-400">{command}</span>
      <span className="text-green-400">{message}</span>
    </>
  );
}

// Register VimBar as a bottom bar item
registerBottomBarItem({
  id: 'vim',
  render: renderVimBar,
  order: 0,
}); 