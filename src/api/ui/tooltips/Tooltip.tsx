import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useTooltipStore } from "./tooltipStore";
import type { Tooltip as TooltipType, TooltipPosition } from "./tooltipStore";

interface TooltipProps {
  tooltip: TooltipType;
  onPositionChange?: (id: string, position: TooltipPosition) => void;
}

const TooltipComponent: React.FC<TooltipProps> = ({
  tooltip,
  onPositionChange,
}) => {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [adjustedPosition, setAdjustedPosition] = useState(tooltip.position);

  // Smart positioning to keep tooltip in viewport
  useEffect(() => {
    if (!tooltipRef.current) return;

    const rect = tooltipRef.current.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    let { x, y } = tooltip.position;
    const padding = 10;

    // Adjust horizontal position
    if (x + rect.width + padding > viewport.width) {
      x = Math.max(padding, viewport.width - rect.width - padding);
    }
    if (x < padding) {
      x = padding;
    }

    // Adjust vertical position
    if (y + rect.height + padding > viewport.height) {
      y = Math.max(padding, y - rect.height - 20); // Show above cursor
    }
    if (y < padding) {
      y = padding;
    }

    const newPosition = { x, y };

    // Only update if position changed significantly
    if (
      Math.abs(newPosition.x - adjustedPosition.x) > 5 ||
      Math.abs(newPosition.y - adjustedPosition.y) > 5
    ) {
      setAdjustedPosition(newPosition);
      onPositionChange?.(tooltip.id, newPosition);
    }
  }, [tooltip.position, onPositionChange, tooltip.id, adjustedPosition]);

  if (!tooltip.visible) return null;

  return (
    <div
      ref={tooltipRef}
      className="fixed z-[9999] pointer-events-none select-none"
      style={{
        left: adjustedPosition.x,
        top: adjustedPosition.y,
        maxWidth: "400px",
        fontSize: "13px",
        lineHeight: "1.4",
      }}
    >
      <div
        className="bg-[var(--color-bg)] border border-[var(--color-secondary)] rounded shadow-lg p-3 whitespace-pre-wrap"
        style={{
          backgroundColor: "var(--color-bg)",
          borderColor: "var(--color-secondary)",
          color: "var(--color-fg)",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        }}
      >
        {Array.isArray(tooltip.content) ? (
          tooltip.content.map((line, index) => (
            <div key={index} className={index > 0 ? "mt-1" : ""}>
              {line || <br />}
            </div>
          ))
        ) : (
          <div>{tooltip.content}</div>
        )}
      </div>
    </div>
  );
};

/**
 * Global tooltip manager component
 * Add this to your main App component to render all tooltips
 */
export const Tooltips: React.FC = () => {
  const tooltips = useTooltipStore((state) => state.tooltips);
  const updateTooltipPosition = useTooltipStore(
    (state) => state.updateTooltipPosition,
  );

  return (
    <>
      {tooltips.map((tooltip) => (
        <TooltipComponent
          key={tooltip.id}
          tooltip={tooltip}
          onPositionChange={updateTooltipPosition}
        />
      ))}
    </>
  );
};

export default TooltipComponent;
