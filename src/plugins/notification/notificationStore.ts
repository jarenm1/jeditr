import { create } from 'zustand';
import { nanoid } from 'nanoid';

export type Notification = {
  id: string;
  pluginName: string;
  message: string;
  timestamp: number;
  severity?: 'info' | 'warning' | 'error';
};

interface NotificationState {
  notifications: Notification[];
  addNotification: (n: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  addNotification: (n) => {
    set((state) => {
      const isDuplicate = state.notifications.some(
        (existing) =>
          existing.pluginName === n.pluginName &&
          existing.message === n.message &&
          existing.severity === n.severity
      );
      if (isDuplicate) return { notifications: state.notifications };
      return { notifications: [...state.notifications, { ...n, id: nanoid() }] };
    });
  },
  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((notif) => notif.id !== id)
    }));
  }
}));

export const addNotification = (n: Omit<Notification, 'id'>) =>
  useNotificationStore.getState().addNotification(n);
export const removeNotification = (id: string) =>
  useNotificationStore.getState().removeNotification(id); 