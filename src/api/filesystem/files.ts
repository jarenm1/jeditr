import { invoke } from "@tauri-apps/api/core";
import type { FileMetadata, TextEdit, TextEditOptions } from "@api/types";

/**
 * Read the contents of a file
 *
 * @example
 * ```typescript
 * try {
 *   const content = await readFile('./src/main.ts')
 *   console.log('File content:', content)
 * } catch (error) {
 *   console.error('Failed to read file:', error)
 * }
 * ```
 *
 * @param path - The path to the file
 *
 * @returns `string` - The content of the file
 * @throws {string} - Error message if read fails
 * @since 0.1.0
 */
export async function readFile(path: string): Promise<string> {
  return invoke("read_file", { path });
}

/**
 * Write content to a file (creates directories if needed)
 *
 * @example
 * ```typescript
 * try {
 *   await writeFile('./src/new-file.ts', 'console.log("Hello World!")')
 *   console.log('File saved successfully')
 * } catch (error) {
 *   console.error('Failed to save file:', error)
 * }
 * ```
 *
 * @param path - The path to the file
 * @param content - The content to write to the file
 *
 * @throws {string} - Error message if write fails
 * @since 0.1.0
 */
export async function writeFile(path: string, content: string): Promise<void> {
  return invoke("save_file", { path, content });
}

/**
 * Check if a file exists
 *
 * @example
 * ```typescript
 * const exists = await fileExists('./src/main.ts')
 * console.log(exists)
 * ```
 *
 * @param path - The path to the file
 *
 * @throws {string} - Error message if file doesn't exist
 * @since 0.1.0
 */
export async function fileExists(path: string): Promise<boolean> {
  return invoke("file_exists", { path });
}

/**
 * Get comprehensive file metadata information
 *
 * @example
 * ```typescript
 * const metadata = await getFileMetadata('./src/main.ts')
 * console.log(`File: ${metadata.name}`)
 * console.log(`Size: ${metadata.size} bytes`)
 * console.log(`Language: ${metadata.language}`)
 * console.log(`Modified: ${metadata.lastModified}`)
 * console.log(`Is Directory: ${metadata.isDirectory}`)
 * ```
 *
 * @param path - The path to the file
 *
 * @returns {Promise<FileMetadata>} Object containing:
 * - `path`: Full file path (string)
 * - `name`: File name with extension (string)
 * - `size`: File size in bytes (number)
 * - `lastModified`: Last modification date (Date)
 * - `isDirectory`: Whether it's a directory (boolean)
 * - `language`: Detected programming language (string | undefined)
 *
 * @throws {string} - Error message if file doesn't exist or metadata retrieval fails
 * @since 0.1.0
 */
export async function getFileMetadata(path: string): Promise<FileMetadata> {
  return invoke("get_file_metadata", { path });
}

/**
 * Copy a file
 *
 * @example
 * ```typescript
 * await copyFile('./src/main.ts', './dist/main.ts')
 * ```
 *
 * @param sourcePath - The path to the file to copy
 * @param destinationPath - The path to the file to copy to
 *
 * @returns `void`
 * @throws {string} - Error message if copy fails
 * @since 0.1.0
 */
export async function copyFile(
  sourcePath: string,
  destinationPath: string,
): Promise<void> {
  return invoke("copy_file", { sourcePath, destinationPath });
}

/**
 * Move/rename a file
 *
 * @example
 * ```typescript
 * await moveFile('./src/main.ts', './dist/main.ts')
 * ```
 *
 * @param sourcePath - The path to the file to move
 * @param destinationPath - The path to the file to move to
 *
 * @returns `void`
 * @throws {string} Error message if move fails
 * @since 0.1.0
 */
export async function moveFile(
  sourcePath: string,
  destinationPath: string,
): Promise<void> {
  return invoke("move_file", { sourcePath, destinationPath });
}

/**
 * Delete a file
 *
 * @example
 * ```typescript
 * await deleteFile('./src/main.ts')
 * ```
 *
 * @param path - The path to the file to delete
 *
 * @returns `void`
 * @throws {string} Error message if delete fails
 * @since 0.1.0
 */
export async function deleteFile(path: string): Promise<void> {
  return invoke("delete_file", { path });
}

