// Command API - system for registering and executing commands
import { create } from "zustand";

export interface Command {
  id: string;
  name: string;
  description?: string;
  category?: string;
  keybind?: string[];
  handler: (...args: any[]) => void | Promise<void>;
  when?: () => boolean; // Condition for when command is available
}

interface CommandState {
  commands: Map<string, Command>;
  registerCommand: (command: Command) => void;
  unregisterCommand: (id: string) => void;
  executeCommand: (id: string, ...args: any[]) => Promise<void>;
  getCommand: (id: string) => Command | undefined;
  getAllCommands: () => Command[];
  getCommandsByCategory: (category: string) => Command[];
  searchCommands: (query: string) => Command[];
}

export const useCommandStore = create<CommandState>((set, get) => ({
  commands: new Map(),

  registerCommand: (command) => {
    set((state) => {
      const newCommands = new Map(state.commands);
      newCommands.set(command.id, command);
      return { commands: newCommands };
    });
  },

  unregisterCommand: (id) => {
    set((state) => {
      const newCommands = new Map(state.commands);
      newCommands.delete(id);
      return { commands: newCommands };
    });
  },

  executeCommand: async (id, ...args) => {
    const state = get();
    const command = state.commands.get(id);

    if (!command) {
      throw new Error(`Command not found: ${id}`);
    }

    // Check if command is available
    if (command.when && !command.when()) {
      throw new Error(`Command not available: ${id}`);
    }

    try {
      await command.handler(...args);
    } catch (error) {
      console.error(`Error executing command ${id}:`, error);
      throw error;
    }
  },

  getCommand: (id) => {
    return get().commands.get(id);
  },

  getAllCommands: () => {
    return Array.from(get().commands.values());
  },

  getCommandsByCategory: (category) => {
    return Array.from(get().commands.values()).filter(
      (cmd) => cmd.category === category,
    );
  },

  searchCommands: (query) => {
    const commands = Array.from(get().commands.values());
    const lowerQuery = query.toLowerCase();

    return commands.filter(
      (cmd) =>
        cmd.name.toLowerCase().includes(lowerQuery) ||
        cmd.description?.toLowerCase().includes(lowerQuery) ||
        cmd.id.toLowerCase().includes(lowerQuery),
    );
  },
}));

/**
 * Register a command for the command palette
 *
 * @example
 * ```typescript
 * registerCommand({
 *   id: 'file.new',
 *   name: 'New File',
 *   description: 'Create a new file',
 *   category: CommandCategories.FILE,
 *   keybind: ['Ctrl', 'N'],
 *   handler: async () => {
 *     const fileName = await showInputModal('File Name', 'Enter file name')
 *     await createNewFile(fileName)
 *   },
 *   when: () => getCurrentWorkspace() !== null
 * })
 * ```
 */
export function registerCommand(command: Command): void {
  useCommandStore.getState().registerCommand(command);
}

/**
 * Unregister a command by ID
 *
 * @example
 * ```typescript
 * unregisterCommand('file.new')
 * ```
 */
export function unregisterCommand(id: string): void {
  useCommandStore.getState().unregisterCommand(id);
}

/**
 * Execute a command by ID with optional arguments
 *
 * @example
 * ```typescript
 * // Execute without arguments
 * await executeCommand('file.save')
 *
 * // Execute with arguments
 * await executeCommand('file.open', '/path/to/file.txt')
 * ```
 */
export async function executeCommand(
  id: string,
  ...args: any[]
): Promise<void> {
  return useCommandStore.getState().executeCommand(id, ...args);
}

/**
 * Get a command by ID
 */
export function getCommand(id: string): Command | undefined {
  return useCommandStore.getState().getCommand(id);
}

/**
 * Get all registered commands
 */
export function getAllCommands(): Command[] {
  return useCommandStore.getState().getAllCommands();
}

/**
 * Get commands by category
 */
export function getCommandsByCategory(category: string): Command[] {
  return useCommandStore.getState().getCommandsByCategory(category);
}

/**
 * Search commands by name, description, or ID
 */
export function searchCommands(query: string): Command[] {
  return useCommandStore.getState().searchCommands(query);
}

/**
 * Register multiple commands at once
 */
export function registerCommands(commands: Command[]): void {
  commands.forEach((command) => registerCommand(command));
}

/**
 * Predefined command categories
 */
export const CommandCategories = {
  FILE: "file",
  EDIT: "edit",
  VIEW: "view",
  SEARCH: "search",
  GIT: "git",
  PLUGIN: "plugin",
  WORKSPACE: "workspace",
  DEBUG: "debug",
  TERMINAL: "terminal",
} as const;
