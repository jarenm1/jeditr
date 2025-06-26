// Tooltip API - lightweight hover tooltips for documentation and information
import type { TooltipPosition } from './tooltipStore'
import { 
  addTooltip, 
  removeTooltip, 
  clearAllTooltips,
  updateTooltipPosition,
  hideTooltip as hideTooltipStore,
  showTooltip as showTooltipStore,
  useTooltipStore 
} from './tooltipStore'

/**
 * Show a tooltip at a specific position
 * 
 * @example
 * ```typescript
 * // Show hover documentation
 * const tooltipId = showTooltip({
 *   content: 'function add(a: number, b: number): number',
 *   position: { x: 100, y: 200 },
 *   autoHide: false  // Keep visible until manually hidden
 * })
 * 
 * // Show array of documentation lines
 * showTooltip({
 *   content: [
 *     'function add(a: number, b: number): number',
 *     '',
 *     'Adds two numbers together and returns the result.'
 *   ],
 *   position: { x: mouseX, y: mouseY }
 * })
 * 
 * // Auto-hide after 5 seconds
 * showTooltip({
 *   content: 'Temporary info message',
 *   position: { x: 50, y: 50 },
 *   autoHide: true,
 *   hideDelay: 5000
 * })
 * ```
 */
export function showTooltip(options: {
  content: string | string[]
  position: TooltipPosition
  autoHide?: boolean
  hideDelay?: number
}): string {
  return addTooltip({
    content: options.content,
    position: options.position,
    visible: true,
    autoHide: options.autoHide ?? false,  // Default to manual hide for hover tooltips
    hideDelay: options.hideDelay ?? 3000
  })
}

/**
 * Show a hover tooltip that auto-hides when mouse leaves
 * Designed specifically for LSP hover documentation
 * 
 * @example
 * ```typescript
 * // LSP hover documentation
 * const tooltipId = showHoverTooltip({
 *   content: hoverInfo.contents,
 *   position: { x: mouseX, y: mouseY }
 * })
 * 
 * // Hide when mouse leaves the area
 * element.addEventListener('mouseleave', () => {
 *   hideTooltip(tooltipId)
 * })
 * ```
 */
export function showHoverTooltip(options: {
  content: string | string[]
  position: TooltipPosition
}): string {
  return showTooltip({
    content: options.content,
    position: options.position,
    autoHide: false  // Manual control for hover behavior
  })
}

/**
 * Show a temporary tooltip that auto-hides
 * Good for status messages or quick info
 */
export function showTemporaryTooltip(options: {
  content: string | string[]
  position: TooltipPosition
  hideDelay?: number
}): string {
  return showTooltip({
    content: options.content,
    position: options.position,
    autoHide: true,
    hideDelay: options.hideDelay ?? 3000
  })
}

/**
 * Hide a specific tooltip by ID
 */
export function hideTooltip(id: string): void {
  removeTooltip(id)
}

/**
 * Update tooltip position (useful for following mouse cursor)
 */
export function moveTooltip(id: string, position: TooltipPosition): void {
  updateTooltipPosition(id, position)
}

/**
 * Hide all tooltips
 */
export function hideAllTooltips(): void {
  clearAllTooltips()
}

/**
 * Toggle tooltip visibility without removing it
 */
export function toggleTooltip(id: string, visible: boolean): void {
  if (visible) {
    showTooltipStore(id)
  } else {
    hideTooltipStore(id)
  }
}

/**
 * Get all current tooltips
 */
export function getTooltips() {
  return useTooltipStore.getState().tooltips
}

/**
 * Check if any tooltips are currently visible
 */
export function hasVisibleTooltips(): boolean {
  const tooltips = useTooltipStore.getState().tooltips
  return tooltips.some(tooltip => tooltip.visible)
}

/**
 * Smart positioning helper - adjusts tooltip position to stay within viewport
 */
export function getSmartTooltipPosition(
  preferredPosition: TooltipPosition,
  tooltipSize: { width: number; height: number },
  viewport: { width: number; height: number } = { 
    width: window.innerWidth, 
    height: window.innerHeight 
  }
): TooltipPosition {
  let { x, y } = preferredPosition
  const padding = 10 // Padding from viewport edges
  
  // Adjust horizontal position
  if (x + tooltipSize.width + padding > viewport.width) {
    x = viewport.width - tooltipSize.width - padding
  }
  if (x < padding) {
    x = padding
  }
  
  // Adjust vertical position  
  if (y + tooltipSize.height + padding > viewport.height) {
    y = y - tooltipSize.height - padding // Show above instead of below
  }
  if (y < padding) {
    y = padding
  }
  
  return { x, y }
} 