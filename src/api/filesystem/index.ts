// Filesystem API - handles all file and directory operations

/**
 * @fileoverview Filesystem API Error Handling
 *
 * All filesystem operations can throw errors in the following scenarios:
 *
 * **Error Type**: All errors are thrown as strings (not Error objects)
 *
 * **Common Error Scenarios**:
 * - File/directory not found: "Failed to read file: No such file or directory"
 * - Permission denied: "Failed to create directory: Permission denied"
 * - Invalid paths: "Failed to read file: Invalid path"
 * - Disk full: "Failed to write to temp file: No space left on device"
 * - Path already exists: "Failed to create directory: File exists"
 *
 * **Error Handling Patterns**:
 * ```typescript
 * // Standard exception handling
 * try {
 *   await createDirectory('./src', 'components')
 *   console.log('Success!')
 * } catch (error) {
 *   console.error('Operation failed:', error) // error is a string
 * }
 *
 * // Custom error-return pattern
 * const error = await createDirectory('./src', 'components').catch(err => err)
 * if (error) {
 *   console.error('Failed:', error)
 * } else {
 *   console.log('Success!')
 * }
 * ```
 *
 * @since 0.1.0
 */

export * from "./files";
export * from "./directories";
export * from "./search";
