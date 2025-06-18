import React from 'react';
import { useModalStore, updateModalPosition, hideModal } from './modalStore';
import { Modal } from './Modal';
import { pluginWorkers } from '@plugins/loader';

export const PluginModals: React.FC = () => {
  // Get all modals, but only show the last visible one
  const modals = useModalStore((s) => s.modals);
  const visibleModal = [...modals].reverse().find((m) => m.visible);

  // Handle button clicks inside modal content
  const handleContentClick = (pluginName: string) => (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'BUTTON' && target.dataset.action) {
      const worker = pluginWorkers[pluginName];
      if (worker) {
        worker.postMessage({ type: 'modal-action', action: target.dataset.action });
      }
    }
  };

  if (!visibleModal) return null;

  return (
    <Modal
      key={visibleModal.id}
      id={visibleModal.id}
      position={visibleModal.position}
      pluginName={visibleModal.pluginName}
      onClose={hideModal}
      onDragEnd={updateModalPosition}
    >
      <div
        onClick={handleContentClick(visibleModal.pluginName)}
        dangerouslySetInnerHTML={{ __html: String(visibleModal.content) }}
      />
    </Modal>
  );
}; 