/**
 * Apply a text edit to a file at a specific position/range
 *
 * @example
 * ```typescript
 * // Replace a specific range
 * await applyTextEdit('./src/config.ts', {
 *   range: { start: { line: 0, column: 0 }, end: { line: 0, column: 10 } },
 *   newText: 'const API_URL = "production.com"'
 * })
 *
 * // Insert at a position (empty range)
 * await applyTextEdit('./src/utils.ts', {
 *   range: { start: { line: 5, column: 0 }, end: { line: 5, column: 0 } },
 *   newText: 'console.log("debug");\n'
 * })
 *
 * // Delete a range (empty newText)
 * await applyTextEdit('./src/old.ts', {
 *   range: { start: { line: 10, column: 0 }, end: { line: 15, column: 0 } },
 *   newText: ''
 * })
 * ```
 *
 * @param path - The path to the file
 * @param edit - The text edit to apply
 * @param options - Edit options
 *
 * @throws {string} Error message if edit fails
 * @since 0.1.0
 */
export async function applyTextEdit(
  path: string,
  edit: TextEdit,
  options: TextEditOptions = {},
): Promise<void> {
  const content = await readFile(path);
  const lines = content.split("\n");

  const { range, newText } = edit;
  const { validateRange = true } = options;

  // Validate range if requested
  if (validateRange) {
    if (range.start.line < 0 || range.start.line >= lines.length) {
      throw `Start line ${range.start.line} is out of bounds (0-${lines.length - 1})`;
    }
    if (range.end.line < 0 || range.end.line >= lines.length) {
      throw `End line ${range.end.line} is out of bounds (0-${lines.length - 1})`;
    }
    if (
      range.start.column < 0 ||
      range.start.column > lines[range.start.line].length
    ) {
      throw `Start column ${range.start.column} is out of bounds`;
    }
    if (
      range.end.column < 0 ||
      range.end.column > lines[range.end.line].length
    ) {
      throw `End column ${range.end.column} is out of bounds`;
    }
  }

  // Apply the edit
  const startLine = range.start.line;
  const endLine = range.end.line;
  const startCol = range.start.column;
  const endCol = range.end.column;

  if (startLine === endLine) {
    // Single line edit
    const line = lines[startLine];
    lines[startLine] = line.slice(0, startCol) + newText + line.slice(endCol);
  } else {
    // Multi-line edit
    const firstLine = lines[startLine].slice(0, startCol);
    const lastLine = lines[endLine].slice(endCol);
    const newLines = newText.split("\n");

    // Replace the range with new content
    if (newLines.length === 1) {
      lines.splice(
        startLine,
        endLine - startLine + 1,
        firstLine + newText + lastLine,
      );
    } else {
      lines.splice(
        startLine,
        endLine - startLine + 1,
        firstLine + newLines[0],
        ...newLines.slice(1, -1),
        newLines[newLines.length - 1] + lastLine,
      );
    }
  }

  await writeFile(path, lines.join("\n"));
}

/**
 * Apply multiple text edits to a file in a single operation
 *
 * @example
 * ```typescript
 * await applyTextEdits('./src/refactor.ts', [
 *   { range: { start: { line: 0, column: 0 }, end: { line: 0, column: 3 } }, newText: 'let' },
 *   { range: { start: { line: 5, column: 10 }, end: { line: 5, column: 15 } }, newText: 'newName' }
 * ])
 * ```
 *
 * Note: Edits are applied in reverse order to avoid position shifting
 *
 * @param path - The path to the file
 * @param edits - Array of text edits to apply
 * @param options - Edit options
 *
 * @throws {string} Error message if any edit fails
 * @since 0.1.0
 */
