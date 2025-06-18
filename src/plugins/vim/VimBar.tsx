import React from 'react';
import { useVimStore } from '@ubar/ubarStore/vimStore';
import { useBottomBarStore } from '@ubar/ubarStore';

const VimBar: React.FC = () => {
  const { mode, command, message } = useVimStore();
  return (
    <>
      <span className="mr-4 text-[var(--color-primary)]">{mode.toUpperCase()}</span>
      <span className="mr-4 text-[var(--color-primary)]">{command}</span>
      <span className="text-[var(--color-primary)]">{message}</span>
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