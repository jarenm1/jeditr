import type React from "react";
import { useUtilityBarStore } from "./utilitybarStore";

/**
 * Main UtilityBar component that renders all registered widgets
 *
 * This replaces the old BottomBar component and uses the new widget registration system
 */
export const UtilityBar: React.FC = () => {
  const widgets = useUtilityBarStore((state) => state.getSortedWidgets());

  return (
    <div className="fixed bottom-0 left-0 right-0 h-8 bg-[var(--color-bg)] text-white flex items-center px-4 font-mono z-50 border-t border-[var(--color-tertiary)]">
      {widgets.map((widget) => (
        <div key={widget.id} className="mr-6 flex items-center">
          {widget.render()}
        </div>
      ))}
    </div>
  );
};
