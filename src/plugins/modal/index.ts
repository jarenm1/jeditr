import { addModal } from './modalStore';


export function showModal(pluginName: string, content: React.ReactNode) {
  addModal({ pluginName, content });
}
