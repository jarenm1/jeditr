import { create } from 'zustand';

export type Notification = {
  pluginName: string;
  message: string;
  timestamp: number;
  severity?: 'info' | 'warning' | 'error';
};

interface NotificationState {
  notifications: Notification[];
  addNotification: (n: Notification) => void;
  removeNotification: (timestamp: number) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  addNotification: (n) => set((state) => {
    const isDuplicate = state.notifications.some(
      (existing) =>
        existing.pluginName === n.pluginName &&
        existing.message === n.message &&
        existing.severity === n.severity
    );
    if (isDuplicate) return { notifications: state.notifications };
    return { notifications: [...state.notifications, n] };
  }),
  removeNotification: (timestamp) => set((state) => ({ notifications: state.notifications.filter(n => n.timestamp !== timestamp) })),
}));

export const addNotification = (n: Notification) => useNotificationStore.getState().addNotification(n);
export const removeNotification = (timestamp: number) => useNotificationStore.getState().removeNotification(timestamp); 