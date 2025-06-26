// File search API
import type { SearchResult, SearchOptions } from '../types'
import { readFile } from './files'
import { listFiles, listGitFiles } from './directories'
import { invoke } from '@tauri-apps/api/core'

/**
 * Fuzzy search is used to search for text in files
 * 
 * @example
 * ```typescript
 * results.forEach(result => {
 *   console.log(`Found in ${result.path}:${result.line}:${result.column}`)
 *   console.log(`Context: ${result.context}`)
 * })
 * ```
 */
export async function searchInFiles(
  query: string,
  options: SearchOptions = {}
): Promise<SearchResult[]> {
  return invoke('fuzzy_search', { query, options })
}

/**
 * Search for files by name
 */
export async function searchFilesByName(
  query: string,
  options: { caseSensitive?: boolean; regex?: boolean } = {}
): Promise<string[]> {
  return invoke('search_for_files', { query, options })
}
