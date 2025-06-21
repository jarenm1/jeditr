import { invoke } from "@tauri-apps/api/core";
import { listen, UnlistenFn } from "@tauri-apps/api/event";

export interface TerminalSessionEvents {
	onOutput?: (data: string) => void;
	onError?: (err: string) => void;
	onExit?: (exitStatus: number | null) => void;
}

export function startTerminalSession(
	sessionId: string,
	events: TerminalSessionEvents,
): () => void {
	// Start the shell
	invoke("start_shell", { sessionId });

	// Listen for events
	let unlistenOutput: UnlistenFn | undefined;
	let unlistenError: UnlistenFn | undefined;
	let unlistenExit: UnlistenFn | undefined;

	listen<any>("shell-output", (event) => {
		if (event.payload.session_id === sessionId && events.onOutput) {
			events.onOutput(event.payload.output);
		}
	}).then((unsub) => {
		unlistenOutput = unsub;
	});

	listen<any>("shell-error", (event) => {
		if (event.payload.session_id === sessionId && events.onError) {
			events.onError(event.payload.error);
		}
	}).then((unsub) => {
		unlistenError = unsub;
	});

	listen<any>("shell-exit", (event) => {
		if (event.payload.session_id === sessionId && events.onExit) {
			events.onExit(event.payload.exit_status);
		}
	}).then((unsub) => {
		unlistenExit = unsub;
	});

	// Return cleanup function
	return () => {
		if (unlistenOutput) unlistenOutput();
		if (unlistenError) unlistenError();
		if (unlistenExit) unlistenExit();
		invoke("close_shell", { sessionId });
	};
}

export function sendTerminalInput(sessionId: string, input: string) {
	invoke("send_input", { sessionId, input });
}
