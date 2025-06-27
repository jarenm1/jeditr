/**
 * Shared types used across API modules
 *
 * These types provide a consistent interface for all API operations
 * and ensure type safety throughout the application.
 */

/**
 * Represents a position in a text document (0-based indexing)
 *
 * @example
 * ```typescript
 * const position: Position = { line: 0, column: 5 } // First line, 6th character
 * ```
 */
export interface Position {
  line: number;
  column: number;
}

/**
 * Represents a range of text in a document
 *
 * @example
 * ```typescript
 * const range: Range = {
 *   start: { line: 0, column: 0 },
 *   end: { line: 0, column: 10 }
 * } // First 10 characters of first line
 * ```
 */
export interface Range {
  start: Position;
  end: Position;
}

/**
 * Represents a text selection with both range and content
 *
 * @example
 * ```typescript
 * const selection: Selection = {
 *   range: { start: { line: 0, column: 0 }, end: { line: 0, column: 5 } },
 *   text: "hello"
 * }
 * ```
 */
export interface Selection {
  range: Range;
  text: string;
}

/**
 * Comprehensive file system metadata information
 *
 * Contains all essential information about a file or directory,
 * including size, modification time, and detected programming language.
 *
 * @example
 * ```typescript
 * const fileInfo: FileMetadata = {
 *   path: './src/main.ts',           // Full path to the file
 *   name: 'main.ts',                 // Just the filename with extension
 *   size: 1024,                      // File size in bytes
 *   lastModified: new Date(),        // When file was last modified
 *   isDirectory: false,              // Whether this is a directory
 *   language: 'typescript'           // Auto-detected language (optional)
 * }
 * ```
 */
export interface FileMetadata {
  /** Full file path relative to workspace root */
  path: string;
  /** File name with extension (e.g., 'main.ts') */
  name: string;
  /** File size in bytes */
  size: number;
  /** Date when file was last modified */
  lastModified: Date;
  /** Whether this entry represents a directory */
  isDirectory: boolean;
  /** Auto-detected programming language based on file extension */
  language?: string;
}

export interface DirectoryEntry {
  path: string;
  name: string;
  type: "file" | "directory";
  children?: DirectoryEntry[];
}

// Editor types
export interface EditorTab {
  id: string;
  path: string;
  content: string;
  isDirty: boolean;
  language?: string;
  selection?: Selection;
}

export interface Language {
  name: string;
  extensions: string[];
  defaultFileExtension?: string;
  languageServerId?: string;
}

/**
 * Action button configuration for notifications
 *
 * @example
 * ```typescript
 * const action: NotificationAction = {
 *   label: 'Retry',
 *   actionId: 'myPlugin.retryOperation'
 * }
 * ```
 */
export interface NotificationAction {
  label: string;
  actionId: string;
}

/**
 * Notification configuration
 *
 * @example
 * ```typescript
 * const notification: Notification = {
 *   pluginName: 'myPlugin',
 *   message: 'File saved successfully!',
 *   severity: 'info',
 *   action: {
 *     label: 'Open File',
 *     actionId: 'myPlugin.openFile'
 *   }
 * }
 * ```
 */
export interface Notification {
  id?: string;
  pluginName: string;
  message: string;
  timestamp?: number;
  severity?: "info" | "warning" | "error";
  action?: NotificationAction;
}

export interface Modal {
  id?: string;
  pluginName: string;
  content: React.ReactNode;
  title?: string;
  closeable?: boolean;
}

// Keybind types
export interface Keybind {
  id: string;
  keys: string[];
  description?: string;
  handler: () => void;
}

export interface PluginKeybind {
  id: string;
  keys: string[];
  description?: string;
  action: string;
}

// Workspace types
export interface Workspace {
  id: string;
  name: string;
  path: string;
  lastOpened: Date;
  settings?: WorkspaceSettings;
}

export interface WorkspaceSettings {
  theme?: string;
  fontSize?: number;
  tabSize?: number;
  insertSpaces?: boolean;
  wordWrap?: boolean;
  lineNumbers?: boolean;
  minimap?: boolean;
}

// Search types
export interface SearchResult {
  path: string;
  line: number;
  column: number;
  text: string;
  context: string;
}

export interface SearchOptions {
  caseSensitive?: boolean;
  wholeWord?: boolean;
  regex?: boolean;
  includePattern?: string;
  excludePattern?: string;
  maxResults?: number;
}

/**
 * Represents a text edit operation at a specific position/range
 *
 * @example
 * ```typescript
 * const edit: TextEdit = {
 *   range: { start: { line: 0, column: 0 }, end: { line: 0, column: 5 } },
 *   newText: "hello world"
 * } // Replace first 5 characters of first line
 * ```
 */
export interface TextEdit {
  range: Range;
  newText: string;
}

/**
 * Options for applying text edits
 */
export interface TextEditOptions {
  /** Whether to validate that the range exists before applying */
  validateRange?: boolean;
  /** Whether to create the file if it doesn't exist */
  createIfNotExists?: boolean;
}

/**
 * Terminal session information and output data
 */
export interface TerminalSession {
  /** Unique session identifier */
  sessionId: string;
  /** Whether the session is currently active */
  isActive: boolean;
  /** Shell command being run */
  shell: string;
  /** Process ID of the shell */
  pid?: number;
  /** Session creation timestamp */
  startTime: Date;
  /** Session end timestamp (if terminated) */
  endTime?: Date;
  /** Exit status (if terminated) */
  exitStatus?: number;
}

/**
 * Terminal output line with metadata
 */
export interface TerminalOutput {
  /** Session that produced this output */
  sessionId: string;
  /** Output content */
  content: string;
  /** Whether this is stderr (true) or stdout (false) */
  isError: boolean;
  /** Timestamp when output was received */
  timestamp: Date;
  /** Line number in the session (0-based) */
  lineNumber: number;
}

/**
 * Options for reading terminal output
 */
export interface TerminalReadOptions {
  /** Maximum number of lines to return */
  maxLines?: number;
  /** Whether to include stderr output */
  includeErrors?: boolean;
  /** Whether to include stdout output */
  includeOutput?: boolean;
  /** Start reading from this line number (0-based) */
  startLine?: number;
  /** Filter output by content (regex supported) */
  filter?: string;
  /** Whether to treat filter as regex */
  useRegex?: boolean;
  /** Whether to return only new output since last read */
  onlyNew?: boolean;
}

/**
 * Terminal command execution result
 */
export interface TerminalCommandResult {
  /** The command that was executed */
  command: string;
  /** Session where command was executed */
  sessionId: string;
  /** All output lines from the command */
  output: TerminalOutput[];
  /** Exit status (if command completed) */
  exitStatus?: number;
  /** Whether the command is still running */
  isRunning: boolean;
  /** Command execution start time */
  startTime: Date;
  /** Command completion time (if finished) */
  endTime?: Date;
}
