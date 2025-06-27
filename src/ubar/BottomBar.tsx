import type React from "react";
import { useBottomBarStore } from "@ubar/ubarStore";
import { bottomBarRegistry } from "@ubar/ubarStore/bottomBarRegistry";
import { useEditorStore } from "@editor/editorStore";
import { LanguageWidget } from "@ubar/widgets/LanguageWidget";

export const BottomBar: React.FC = () => {
  const items = useBottomBarStore((state) => state.items);
  const { workspaces, activeWorkspaceId, getActivePaneId } = useEditorStore();

  // Get the currently active pane ID for the language widget
  const currentPaneId = activeWorkspaceId
    ? getActivePaneId(activeWorkspaceId)
    : null;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-8 bg-[var(--color-bg)] text-white flex items-center px-4 font-mono z-50 border-t border-[var(--color-tertiary)]">
      {/* Existing items from the old system */}
      {items.map((item) => (
        <div key={item.id} className="mr-6 flex items-center">
          <item.component />
        </div>
      ))}

      {/* New plugin registry items */}
      {bottomBarRegistry
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map((plugin) => (
          <div key={plugin.id} className="mr-6 flex items-center">
            {plugin.id === "language-widget" ? (
              <LanguageWidget paneId={currentPaneId} />
            ) : (
              plugin.render()
            )}
          </div>
        ))}
    </div>
  );
};
