// Terminal API - for programmatic terminal interaction and reading
import { invoke } from "@tauri-apps/api/core";
import type {
  TerminalSession,
  TerminalOutput,
  TerminalReadOptions,
  TerminalCommandResult,
} from "../types";

/**
 * @fileoverview Terminal API for Agent Plugins
 *
 * This API provides programmatic access to terminal sessions for AI agents
 * and plugins. Unlike the UI terminal renderer, this focuses on:
 *
 * - **Reading terminal output** programmatically
 * - **Executing commands** and waiting for results
 * - **Managing terminal sessions** outside of the UI
 * - **Parsing command results** for automation
 *
 * **Use Cases:**
 * - AI agents that need to run and analyze shell commands
 * - Build tools that monitor compilation output
 * - Testing frameworks that run commands and check results
 * - Development tools that interact with CLI programs
 *
 * **Error Handling:**
 * All functions throw string error messages on failure.
 *
 * @since 0.1.0
 */

/**
 * Create a new terminal session for programmatic use
 *
 * @example
 * ```typescript
 * // Create a session for running commands
 * const session = await createTerminalSession()
 * console.log(`Created session: ${session.sessionId}`)
 *
 * // Run commands in this session
 * const result = await executeCommand(session.sessionId, 'ls -la')
 * console.log('Command output:', result.output)
 * ```
 *
 * @param options - Optional session configuration
 * @returns Promise resolving to session information
 * @throws {string} Error message if session creation fails
 */
export async function createTerminalSession(
  options: { shell?: string; workingDirectory?: string } = {},
): Promise<TerminalSession> {
  return invoke("create_terminal_session", { options });
}

/**
 * Get information about an existing terminal session
 *
 * @example
 * ```typescript
 * const session = await getTerminalSession('session-123')
 * if (session.isActive) {
 *   console.log(`Session running ${session.shell}`)
 * }
 * ```
 */
export async function getTerminalSession(
  sessionId: string,
): Promise<TerminalSession> {
  return invoke("get_terminal_session", { sessionId });
}

/**
 * List all active terminal sessions
 *
 * @example
 * ```typescript
 * const sessions = await listTerminalSessions()
 * console.log(`Found ${sessions.length} active sessions`)
 * ```
 */
export async function listTerminalSessions(): Promise<TerminalSession[]> {
  return invoke("list_terminal_sessions");
}

/**
 * Read terminal output from a session
 *
 * @example
 * ```typescript
 * // Read all output
 * const output = await readTerminalOutput('session-123')
 *
 * // Read only new output since last read
 * const newOutput = await readTerminalOutput('session-123', { onlyNew: true })
 *
 * // Read and filter for errors
 * const errors = await readTerminalOutput('session-123', {
 *   includeOutput: false,
 *   includeErrors: true
 * })
 *
 * // Search for specific patterns
 * const warnings = await readTerminalOutput('session-123', {
 *   filter: 'warning|warn',
 *   useRegex: true
 * })
 * ```
 *
 * @param sessionId - The terminal session ID
 * @param options - Options for filtering and limiting output
 * @returns Array of terminal output lines with metadata
 * @throws {string} Error message if session not found or read fails
 */
export async function readTerminalOutput(
  sessionId: string,
  options: TerminalReadOptions = {},
): Promise<TerminalOutput[]> {
  return invoke("read_terminal_output", { sessionId, options });
}

/**
 * Execute a command in a terminal session and wait for completion
 *
 * @example
 * ```typescript
 * // Execute a simple command
 * const result = await executeCommand('session-123', 'echo "Hello World"')
 * console.log('Output:', result.output.map(o => o.content).join('\n'))
 *
 * // Execute with timeout
 * try {
 *   const result = await executeCommand('session-123', 'npm install', {
 *     timeoutMs: 30000,
 *     captureOutput: true
 *   })
 *   if (result.exitStatus === 0) {
 *     console.log('Install successful!')
 *   }
 * } catch (error) {
 *   console.error('Command failed or timed out:', error)
 * }
 * ```
 *
 * @param sessionId - The terminal session ID
 * @param command - The command to execute
 * @param options - Execution options
 * @returns Promise resolving to command result with output
 * @throws {string} Error message if execution fails or times out
 */
