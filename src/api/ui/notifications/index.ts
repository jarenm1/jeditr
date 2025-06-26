// Notification API - enhanced from old plugin notification system
import type { Notification, NotificationAction } from '../../types'
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
  useNotificationStore
} from './notificationStore'

/**
 * Display a notification to the user
 * 
 * @example
 * ```typescript
 * // Simple notification
 * showNotification('myPlugin', 'File saved!', 'info')
 * 
 * // Notification with action
 * showNotification('myPlugin', 'Update available', 'info', {
 *   label: 'Update Now',
 *   actionId: 'myPlugin.update'
 * })
 * 
 * // Using object syntax
 * showNotification({
 *   pluginName: 'myPlugin',
 *   message: 'Operation complete',
 *   severity: 'info'
 * })
 * ```
 */
export function showNotification(notification: Omit<Notification, 'id' | 'timestamp'>): void
export function showNotification(
  pluginName: string,
  message: string,
  severity?: 'info' | 'warning' | 'error',
  action?: NotificationAction
): void
export function showNotification(
  notificationOrPluginName: Omit<Notification, 'id' | 'timestamp'> | string,
  message?: string,
  severity: 'info' | 'warning' | 'error' = 'info',
  action?: NotificationAction
): void {
  if (typeof notificationOrPluginName === 'string') {
    // Legacy plugin API call
    addNotificationToStore({
      pluginName: notificationOrPluginName,
      message: message!,
      severity,
      action,
      timestamp: new Date().getTime()
    })
  } else {
    // New API call with full notification object
    addNotificationToStore({
      ...notificationOrPluginName,
      timestamp: new Date().getTime()
    })
  }
}

/**
 * Remove a notification by ID
 */
export function dismissNotification(id: string): void {
  removeNotificationFromStore(id)
}

/**
 * Clear all notifications
 */
export function clearNotifications(): void {
  const notifications = useNotificationStore.getState().notifications
  notifications.forEach(n => removeNotificationFromStore(n.id))
}

/**
 * Clear notifications from a specific plugin
 */
export function clearPluginNotifications(pluginName: string): void {
  const notifications = useNotificationStore.getState().notifications
  notifications
    .filter(n => n.pluginName === pluginName)
    .forEach(n => removeNotificationFromStore(n.id))
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
}

/**
 * Register a handler for notification actions
 */
export function registerNotificationActionHandler(actionId: string, handler: () => void): void {
  registerActionHandler(actionId, handler)
}

/**
 * Unregister a notification action handler
 */
export function unregisterNotificationActionHandler(actionId: string): void {
  unregisterActionHandler(actionId)
}

/**
 * Execute a notification action
 */
export function executeNotificationAction(actionId: string): void {
  executeAction(actionId)
}

/**
 * Get all current notifications
 */
export function getNotifications(): Notification[] {
  return useNotificationStore.getState().notifications
}

/**
 * Get notifications from a specific plugin
 */
export function getPluginNotifications(pluginName: string): Notification[] {
  return useNotificationStore.getState().notifications.filter(n => n.pluginName === pluginName)
} 