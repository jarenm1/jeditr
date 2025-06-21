import { registerKeybind, unregisterKeybind } from "@services/keybinds";

// Type for plugin keybinds
export interface PluginKeybind {
	id: string; // should be namespaced, e.g. "plugin.myplugin.action"
	keys: string[];
	description?: string;
	handler: () => void;
}

// Plugin Keybind Registration API for plugins (main thread side)
export interface PluginKeybindRegistration {
	id: string;
	keys: string[];
	description?: string;
	action: string; // Action name to relay to the plugin worker
	pluginWorker: Worker; // Reference to the plugin's worker
}

/**
 * Register a keybind for a plugin.
 * @param keybind - The keybind to register.
 */
export function registerPluginKeybind(keybind: PluginKeybind) {
	// Optionally enforce/validate namespacing here
	registerKeybind(keybind);
}

/**
 * Register a keybind for a plugin. When the keybind is pressed, the action is relayed to the plugin worker.
 */
export function registerPluginKeybindWithAction({
	id,
	keys,
	description,
	action,
	pluginWorker,
}: PluginKeybindRegistration) {
	registerKeybind({
		id,
		keys,
		description,
		handler: () => {
			pluginWorker.postMessage({ type: "plugin-action", action });
		},
	});
}

/**
 * Unregister a keybind for a plugin.
 * @param id - The id of the keybind to unregister.
 */
export function unregisterPluginKeybind(id: string) {
	unregisterKeybind(id);
}