export async function applyTextEdits(
  path: string,
  edits: TextEdit[],
  options: TextEditOptions = {},
): Promise<void> {
  if (edits.length === 0) return;

  const content = await readFile(path);
  const lines = content.split("\n");

  // Sort edits in reverse order (bottom to top) to avoid position shifting
  const sortedEdits = [...edits].sort((a, b) => {
    if (a.range.start.line !== b.range.start.line) {
      return b.range.start.line - a.range.start.line;
    }
    return b.range.start.column - a.range.start.column;
  });

  // Apply each edit to the lines array
  for (const edit of sortedEdits) {
    const { range, newText } = edit;
    const { validateRange = true } = options;

    // Validate range if requested
    if (validateRange) {
      if (range.start.line < 0 || range.start.line >= lines.length) {
        throw `Start line ${range.start.line} is out of bounds (0-${lines.length - 1})`;
      }
      if (range.end.line < 0 || range.end.line >= lines.length) {
        throw `End line ${range.end.line} is out of bounds (0-${lines.length - 1})`;
      }
    }

    const startLine = range.start.line;
    const endLine = range.end.line;
    const startCol = range.start.column;
    const endCol = range.end.column;

    if (startLine === endLine) {
      // Single line edit
      const line = lines[startLine];
      lines[startLine] = line.slice(0, startCol) + newText + line.slice(endCol);
    } else {
      // Multi-line edit
      const firstLine = lines[startLine].slice(0, startCol);
      const lastLine = lines[endLine].slice(endCol);
      const newLines = newText.split("\n");

      if (newLines.length === 1) {
        lines.splice(
          startLine,
          endLine - startLine + 1,
          firstLine + newText + lastLine,
        );
      } else {
        lines.splice(
          startLine,
          endLine - startLine + 1,
          firstLine + newLines[0],
          ...newLines.slice(1, -1),
          newLines[newLines.length - 1] + lastLine,
        );
      }
    }
  }

  await writeFile(path, lines.join("\n"));
}

/**
 * Insert text at a specific position in a file
 *
 * @example
 * ```typescript
 * await insertInFile('./src/main.ts', { line: 1, column: 1 }, 'console.log("Hello World!")')
 * ```
 *
 * @param path - The path to the file
 * @param position - The position to insert the text
 * @param text - The text to insert
 *
 * @returns `void`
 * @throws {string} Error message if insert fails
 * @since 0.1.0
 */
export async function insertInFile(
  path: string,
  position: { line: number; column: number },
  text: string,
): Promise<void> {
  const content = await readFile(path);
  const lines = content.split("\n");

  if (position.line >= lines.length) {
    // Extend lines if needed
    while (lines.length <= position.line) {
      lines.push("");
    }
  }

  const line = lines[position.line];
  const newLine =
    line.slice(0, position.column) + text + line.slice(position.column);
  lines[position.line] = newLine;

  await writeFile(path, lines.join("\n"));
}

/**
 * Read file as binary (base64)
 *
 * @example
 * ```typescript
 * const data = await readBinaryFile('./src/main.ts')
 * console.log(data)
 * ```
 *
 * @param path - The path to the file
 *
 * @returns `string`
 * @throws {string} Error message if read fails
 * @since 0.1.0
 */
export async function readBinaryFile(path: string): Promise<string> {
  return invoke("read_binary_file", { path });
}

/**
 * Write binary file from base64
 *
 * @example
 * ```typescript
 * await writeBinaryFile('./src/main.ts', 'console.log("Hello World!")')
 * ```
 *
 * @param path - The path to the file
 * @param data - The data to write to the file
 *
 * @returns `void`
 * @throws {string} Error message if write fails
 * @since 0.1.0
 */
export async function writeBinaryFile(
  path: string,
  data: string,
): Promise<void> {
  return invoke("write_binary_file", { path, data });
}

/**
 * Detect language from file path
 */
function detectLanguageFromPath(path: string): string | undefined {
  const extension = path.split(".").pop()?.toLowerCase();

  const languageMap: Record<string, string> = {
    js: "javascript",
    jsx: "javascript",
    ts: "typescript",
    tsx: "typescript",
    py: "python",
    rs: "rust",
    go: "go",
    java: "java",
    cpp: "cpp",
    c: "c",
    cs: "csharp",
    php: "php",
    rb: "ruby",
    swift: "swift",
    kt: "kotlin",
    dart: "dart",
    html: "html",
    css: "css",
    scss: "scss",
    sass: "sass",
    less: "less",
    json: "json",
    xml: "xml",
    yaml: "yaml",
    yml: "yaml",
    toml: "toml",
    md: "markdown",
    txt: "plaintext",
    sh: "shell",
    bash: "shell",
    zsh: "shell",
    fish: "shell",
  };

  return extension ? languageMap[extension] : undefined;
}
