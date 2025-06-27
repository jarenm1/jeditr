/**
 * Utility Bar API
 *
 * Provides a unified interface for managing the utility bar (bottom bar) including:
 * - Widget registration and management
 * - Built-in widgets for common functionality
 * - Store management for the utility bar state
 */

export * from "./utilitybarStore";
export { UtilityBar } from "./UtilityBar";

// Widget registration
export {
  registerUtilityBarWidget,
  unregisterUtilityBarWidget,
} from "./utilitybarStore";

// Built-in widget exports
export * from "./defaultWidgets";

// Initialization
export { initializeDefaultWidgets } from "./initializeDefaultWidgets";
