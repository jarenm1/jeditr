import { create } from "zustand";
import { nanoid } from "nanoid";

export type NotificationAction = {
  label: string;
  actionId: string;
};

export type Notification = {
  id: string;
  pluginName: string;
  message: string;
  timestamp: number;
  severity?: "info" | "warning" | "error";
  action?: NotificationAction;
};

interface NotificationState {
  notifications: Notification[];
  focusedNotificationId: string | null;
  actionHandlers: Record<string, () => void>;
  addNotification: (n: Omit<Notification, "id">) => void;
  removeNotification: (id: string) => void;
  setFocusedNotification: (id: string | null) => void;
  focusNextNotification: () => void;
  focusPreviousNotification: () => void;
  focusFirstNotification: () => void;
  focusLastNotification: () => void;
  registerActionHandler: (actionId: string, handler: () => void) => void;
  unregisterActionHandler: (actionId: string) => void;
  executeAction: (actionId: string) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  focusedNotificationId: null,
  actionHandlers: {},
  addNotification: (n) => {
    set((state) => {
      const isDuplicate = state.notifications.some(
        (existing) =>
          existing.pluginName === n.pluginName &&
          existing.message === n.message &&
          existing.severity === n.severity,
      );
      if (isDuplicate) return { notifications: state.notifications };
      const newNotification = { ...n, id: nanoid() };
      return {
        notifications: [...state.notifications, newNotification],
        // Auto-focus the first notification if none is focused
        focusedNotificationId:
          state.focusedNotificationId || newNotification.id,
      };
    });
  },
  removeNotification: (id) => {
    set((state) => {
      const newNotifications = state.notifications.filter(
        (notif) => notif.id !== id,
      );
      let newFocusedId = state.focusedNotificationId;

      // If we're removing the focused notification, focus the next one
      if (state.focusedNotificationId === id) {
        if (newNotifications.length === 0) {
          newFocusedId = null;
        } else {
          const currentIndex = state.notifications.findIndex(
            (n) => n.id === id,
          );
          // Try to focus the next notification, or the previous one if we're at the end
          const nextIndex =
            currentIndex < newNotifications.length
              ? currentIndex
              : currentIndex - 1;
          newFocusedId = newNotifications[nextIndex].id;
        }
      }

      return {
        notifications: newNotifications,
        focusedNotificationId: newFocusedId,
      };
    });
  },
  setFocusedNotification: (id) => {
    set({ focusedNotificationId: id });
  },
  focusNextNotification: () => {
    const state = get();
    if (state.notifications.length === 0) return;

    if (!state.focusedNotificationId) {
      set({ focusedNotificationId: state.notifications[0].id });
      return;
    }

    const currentIndex = state.notifications.findIndex(
      (n) => n.id === state.focusedNotificationId,
    );
    if (currentIndex === -1) {
      set({ focusedNotificationId: state.notifications[0].id });
      return;
    }

    const nextIndex = (currentIndex + 1) % state.notifications.length;
    set({ focusedNotificationId: state.notifications[nextIndex].id });
  },
  focusPreviousNotification: () => {
    const state = get();
    if (state.notifications.length === 0) return;

    if (!state.focusedNotificationId) {
      set({
        focusedNotificationId:
          state.notifications[state.notifications.length - 1].id,
      });
      return;
    }

    const currentIndex = state.notifications.findIndex(
      (n) => n.id === state.focusedNotificationId,
    );
    if (currentIndex === -1) {
      set({
        focusedNotificationId:
          state.notifications[state.notifications.length - 1].id,
      });
      return;
    }

    const prevIndex =
      currentIndex === 0 ? state.notifications.length - 1 : currentIndex - 1;
    set({ focusedNotificationId: state.notifications[prevIndex].id });
  },
  focusFirstNotification: () => {
    const state = get();
    if (state.notifications.length > 0) {
      set({ focusedNotificationId: state.notifications[0].id });
    }
  },
  focusLastNotification: () => {
    const state = get();
    if (state.notifications.length > 0) {
      set({
        focusedNotificationId:
          state.notifications[state.notifications.length - 1].id,
      });
    }
  },
  registerActionHandler: (actionId, handler) => {
    set((state) => ({
      actionHandlers: { ...state.actionHandlers, [actionId]: handler },
    }));
  },
  unregisterActionHandler: (actionId) => {
    set((state) => {
      const { [actionId]: _, ...rest } = state.actionHandlers;
      return { actionHandlers: rest };
    });
  },
  executeAction: (actionId) => {
    const state = get();
    const handler = state.actionHandlers[actionId];
    if (handler) {
      handler();
    } else {
      console.warn(`No action handler registered for actionId: ${actionId}`);
    }
  },
}));

export const addNotification = (n: Omit<Notification, "id">) =>
  useNotificationStore.getState().addNotification(n);
export const removeNotification = (id: string) =>
  useNotificationStore.getState().removeNotification(id);
export const setFocusedNotification = (id: string | null) =>
  useNotificationStore.getState().setFocusedNotification(id);
export const focusNextNotification = () =>
  useNotificationStore.getState().focusNextNotification();
export const focusPreviousNotification = () =>
  useNotificationStore.getState().focusPreviousNotification();
export const focusFirstNotification = () =>
  useNotificationStore.getState().focusFirstNotification();
export const focusLastNotification = () =>
  useNotificationStore.getState().focusLastNotification();
export const registerActionHandler = (actionId: string, handler: () => void) =>
  useNotificationStore.getState().registerActionHandler(actionId, handler);
export const unregisterActionHandler = (actionId: string) =>
  useNotificationStore.getState().unregisterActionHandler(actionId);
export const executeAction = (actionId: string) =>
  useNotificationStore.getState().executeAction(actionId);
