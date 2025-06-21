import React from "react";
import { useModalStore, updateModalPosition, hideModal } from "./modalStore";
import { Modal } from "./Modal";
import { pluginWorkers } from "@plugins/loader";

/**
 * PluginModals.tsx
 *
 * This component acts as a global modal manager for plugin-provided modals.
 * It listens to the modal store and renders the most recently opened, visible modal on the screen.
 *
 * Each modal is displayed using the generic Modal container, which supports drag-and-drop and custom positioning.
 * The modal content is rendered as HTML (dangerouslySetInnerHTML), allowing plugins to provide rich content including code blocks and buttons.
 *
 * When a button with a data-action attribute is clicked inside the modal, this component looks up the correct plugin worker
 * (using the plugin name) and sends a message back to the worker with the action. This enables plugins to react to user
 * interactions in their modals, such as triggering notifications or other plugin logic.
 *
 * Only one plugin modal is shown at a time (the most recent visible one). If no modals are visible, nothing is rendered.
 */
export const PluginModals: React.FC = () => {
	// Get all modals, but only show the last visible one
	const modals = useModalStore((s) => s.modals);
	const visibleModal = [...modals].reverse().find((m) => m.visible);

	// Handle button clicks inside modal content
	const handleContentClick =
		(pluginName: string) => (e: React.MouseEvent<HTMLDivElement>) => {
			const target = e.target as HTMLElement;
			if (target.tagName === "BUTTON" && target.dataset.action) {
				const worker = pluginWorkers[pluginName];
				if (worker) {
					worker.postMessage({
						type: "modal-action",
						action: target.dataset.action,
					});
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
