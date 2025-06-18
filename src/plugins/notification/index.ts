import { addNotification } from './notificationStore';


/**
 * Displays a notification for a plugin.
 *
 * @param pluginName - The name of the plugin sending the notification.
 * @param message - The notification message to display.
 * @param severity - The severity level of the notification ('info', 'warning', or 'error'). Defaults to 'info'.
 */
export function showNotification(pluginName: string, message: string, severity: 'info' | 'warning' | 'error' = 'info') {
  addNotification({ pluginName, message, timestamp: Date.now(), severity });
} 