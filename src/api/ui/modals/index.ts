import type React from "react";
import { addModal, findModalByPlugin, closeModalByPlugin } from "./modalStore";

export function showModal(pluginName: string, content: React.ReactNode) {
  // Check if a modal from this plugin is already open
  const existingModal = findModalByPlugin(pluginName);

  if (existingModal) {
    // If modal is already open, close it (toggle behavior)
    closeModalByPlugin(pluginName);
  } else {
    // If no modal is open, create a new one
    addModal({ pluginName, content });
  }
}
