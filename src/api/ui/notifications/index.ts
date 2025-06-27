/**
 * @fileoverview Notifications API
 *
 * API for displaying notifications to the user
 *
 * Fully working as of 2025-06-26
 *
 * @author @jarenm1
 * @since 0.1.0
 */

import type {
  Notification,
  NotificationAction,
  NotificationSeverity,
} from "./types";

import {
  addNotification as addNotificationToStore,
  removeNotification as removeNotificationFromStore,
  setFocusedNotification,
  focusNextNotification,
  focusPreviousNotification,
  focusFirstNotification,
  focusLastNotification,
  registerActionHandler,
  unregisterActionHandler,
  executeAction,
  useNotificationStore,
} from "./notificationStore";

/**
 * Display a notification to the user with optional action button
 *
 * @param pluginName - Name of the plugin showing the notification
 * @param message - The notification message
 * @param severity - Notification type (info, warning, error)
 * @param action - Optional action button configuration with plugin namespacing
 *
 * @example
 * ```typescript
 * // Simple notification
 * showNotification('myPlugin', 'File saved!', 'info')
 *
 * // Notification with action button
 * showNotification('myPlugin', 'Update available', 'info', {
 *   label: 'Update Now',
 *   actionId: 'myPlugin.update'
 * })
 *
 * // Error notification
 * showNotification('myPlugin', 'Failed to connect', 'error')
 * ```
 *
 * @since 0.1.0
 */
export function showNotification(
  pluginName: string,
  message: string,
  severity: NotificationSeverity,
  action?: NotificationAction,
): void {
  addNotificationToStore({
    pluginName,
    message,
    severity,
    action,
    timestamp: new Date().getTime(),
  });
}

/**
 * Remove a notification by its unique ID.
 *
 * @param id - The unique identifier of the notification to remove.
 * @since 0.1.0
 */
export function dismissNotification(id: string): void {
  removeNotificationFromStore(id);
}

/**
 * Clear all notifications
 */
export function clearNotifications(): void {
  const notifications = useNotificationStore.getState().notifications;
  notifications.forEach((n) => removeNotificationFromStore(n.id));
}

/**
 * Clear notifications from a specific plugin
 */
export function clearPluginNotifications(pluginName: string): void {
  const notifications = useNotificationStore.getState().notifications;
  notifications
    .filter((n) => n.pluginName === pluginName)
    .forEach((n) => removeNotificationFromStore(n.id));
}

/**
 * Focus navigation for notifications
 */
export const notificationNavigation = {
  focusNext: focusNextNotification,
  focusPrevious: focusPreviousNotification,
  focusFirst: focusFirstNotification,
  focusLast: focusLastNotification,
  setFocused: setFocusedNotification,
};

/**
 * Register a handler for notification actions
 */
export function registerNotificationActionHandler(
  actionId: string,
  handler: () => void,
): void {
  registerActionHandler(actionId, handler);
}

/**
 * Unregister a notification action handler
 */
export function unregisterNotificationActionHandler(actionId: string): void {
  unregisterActionHandler(actionId);
}

/**
 * Execute a notification action
 */
export function executeNotificationAction(actionId: string): void {
  executeAction(actionId);
}

/**
 * Get all current notifications
 */
export function getNotifications(): Notification[] {
  return useNotificationStore.getState().notifications;
}

/**
 * Get notifications from a specific plugin
 */
export function getPluginNotifications(pluginName: string): Notification[] {
  return useNotificationStore
    .getState()
    .notifications.filter((n) => n.pluginName === pluginName);
}
