// Directory operations API
import { invoke } from "@tauri-apps/api/core";
import type { FileMetadata, DirectoryEntry } from "@api/types";

/**
 * List files in the current directory
 *
 * @example
 * ```typescript
 * const files = await listFiles()
 * files.forEach(file => {
 *   console.log(`${file.name} (${file.size} bytes)`)
 *   if (file.language) {
 *     console.log(`Language: ${file.language}`)
 *   }
 * })
 * ```
 */
export async function listFiles(): Promise<FileMetadata[]> {
  return invoke("list_files");
}

/**
 * List git tracked files (faster than listing all files in large projects)
 *
 * @example
 * ```typescript
 * try {
 *   const gitFiles = await listGitFiles()
 *   console.log(`Found ${gitFiles.length} git-tracked files`)
 * } catch (error) {
 *   console.log('Not a git repository, falling back to listFiles()')
 *   const allFiles = await listFiles()
 * }
 * ```
 */
export async function listGitFiles(): Promise<FileMetadata[]> {
  return invoke("list_git_files");
}

/**
 * Create a directory
 *
 * @example
 * ```typescript
 * await createDirectory('./src', 'components')
 * ```
 *
 * @param path - The path to the directory
 * @param name - The name of the directory
 *
 * @throws {string} - Error message if creation fails
 * @since 0.1.0
 */
export async function createDirectory(
  path: string,
  name: string,
): Promise<void> {
  return invoke("create_directory", { path, name });
}

/**
 * Check if a directory exists
 *
 * @example
 * ```typescript
 * const exists = await directoryExists('./src')
 * console.log(exists)
 * ```
 *
 * @param path - The path to the directory
 *
 * @returns {boolean} - Whether the directory exists
 * @throws {string} - Error message if something goes wrong
 * @since 0.1.0
 */
export async function directoryExists(path: string): Promise<boolean> {
  return invoke("directory_exists", { path });
}

/**
 * Remove a directory
 *
 * @example
 * ```typescript
 * await removeDirectory('./src', true)
 * ```
 *
 * @param path - The path to the directory
 * @param recursive - Whether to remove the directory recursively
 *
 * @throws {string} - Error message if removal fails
 */
export async function removeDirectory(
  path: string,
  recursive: boolean = false,
): Promise<void> {
  return invoke("remove_directory", { path, recursive });
}

/**
 * Get directory contents as a tree structure
 */
export async function getDirectoryTree(
  path: string = ".",
): Promise<DirectoryEntry> {
  return invoke("get_directory_tree", { path });
}

/**
 * Get directory size (recursive)
 */
export async function getDirectorySize(path: string): Promise<number> {
  return invoke("get_directory_size", { path });
}

/**
 * Copy directory recursively
 */
export async function copyDirectory(
  sourcePath: string,
  destinationPath: string,
): Promise<void> {
  return invoke("copy_directory", { sourcePath, destinationPath });
}

/**
 * Move directory
 *
 * @param sourcePath - The path to the directory to move
 * @param destinationPath - The path to move the directory to
 *
 * @throws {string} - Error message if move fails
 */
export async function moveDirectory(
  sourcePath: string,
  destinationPath: string,
): Promise<void> {
  return invoke("move_directory", { sourcePath, destinationPath });
}