export async function executeCommand(
  sessionId: string,
  command: string,
  options: {
    /** Timeout in milliseconds (default: 30000) */
    timeoutMs?: number;
    /** Whether to capture all output (default: true) */
    captureOutput?: boolean;
    /** Whether to wait for command completion (default: true) */
    waitForCompletion?: boolean;
  } = {},
): Promise<TerminalCommandResult> {
  return invoke("execute_terminal_command", { sessionId, command, options });
}

/**
 * Execute a command and return only when it completes with a specific condition
 *
 * @example
 * ```typescript
 * // Wait for compilation to finish
 * const result = await executeCommandUntil(
 *   'session-123',
 *   'npm run build',
 *   output => output.some(line =>
 *     line.content.includes('Build completed') ||
 *     line.content.includes('Build failed')
 *   ),
 *   { timeoutMs: 60000 }
 * )
 * ```
 *
 * @param sessionId - The terminal session ID
 * @param command - The command to execute
 * @param condition - Function that returns true when command should be considered complete
 * @param options - Execution options
 */
export async function executeCommandUntil(
  sessionId: string,
  command: string,
  condition: (output: TerminalOutput[]) => boolean,
  options: {
    timeoutMs?: number;
    checkIntervalMs?: number;
  } = {},
): Promise<TerminalCommandResult> {
  return invoke("execute_terminal_command_until", {
    sessionId,
    command,
    condition: condition.toString(),
    options,
  });
}

/**
 * Send raw input to a terminal session (without executing as a command)
 *
 * @example
 * ```typescript
 * // Send input to an interactive program
 * await sendTerminalInput('session-123', 'y\n') // Answer "yes" to a prompt
 *
 * // Send Ctrl+C
 * await sendTerminalInput('session-123', '\u0003')
 * ```
 */
export async function sendTerminalInput(
  sessionId: string,
  input: string,
): Promise<void> {
  return invoke("send_terminal_input", { sessionId, input });
}

/**
 * Clear the terminal output buffer for a session
 *
 * @example
 * ```typescript
 * await clearTerminalOutput('session-123')
 * ```
 */
export async function clearTerminalOutput(sessionId: string): Promise<void> {
  return invoke("clear_terminal_output", { sessionId });
}

/**
 * Terminate a terminal session
 *
 * @example
 * ```typescript
 * const session = await terminateTerminalSession('session-123')
 * console.log(`Session exited with status: ${session.exitStatus}`)
 * ```
 */
export async function terminateTerminalSession(
  sessionId: string,
): Promise<TerminalSession> {
  return invoke("terminate_terminal_session", { sessionId });
}

/**
 * Check if a command is still running in a session
 *
 * @example
 * ```typescript
 * const isRunning = await isCommandRunning('session-123')
 * if (isRunning) {
 *   console.log('Command still executing...')
 * }
 * ```
 */
export async function isCommandRunning(sessionId: string): Promise<boolean> {
  return invoke("is_terminal_command_running", { sessionId });
}

/**
 * Get the current working directory of a terminal session
 *
 * @example
 * ```typescript
 * const cwd = await getTerminalWorkingDirectory('session-123')
 * console.log(`Session working directory: ${cwd}`)
 * ```
 */
export async function getTerminalWorkingDirectory(
  sessionId: string,
): Promise<string> {
  return invoke("get_terminal_working_directory", { sessionId });
}

/**
 * Set the working directory for a terminal session
 *
 * @example
 * ```typescript
 * await setTerminalWorkingDirectory('session-123', '/path/to/project')
 * ```
 */
export async function setTerminalWorkingDirectory(
  sessionId: string,
  directory: string,
): Promise<void> {
  return invoke("set_terminal_working_directory", { sessionId, directory });
}
