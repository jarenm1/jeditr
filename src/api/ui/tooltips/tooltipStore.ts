import { create } from "zustand";
import { nanoid } from "nanoid";

export interface TooltipPosition {
  x: number;
  y: number;
}

export interface Tooltip {
  id: string;
  content: string | string[];
  position: TooltipPosition;
  visible: boolean;
  autoHide?: boolean;
  hideDelay?: number;
}

interface TooltipState {
  tooltips: Tooltip[];
  addTooltip: (tooltip: Omit<Tooltip, 'id'>) => string;
  removeTooltip: (id: string) => void;
  clearAllTooltips: () => void;
  updateTooltipPosition: (id: string, position: TooltipPosition) => void;
  hideTooltip: (id: string) => void;
  showTooltip: (id: string) => void;
}

export const useTooltipStore = create<TooltipState>((set, get) => ({
  tooltips: [],
  
  addTooltip: (tooltip) => {
    const id = nanoid();
    const newTooltip = { 
      ...tooltip, 
      id,
      visible: tooltip.visible ?? true,
      autoHide: tooltip.autoHide ?? true,
      hideDelay: tooltip.hideDelay ?? 3000
    };
    
    set((state) => ({
      tooltips: [...state.tooltips, newTooltip]
    }));
    
    // Auto-hide if enabled
    if (newTooltip.autoHide && newTooltip.hideDelay) {
      setTimeout(() => {
        get().removeTooltip(id);
      }, newTooltip.hideDelay);
    }
    
    return id;
  },
  
  removeTooltip: (id) => {
    set((state) => ({
      tooltips: state.tooltips.filter(tooltip => tooltip.id !== id)
    }));
  },
  
  clearAllTooltips: () => {
    set({ tooltips: [] });
  },
  
  updateTooltipPosition: (id, position) => {
    set((state) => ({
      tooltips: state.tooltips.map(tooltip => 
        tooltip.id === id ? { ...tooltip, position } : tooltip
      )
    }));
  },
  
  hideTooltip: (id) => {
    set((state) => ({
      tooltips: state.tooltips.map(tooltip => 
        tooltip.id === id ? { ...tooltip, visible: false } : tooltip
      )
    }));
  },
  
  showTooltip: (id) => {
    set((state) => ({
      tooltips: state.tooltips.map(tooltip => 
        tooltip.id === id ? { ...tooltip, visible: true } : tooltip
      )
    }));
  }
}));

// Convenience exports
export const addTooltip = (tooltip: Omit<Tooltip, 'id'>) => 
  useTooltipStore.getState().addTooltip(tooltip);

export const removeTooltip = (id: string) => 
  useTooltipStore.getState().removeTooltip(id);

export const clearAllTooltips = () => 
  useTooltipStore.getState().clearAllTooltips();

export const updateTooltipPosition = (id: string, position: TooltipPosition) => 
  useTooltipStore.getState().updateTooltipPosition(id, position);

export const hideTooltip = (id: string) => 
  useTooltipStore.getState().hideTooltip(id);

export const showTooltip = (id: string) => 
  useTooltipStore.getState().showTooltip(id); 