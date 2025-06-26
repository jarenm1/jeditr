// LSP Hover Tooltip Integration
import { requestHover } from './lsp'
import { showHoverTooltip, hideTooltip } from '../ui/tooltips'
import type { Position } from '../types'

/**
 * Show LSP hover documentation as a tooltip
 * 
 * @example
 * ```typescript
 * // On mouse hover event
 * const tooltipId = await showLSPHoverTooltip({
 *   filePath: './src/main.ts',
 *   position: { line: 10, column: 5 },
 *   language: 'typescript',
 *   mousePosition: { x: event.clientX, y: event.clientY }
 * })
 * 
 * // Hide when mouse leaves
 * element.addEventListener('mouseleave', () => {
 *   if (tooltipId) hideTooltip(tooltipId)
 * })
 * ```
 */
export async function showLSPHoverTooltip(options: {
  filePath: string
  position: Position
  language: string
  mousePosition: { x: number; y: number }
}): Promise<string | null> {
  const { filePath, position, language, mousePosition } = options

  try {
    const hoverInfo = await requestHover(filePath, position, language)
    
    if (!hoverInfo || !hoverInfo.contents) {
      return null
    }

    // Convert hover contents to tooltip format
    const content = Array.isArray(hoverInfo.contents) 
      ? hoverInfo.contents 
      : [hoverInfo.contents]

    // Show tooltip slightly offset from cursor to avoid covering text
    const tooltipId = showHoverTooltip({
      content,
      position: {
        x: mousePosition.x + 10,
        y: mousePosition.y + 10
      }
    })

    return tooltipId
  } catch (error) {
    console.warn('Failed to show LSP hover tooltip:', error)
    return null
  }
}

/**
 * Create a hover handler for editor elements
 * Returns cleanup function to remove event listeners
 * 
 * @example
 * ```typescript
 * // Setup hover for an editor element
 * const cleanup = setupHoverHandler(editorElement, {
 *   getFileInfo: () => ({ filePath: './src/main.ts', language: 'typescript' }),
 *   getPositionFromEvent: (event) => ({ line: 10, column: 5 })
 * })
 * 
 * // Cleanup when component unmounts
 * return cleanup
 * ```
 */
export function setupHoverHandler(
  element: HTMLElement,
  options: {
    getFileInfo: () => { filePath: string; language: string }
    getPositionFromEvent: (event: MouseEvent) => Position | null
    hoverDelay?: number
  }
): () => void {
  let hoverTimeout: NodeJS.Timeout | null = null
  let currentTooltipId: string | null = null
  const { getFileInfo, getPositionFromEvent, hoverDelay = 500 } = options

  const handleMouseEnter = (event: MouseEvent) => {
    // Clear any existing timeout
    if (hoverTimeout) {
      clearTimeout(hoverTimeout)
    }

    hoverTimeout = setTimeout(async () => {
      const position = getPositionFromEvent(event)
      if (!position) return

      const { filePath, language } = getFileInfo()
      
      currentTooltipId = await showLSPHoverTooltip({
        filePath,
        position,
        language,
        mousePosition: { x: event.clientX, y: event.clientY }
      })
    }, hoverDelay)
  }

  const handleMouseLeave = () => {
    // Clear timeout if mouse leaves before delay
    if (hoverTimeout) {
      clearTimeout(hoverTimeout)
      hoverTimeout = null
    }

    // Hide current tooltip
    if (currentTooltipId) {
      hideTooltip(currentTooltipId)
      currentTooltipId = null
    }
  }

  const handleMouseMove = (event: MouseEvent) => {
    // Optional: Update tooltip position as mouse moves
    // This could be implemented if you want tooltips to follow the cursor
  }

  // Add event listeners
  element.addEventListener('mouseenter', handleMouseEnter)
  element.addEventListener('mouseleave', handleMouseLeave)

  // Return cleanup function
  return () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout)
    }
    if (currentTooltipId) {
      hideTooltip(currentTooltipId)
    }
    element.removeEventListener('mouseenter', handleMouseEnter)
    element.removeEventListener('mouseleave', handleMouseLeave)
  }
} 