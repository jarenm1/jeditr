/**
 * @fileoverview Notification Types
 *
 * Types for notifications and notification actions
 *
 * @since 0.1.0
 */

/**

/**
 * @enum {string}
 * @value {string} info - Informational notification
 * @value {string} warning - Warning notification
 * @value {string} error - Error notification 
 * 
 * @since 0.1.0
 */
export type NotificationSeverity = "info" | "warning" | "error";

/**
 * Notification Action
 *
 * An action that can be taken on a notification
 *
 * @type {NotificationAction}
 * @value {string} label - The label of the action
 * @value {string} actionId - The id of the action (used to execute the action) with plugin namespacing
 *
 * @example
 * ```typescript
 * const action: NotificationAction = {
 *     label: "Click me",
 *     actionId: "myPlugin.click"
 * };
 * ```
 *
 * @since 0.1.0
 */
export type NotificationAction = {
  label: string;
  actionId: string;
};

/**
 * @type {Notification}
 *
 * @example
 * ```typescript
 * const notification: Notification = {
 *     id: "123",
 *     pluginName: "myPlugin",
 *     message: "This is a notification",
 *     timestamp: Date.now(),
 *     severity: "info",
 *     action: {
 *         label: "Click me",
 *         actionId: "myPlugin:click"
 *     }
 * };
 * ```
 */
export type Notification = {
  /**
   * The id of the notification
   * @type {string}
   */
  id: string;
  /**
   * The name of the plugin that created the notification
   * @type {string}
   */
  pluginName: string;
  /**
   * The message of the notification
   * @type {string}
   */
  message: string;
  /**
   * The timestamp of the notification
   * @type {number}
   */
  timestamp: number;
  /**
   * The severity of the notification
   *
   * @default "info"
   * @type {NotificationSeverity}
   */
  severity?: NotificationSeverity;
  /**
   * The action of the notification
   * @type {NotificationAction}
   */
  action?: NotificationAction;
};
