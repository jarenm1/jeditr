import type { BottomBarPlugin } from "@plugins/types";
import React from "react";

export const bottomBarRegistry: BottomBarPlugin[] = [];

export function registerBottomBarPlugin(plugin: BottomBarPlugin) {
  bottomBarRegistry.push(plugin);
}

// Register the language widget as a built-in bottom bar plugin
// Note: The actual paneId is dynamically passed in BottomBar component
registerBottomBarPlugin({
  id: "language-widget",
  render: () => React.createElement("div", {}, "Language widget placeholder"),
  order: 100, // High order to appear towards the right
});
