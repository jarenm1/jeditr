import React from 'react';
import { useVimStore } from '@ubar/ubarStore/vimStore';
import { useBottomBarStore } from '@ubar/ubarStore';

const VimBar: React.FC = () => {
  const { mode, command, message } = useVimStore();
  return (
    <>
      <span className="mr-4 text-yellow-400">{mode.toUpperCase()}</span>
      <span className="mr-4 text-blue-400">{command}</span>
      <span className="text-green-400">{message}</span>
    </>
  );
};

// Register VimBar as a plugin in the bottom bar registry at module scope
useBottomBarStore.getState().register({
  id: 'vim',
  component: VimBar,
  order: 0,
});

export default VimBar; 