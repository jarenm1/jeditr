import { addNotification } from "./notificationStore";
import type { NotificationAction } from "./notificationStore";

/**
 * Displays a notification for a plugin.
 *
 * @param pluginName - The name of the plugin sending the notification.
 * @param message - The notification message to display.
 * @param severity - The severity level of the notification ('info', 'warning', or 'error'). Defaults to 'info'.
 * @param action - Optional action button configuration.
 *
 * @example
 * // Basic notification without action
 * showNotification('My Plugin', 'Something happened!', 'info');
 *
 * @example
 * // Notification with action button
 * showNotification('My Plugin', 'Update available!', 'info', {
 *   label: 'Update Now',
 *   actionId: 'myPlugin.updateNow'
 * });
 *
 * @example
 * // Error notification with retry action
 * showNotification('My Plugin', 'Failed to save file', 'error', {
 *   label: 'Retry',
 *   actionId: 'myPlugin.retrySave'
 * });
 *
 * Action Button Details:
 * - label: The text displayed on the button (e.g., "Update Now", "Retry", "Open File")
 * - actionId: A namespaced identifier for the action (e.g., "pluginName.actionName")
 *   The actionId should follow the pattern: "{pluginName}.{actionName}" to avoid conflicts
 *   between different plugins. The plugin will receive an 'executeAction' message with
 *   this actionId when the button is clicked or Enter is pressed.
 */
export function showNotification(
  pluginName: string,
  message: string,
  severity: "info" | "warning" | "error" = "info",
  action?: NotificationAction,
) {
  addNotification({
    pluginName,
    message,
    timestamp: Date.now(),
    severity,
    action,
  });
}
